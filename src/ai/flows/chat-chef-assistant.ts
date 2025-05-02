'use server';
/**
 * @fileOverview Handles conversational cooking and recipe advice.
 *
 * - chatChefAssistant - A function to process chat messages and provide cooking advice.
 * - ChatChefAssistantInput - The input type for the chatChefAssistant function.
 * - ChatChefAssistantOutput - The return type for the chatChefAssistant function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { generateRecipe } from './generate-recipe'; // Allow calling other flows

// Define the structure for a single chat message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatChefAssistantInputSchema = z.object({
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  userUtterance: z.string().describe('The latest input from the user.'),
});
export type ChatChefAssistantInput = z.infer<typeof ChatChefAssistantInputSchema>;

const ChatChefAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe('The chatbot\'s response to the user\'s message.'),
  suggestedRecipe: z.object({ // Optional: Suggest a specific recipe
    recipeName: z.string(),
    instructions: z.string(),
    ingredients: z.string(),
  }).optional().describe('A specific recipe generated or suggested based on the conversation.'),
});
export type ChatChefAssistantOutput = z.infer<typeof ChatChefAssistantOutputSchema>;

export async function chatChefAssistant(input: ChatChefAssistantInput): Promise<ChatChefAssistantOutput> {
  return chatChefAssistantFlow(input);
}

// Define a tool for recipe generation if the conversation leads there
const generateRecipeTool = ai.defineTool(
  {
    name: 'generateRecipeTool',
    description: 'Generates a recipe based on a list of provided ingredients.',
    inputSchema: z.object({ ingredients: z.string().describe('Comma-separated list of ingredients.') }),
    outputSchema: z.object({
      recipeName: z.string(),
      instructions: z.string(),
      ingredients: z.string(),
    }),
  },
  async ({ ingredients }) => {
    // Call the existing generateRecipe flow
    return await generateRecipe({ ingredients });
  }
);


const prompt = ai.definePrompt({
  name: 'chatChefAssistantPrompt',
  input: { schema: ChatChefAssistantInputSchema },
  output: { schema: ChatChefAssistantOutputSchema },
  tools: [generateRecipeTool], // Make the tool available
  prompt: `You are a helpful and friendly AI Chef assistant. Engage in a conversation with the user about cooking, recipes, ingredients, and techniques.

Conversation History:
{{#each chatHistory}}
- {{role}}: {{content}}
{{/each}}
- user: {{{userUtterance}}}

Task:
1.  Analyze the user's latest message: "{{userUtterance}}".
2.  Provide a helpful, relevant, and conversational response (assistantResponse).
3.  If the user asks for a recipe based on specific ingredients, use the 'generateRecipeTool' to generate one and include its details in the 'suggestedRecipe' output field. Otherwise, focus on answering their cooking questions or continuing the conversation naturally.
4.  Keep responses concise and encouraging.

Example Interaction (Tool Use):
User: Can you make a recipe with chicken, broccoli, and rice?
Assistant: (Uses generateRecipeTool with "chicken, broccoli, rice") Okay, I can help with that! How about trying this simple Chicken, Broccoli, and Rice Stir-Fry? (output includes recipe details in suggestedRecipe)

Example Interaction (General Question):
User: How do I properly sear a steak?
Assistant: Great question! To get a good sear... (provides instructions in assistantResponse)
`,
});

const chatChefAssistantFlow = ai.defineFlow<
  typeof ChatChefAssistantInputSchema,
  typeof ChatChefAssistantOutputSchema
>(
  {
    name: 'chatChefAssistantFlow',
    inputSchema: ChatChefAssistantInputSchema,
    outputSchema: ChatChefAssistantOutputSchema,
  },
  async (input) => {
    const { output, toolRequests } = await prompt(input); // Allow tool usage

     // Basic fallback if the model doesn't generate a response
    if (!output) {
        return { assistantResponse: "Sorry, I couldn't process that request. Can you try rephrasing?" };
    }

    // Check if the model requested a tool call (generateRecipeTool)
    if (toolRequests?.length > 0) {
      const toolRequest = toolRequests[0]; // Assuming one tool request for now
      if (toolRequest.toolName === 'generateRecipeTool' && toolRequest.input) {
         // The model decided to generate a recipe. The tool's output is handled by Genkit automatically
         // The final output from the prompt *should* contain the generated recipe details if the prompt instructions were followed.
         // We might just return the output directly if the LLM formats it correctly.
         // If the LLM *only* returns the tool request result without conversational text, we might need to format it.
         if (output.suggestedRecipe && !output.assistantResponse) {
            output.assistantResponse = `Okay, I found a recipe for you: ${output.suggestedRecipe.recipeName}. Check the recipe details!`
         } else if (!output.suggestedRecipe && output.assistantResponse.includes("generateRecipeTool")) {
            // Fallback if LLM mentions tool but doesn't structure output correctly
            output.assistantResponse = "I tried to generate a recipe, but something went wrong in structuring the response. Could you ask again?"
         }
         return output;
      }
    }


    return output; // Return standard response if no tool was used or needed
  }
);
