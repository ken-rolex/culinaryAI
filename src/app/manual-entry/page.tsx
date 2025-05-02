
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { generateRecipe, GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { RecipeDisplay } from '@/components/recipe-display';
import { useToast } from "@/hooks/use-toast";


const FormSchema = z.object({
  ingredients: z.string().min(3, {
    message: 'Please enter at least one ingredient (minimum 3 characters).',
  }),
});

export default function ManualEntryPage() {
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ingredients: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setRecipe(null); // Clear previous recipe

    try {
      const generatedRecipe = await generateRecipe(data);
      setRecipe(generatedRecipe);
       toast({
         title: "Recipe Generated!",
         description: `Enjoy your ${generatedRecipe.recipeName}!`,
       });
    } catch (err) {
      console.error('Error generating recipe:', err);
       let errorMsg = 'An unknown error occurred.';
       let errorTitle = "Recipe Generation Failed";
        if (err instanceof Error) {
           errorMsg = err.message;
            // Check for specific API key error messages
            if (errorMsg.includes('API key not valid') || errorMsg.includes('400 Bad Request') || errorMsg.includes('API_KEY_INVALID')) {
               errorTitle = "API Key Error";
               errorMsg = "Could not generate recipe. Please ensure your GOOGLE_GENAI_API_KEY is set correctly in the .env file, is valid, and the server has been restarted after changes.";
            } else {
                errorMsg = `Failed to generate recipe: ${errorMsg}. Please try again.`;
            }
        }
       toast({
         variant: "destructive",
         title: errorTitle,
         description: errorMsg,
       });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Enter Your Ingredients</CardTitle>
          <CardDescription>
            List the ingredients you have available, separated by commas (e.g., chicken breast, broccoli, soy sauce).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., eggs, cheese, bread" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate ingredients with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Recipe'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="ml-3 text-muted-foreground">Generating your recipe...</p>
        </div>
      )}

      {recipe && !isLoading && <RecipeDisplay recipe={recipe} />}
    </div>
  );
}
