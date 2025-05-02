'use server';

/**
 * @fileOverview Generates a recipe based on a list of ingredients provided by the user.
 *
 * - generateRecipe - A function that generates a recipe based on the ingredients.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available for use in the recipe.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  instructions: z.string().describe('The cooking instructions for the generated recipe.'),
  ingredients: z.string().describe('A comma-separated list of ingredients needed for the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {
    schema: z.object({
      ingredients: z
        .string()
        .describe('A comma-separated list of ingredients available for use in the recipe.'),
    }),
  },
  output: {
    schema: z.object({
      recipeName: z.string().describe('The name of the generated recipe.'),
      instructions: z.string().describe('The cooking instructions for the generated recipe.'),
      ingredients: z.string().describe('A comma-separated list of ingredients needed for the recipe.'),
    }),
  },
  prompt: `You are a world-class chef that can create delicious recipes based on a provided list of ingredients.

  Given the following ingredients, generate a unique and easy-to-follow recipe. Do not include steps about gathering the ingredients, assume the chef has all the ingredients available.

  Ingredients: {{{ingredients}}}
  `,
});

const generateRecipeFlow = ai.defineFlow<
  typeof GenerateRecipeInputSchema,
  typeof GenerateRecipeOutputSchema
>({
  name: 'generateRecipeFlow',
  inputSchema: GenerateRecipeInputSchema,
  outputSchema: GenerateRecipeOutputSchema,
},
async input => {
  const {output} = await generateRecipePrompt(input);
  return output!;
});
