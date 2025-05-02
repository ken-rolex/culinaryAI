'use server';
/**
 * @fileOverview Handles conversational diet plan customization.
 *
 * - chatDietAssistant - A function to process chat messages and provide diet advice.
 * - ChatDietAssistantInput - The input type for the chatDietAssistant function.
 * - ChatDietAssistantOutput - The return type for the chatDietAssistant function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

// Define the structure for a single chat message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatDietAssistantInputSchema = z.object({
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  userPreferences: z.object({
        goal: z.string().optional().describe('User goal (e.g., weight loss, muscle gain)'),
        dietaryRestrictions: z.array(z.string()).optional().describe('e.g., vegetarian, gluten-free'),
        allergies: z.array(z.string()).optional().describe('Food allergies'),
        lifestyle: z.string().optional().describe('e.g., busy schedule, student, athlete'),
    }).optional().describe('Current known user preferences.'),
  currentDietPlan: z.string().optional().describe('The current diet plan being discussed or modified, if any.'),
});
export type ChatDietAssistantInput = z.infer<typeof ChatDietAssistantInputSchema>;

const ChatDietAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe('The chatbot\'s response to the user\'s message.'),
  updatedDietPlanSnippet: z.string().optional().describe('A snippet or the full updated diet plan based on the conversation.'),
  suggestedActions: z.array(z.string()).optional().describe('Suggested next actions or questions for the user.'),
});
export type ChatDietAssistantOutput = z.infer<typeof ChatDietAssistantOutputSchema>;

export async function chatDietAssistant(input: ChatDietAssistantInput): Promise<ChatDietAssistantOutput> {
  return chatDietAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatDietAssistantPrompt',
  input: { schema: ChatDietAssistantInputSchema },
  output: { schema: ChatDietAssistantOutputSchema },
  prompt: `You are a friendly and knowledgeable diet assistant chatbot. Your goal is to help users customize their diet plan through conversation.

Context:
- User Goal: {{{userPreferences.goal}}}
- Dietary Restrictions: {{#each userPreferences.dietaryRestrictions}}{{{this}}}, {{/each}}
- Allergies: {{#each userPreferences.allergies}}{{{this}}}, {{/each}}
- Lifestyle: {{{userPreferences.lifestyle}}}
- Current Diet Plan Draft: {{{currentDietPlan}}}

Conversation History:
{{#each chatHistory}}
- {{role}}: {{content}}
{{/each}}

Task:
1.  Analyze the latest user message in the context of the conversation history and user preferences.
2.  Provide a helpful and relevant response (assistantResponse).
3.  If the user requests changes to the diet plan or provides information that affects it, suggest modifications or generate an updated snippet (updatedDietPlanSnippet). Focus on actionable advice and realistic meal suggestions.
4.  Optionally, suggest next steps or clarifying questions to keep the conversation going (suggestedActions).

Keep responses concise and easy to understand. Adapt the plan dynamically based on the user's input during the chat.
`,
});

const chatDietAssistantFlow = ai.defineFlow<
  typeof ChatDietAssistantInputSchema,
  typeof ChatDietAssistantOutputSchema
>(
  {
    name: 'chatDietAssistantFlow',
    inputSchema: ChatDietAssistantInputSchema,
    outputSchema: ChatDietAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Basic fallback if the model doesn't generate a response
    if (!output) {
        return { assistantResponse: "Sorry, I couldn't process that request. Can you try rephrasing?" };
    }
    return output;
  }
);
