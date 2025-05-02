import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { ListChecks, CookingPot, Info } from 'lucide-react';

interface RecipeDisplayProps {
  recipe: GenerateRecipeOutput | null | undefined;
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  // Handle null or undefined recipe gracefully
  if (!recipe) {
    return (
      <Card className="shadow-lg mt-8 animate-in fade-in duration-500">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2"><Info className="h-6 w-6"/> No Recipe</CardTitle>
            <CardDescription>No recipe details available.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">The recipe could not be displayed.</p>
        </CardContent>
       </Card>
    );
  }

  // Split ingredients and instructions safely
  const ingredientsList = recipe.ingredients ? recipe.ingredients.split(',').map(item => item.trim()).filter(item => item) : [];
  const instructionsList = recipe.instructions ? recipe.instructions.split('\n').map(item => item.trim()).filter(item => item) : [];

  // Main return statement for when a recipe exists
  return (
    <Card className="shadow-lg mt-8 animate-in fade-in duration-500 border border-secondary/50">
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
                <Badge key={index} variant="secondary">{ingredient}</Badge>
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
            <ol className="list-decimal space-y-3 pl-6 text-foreground prose prose-sm max-w-none">
              {instructionsList.map((step, index) => (
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
