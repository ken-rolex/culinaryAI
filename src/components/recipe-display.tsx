import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { ListChecks, CookingPot, Info } from 'lucide-react'; // Added Info icon for fallback

interface RecipeDisplayProps {
  recipe: GenerateRecipeOutput | null | undefined; // Allow null or undefined
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  // Handle null or undefined recipe gracefully
  if (!recipe) {
    return ( // Opening parenthesis for return JSX
       <Card className="shadow-lg mt-8 animate-in fade-in duration-500">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2"><Info className="h-6 w-6"/> No Recipe</CardTitle>
            <CardDescription>No recipe details available.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">The recipe could not be displayed.</p>
        </CardContent>
       </Card>
    ); // Closing parenthesis for return JSX - Added missing parenthesis
  }


  // Split ingredients and instructions safely
  const ingredientsList = recipe.ingredients ? recipe.ingredients.split(',').map(item => item.trim()).filter(item => item) : [];
  const instructionsList = recipe.instructions ? recipe.instructions.split('\n').map(item => item.trim()).filter(item => item) : [];

  return (
    <Card className="shadow-lg mt-8 animate-in fade-in duration-500 border border-secondary/50"> {/* Added subtle border */}
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">{recipe.recipeName || "Unnamed Recipe"}</CardTitle>
        <CardDescription>Here's a recipe based on your ingredients!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
           <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-secondary-foreground" />
              Ingredients Needed:
           </h3>
          {ingredientsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ingredientsList.map((ingredient, index) => (
                <Badge key={index} variant="secondary">{ingredient}</Badge> {/* Changed variant */}
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No specific ingredients listed by the chef.</p>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
             <CookingPot className="h-5 w-5 text-secondary-foreground" />
             Instructions:
          </h3>
          {instructionsList.length > 0 ? (
            <ol className="list-decimal space-y-3 pl-6 text-foreground prose prose-sm max-w-none"> {/* Added prose styling */}
              {instructionsList.map((step, index) => (
                 // Use dangerouslySetInnerHTML if instructions might contain basic markdown like bolding
                 // Be cautious if the source is not trusted. For LLM output, basic formatting is usually safe.
                 // <li key={index} className="pl-2" dangerouslySetInnerHTML={{ __html: step }} />
                 <li key={index} className="pl-2">{step}</li>
              ))}
            </ol>
          ) : (
             <p className="text-sm text-muted-foreground">No instructions provided.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
