
'use server';

/**
 * @fileOverview Generates a personalized health plan based on user inputs including age, weight, height, BMI, status, and an optional photo.
 *
 * - generateHealthPlan - A function that generates the health plan.
 * - GenerateHealthPlanInput - The input type for the generateHealthPlan function.
 * - GenerateHealthPlanOutput - The return type for the generateHealthPlan function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateHealthPlanInputSchema = z.object({
  age: z.number().int().positive().describe('The age of the user in years.'),
  weight: z.number().positive().describe('The weight of the user in kilograms.'),
  height: z.number().int().positive().describe('The height of the user in centimeters.'),
  bmi: z.number().positive().describe('The calculated Body Mass Index (BMI) of the user.'),
  status: z.enum(["Underweight", "Fit", "Overweight", "Obese"]).describe('The health status determined by BMI (Underweight, Fit, Overweight, Obese).'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Use this for visual assessment if provided."
    ),
});
export type GenerateHealthPlanInput = z.infer<typeof GenerateHealthPlanInputSchema>;

const GenerateHealthPlanOutputSchema = z.object({
  visualFeedback: z.string().optional().describe('Feedback based on the visual assessment from the photo, if provided. Comment on general appearance related to the provided status (e.g., "Appears consistent with the Overweight status."). Avoid making definitive medical diagnoses.'),
  dietPlan: z.string().describe('A detailed, actionable diet plan tailored to the user\'s profile and health status. Provide specific meal suggestions or guidelines for breakfast, lunch, dinner, and snacks.'),
  suggestions: z.string().describe('General health and lifestyle suggestions (e.g., exercise recommendations, hydration tips, sleep advice) based on the user\'s profile and status.'),
});
export type GenerateHealthPlanOutput = z.infer<typeof GenerateHealthPlanOutputSchema>;

export async function generateHealthPlan(input: GenerateHealthPlanInput): Promise<GenerateHealthPlanOutput> {
  return generateHealthPlanFlow(input);
}

// Use a model capable of multimodal input if an image is provided
const getModel = (input: GenerateHealthPlanInput) => {
    return input.photoDataUri ? 'googleai/gemini-1.5-flash' : ai.getModel(); // Default model if no image
};


const prompt = ai.definePrompt({
  name: 'generateHealthPlanPrompt',
  input: {
    schema: GenerateHealthPlanInputSchema,
  },
  output: {
    schema: GenerateHealthPlanOutputSchema,
  },
  // Use Handlebars templating for dynamic content
  prompt: `You are a helpful AI health assistant. Analyze the following user data to generate a personalized health plan.

User Data:
- Age: {{{age}}} years
- Weight: {{{weight}}} kg
- Height: {{{height}}} cm
- BMI: {{{bmi}}}
- Health Status: {{{status}}}

{{#if photoDataUri}}
User Photo:
{{media url=photoDataUri}}

Based on the photo (if provided) and the data, provide visual feedback. Comment generally on appearance in relation to the status, but DO NOT make medical claims or diagnoses based solely on the image. For example: "The image appears consistent with the provided 'Overweight' status." or "Visual assessment is limited, but the data indicates 'Fit'."
{{/if}}

Task:
1. {{#if photoDataUri}}Provide brief visual feedback based *only* on the image and its consistency with the provided status.{{else}}Visual feedback is not applicable as no photo was provided.{{/if}}
2. Create a detailed, actionable Diet Plan suitable for a {{{age}}}-year-old with a BMI of {{{bmi}}} (Status: {{{status}}}). Include suggestions for breakfast, lunch, dinner, and snacks. Focus on healthy, balanced meals.
3. Provide general Health Suggestions including exercise recommendations (type, frequency, duration), hydration advice, and other relevant lifestyle tips for someone with the status '{{{status}}}'.

Format the output clearly under the headings: "Visual Feedback", "Diet Plan", and "Suggestions". Be encouraging and supportive.`,
});


const generateHealthPlanFlow = ai.defineFlow<
  typeof GenerateHealthPlanInputSchema,
  typeof GenerateHealthPlanOutputSchema
>({
  name: 'generateHealthPlanFlow',
  inputSchema: GenerateHealthPlanInputSchema,
  outputSchema: GenerateHealthPlanOutputSchema,
},
async input => {
  const modelToUse = getModel(input);
  const { output } = await prompt(input, { model: modelToUse });

  // If no photo was provided, ensure the visualFeedback field is omitted or explicitly null/undefined in the final output
  // Genkit's Zod schema handling might automatically omit optional fields if not present in the LLM output.
  // If the LLM includes a placeholder like "Visual feedback is not applicable...", we might want to remove it.
  if (!input.photoDataUri && output?.visualFeedback) {
      // Optional: Clean up placeholder text if necessary, depending on LLM behavior
      if (output.visualFeedback.includes("not applicable")) {
           // output.visualFeedback = undefined; // Or set to empty string, null depending on desired behavior
      }
  }


  return output!;
});

