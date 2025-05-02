'use server';

/**
 * @fileOverview Extracts a list of ingredients from an image using AI.
 *
 * - extractIngredients - A function that handles the ingredient extraction process.
 * - ExtractIngredientsInput - The input type for the extractIngredients function.
 * - ExtractIngredientsOutput - The return type for the extractIngredients function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExtractIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractIngredientsInput = z.infer<typeof ExtractIngredientsInputSchema>;

const ExtractIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients extracted from the image.'),
});
export type ExtractIngredientsOutput = z.infer<typeof ExtractIngredientsOutputSchema>;

export async function extractIngredients(input: ExtractIngredientsInput): Promise<ExtractIngredientsOutput> {
  return extractIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractIngredientsPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients extracted from the image.'),
    }),
  },
  prompt: `You are an expert in identifying food ingredients from images.

  Analyze the image and extract a list of ingredients that are present in the image.

  Image: {{media url=photoDataUri}}
  Ingredients:`,
});

const extractIngredientsFlow = ai.defineFlow<
  typeof ExtractIngredientsInputSchema,
  typeof ExtractIngredientsOutputSchema
>({
  name: 'extractIngredientsFlow',
  inputSchema: ExtractIngredientsInputSchema,
  outputSchema: ExtractIngredientsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
