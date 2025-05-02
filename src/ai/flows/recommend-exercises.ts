'use server';
/**
 * @fileOverview Recommends exercises based on user inputs.
 *
 * - recommendExercises - A function to generate exercise recommendations.
 * - RecommendExercisesInput - The input type for the recommendExercises function.
 * - RecommendExercisesOutput - The return type for the recommendExercises function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const RecommendExercisesInputSchema = z.object({
  preferences: z.array(z.string()).describe('Preferred types of exercise (e.g., yoga, strength training, cardio, home-based).'),
  goals: z.array(z.string()).describe('Fitness goals (e.g., weight loss, muscle gain, flexibility, endurance).'),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('User\'s current fitness level.'),
  availableTime: z.string().describe('Time available for exercise (e.g., "30 minutes", "1 hour", "short bursts").'),
  location: z.enum(['Home', 'Gym', 'Outdoors']).optional().describe('Preferred location for exercise.'),
});
export type RecommendExercisesInput = z.infer<typeof RecommendExercisesInputSchema>;

const ExerciseSchema = z.object({
    name: z.string().describe('Name of the exercise.'),
    description: z.string().describe('Brief description or instructions.'),
    sets: z.string().optional().describe('Number of sets (e.g., "3 sets").'),
    reps: z.string().optional().describe('Number of repetitions (e.g., "10-12 reps").'),
    duration: z.string().optional().describe('Duration for the exercise (e.g., "30 seconds", "5 minutes").'),
    category: z.string().optional().describe('Category like Cardio, Strength, Flexibility.'),
});

const RecommendExercisesOutputSchema = z.object({
  suggestedRoutine: z.array(ExerciseSchema).describe('A list of suggested exercises forming a potential routine.'),
  notes: z.string().optional().describe('Additional notes or advice regarding the routine (e.g., warm-up, cool-down).'),
});
export type RecommendExercisesOutput = z.infer<typeof RecommendExercisesOutputSchema>;

export async function recommendExercises(input: RecommendExercisesInput): Promise<RecommendExercisesOutput> {
  return recommendExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendExercisesPrompt',
  input: { schema: RecommendExercisesInputSchema },
  output: { schema: RecommendExercisesOutputSchema },
  prompt: `You are an expert fitness trainer. Generate a suitable exercise routine based on the user's profile.

User Profile:
- Preferences: {{#each preferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Goals: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Fitness Level: {{{fitnessLevel}}}
- Available Time: {{{availableTime}}}
{{#if location}}- Location: {{{location}}}{{/if}}

Task:
1.  Create a list of specific exercises (suggestedRoutine) that align with the user's preferences, goals, fitness level, and available time.
2.  For each exercise, provide its name, a brief description/instruction, and relevant details like sets, reps, or duration where applicable. Assign a category (Cardio, Strength, Flexibility etc.)
3.  Include optional general notes (notes), such as recommending a warm-up or cool-down, or modifying exercises.

Ensure the routine is balanced and appropriate for the specified fitness level and time constraint. If 'Home' location is specified, prioritize exercises requiring minimal or common household equipment.
`,
});

const recommendExercisesFlow = ai.defineFlow<
  typeof RecommendExercisesInputSchema,
  typeof RecommendExercisesOutputSchema
>(
  {
    name: 'recommendExercisesFlow',
    inputSchema: RecommendExercisesInputSchema,
    outputSchema: RecommendExercisesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
     if (!output) {
        return { suggestedRoutine: [], notes: "Sorry, I couldn't generate recommendations based on that input. Please try adjusting your preferences." };
    }
    // Ensure suggestedRoutine is always an array, even if the model fails partially
    if (!Array.isArray(output.suggestedRoutine)) {
        output.suggestedRoutine = [];
         output.notes = output.notes || "Could not generate specific exercises, please refine your request.";
    }
    return output;
  }
);
