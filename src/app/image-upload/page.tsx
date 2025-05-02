
'use client';

import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { extractIngredients, ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients';
import { generateRecipe, GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { RecipeDisplay } from '@/components/recipe-display';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";


export default function ImageUploadPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [extractedIngredients, setExtractedIngredients] = useState<string[] | null>(null);
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       setError(null);
       setExtractedIngredients(null);
       setRecipe(null);

       // Check file type and size (optional but recommended)
       if (!file.type.startsWith('image/')) {
         setError('Please upload a valid image file (jpg, png, gif, etc.).');
         setImagePreview(null);
         setImageDataUri(null);
         return;
       }
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError('Image size should not exceed 5MB.');
          setImagePreview(null);
          setImageDataUri(null);
          return;
       }


      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setImageDataUri(dataUri); // Store the data URI
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        setImagePreview(null);
        setImageDataUri(null);
        toast({
            variant: "destructive",
            title: "Image Read Error",
            description: "Could not read the selected image file.",
        });
      }
      reader.readAsDataURL(file);
    } else {
       setImagePreview(null);
       setImageDataUri(null);
    }
  };

  const handleExtractIngredients = async () => {
    if (!imageDataUri) {
        setError('Please upload an image first.');
        toast({
            variant: "destructive",
            title: "No Image",
            description: "Please select an image to upload before extracting.",
        });
        return;
    }

    setIsExtracting(true);
    setExtractedIngredients(null);
    setRecipe(null);
    setError(null);

    try {
      const result: ExtractIngredientsOutput = await extractIngredients({ photoDataUri: imageDataUri });
      setExtractedIngredients(result.ingredients);
       toast({
         title: "Ingredients Extracted!",
         description: `Found ${result.ingredients.length} ingredients.`,
       });
    } catch (err) {
      console.error('Error extracting ingredients:', err);
      let errorMsg = 'An unknown error occurred.';
      let errorTitle = "Extraction Failed";
      if (err instanceof Error) {
          errorMsg = err.message;
           // Check for specific API key error messages
           if (errorMsg.includes('API key not valid') || errorMsg.includes('400 Bad Request') || errorMsg.includes('API_KEY_INVALID')) {
              errorTitle = "API Key Error";
              errorMsg = "Could not extract ingredients. Please ensure your GOOGLE_GENAI_API_KEY is set correctly in the .env file, is valid, and the server has been restarted after changes.";
           } else {
               errorMsg = `Could not extract ingredients: ${errorMsg}. Try a clearer image.`;
           }
      }
      setError(errorMsg); // Set local error state for display
      toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMsg, // Use the refined message
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!extractedIngredients || extractedIngredients.length === 0) {
        setError('No ingredients found or extracted. Please extract ingredients first.');
        toast({
            variant: "destructive",
            title: "No Ingredients",
            description: "Cannot generate recipe without ingredients.",
        });
        return;
    }

    setIsGenerating(true);
    setRecipe(null); // Clear previous recipe
    setError(null);

    try {
      const ingredientsString = extractedIngredients.join(', ');
      const generatedRecipe = await generateRecipe({ ingredients: ingredientsString });
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
                errorMsg = `Could not generate a recipe with these ingredients: ${errorMsg}`;
            }
        }
       setError(errorMsg); // Set local error state for display
       toast({
         variant: "destructive",
         title: errorTitle,
         description: errorMsg, // Use the refined message
       });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Upload Ingredient Photo</CardTitle>
          <CardDescription>
            Upload a clear photo of your ingredients, and we'll identify them to generate a recipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
             <label htmlFor="image-upload" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Select Image
             </label>
             <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="file:text-foreground"/>
          </div>

          {error && (
            <div className="flex items-center p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
               <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0"/>
               <p className="text-sm">{error}</p>
               <button onClick={() => setError(null)} className="ml-auto p-1 text-destructive hover:bg-destructive/20 rounded-full">
                  <XCircle className="h-4 w-4"/>
                  <span className="sr-only">Dismiss error</span>
               </button>
            </div>
          )}

          {imagePreview && (
            <div className="mt-4 border rounded-md p-4 flex flex-col items-center space-y-4">
                <p className="font-medium text-center">Image Preview:</p>
                <Image
                  src={imagePreview}
                  alt="Ingredient preview"
                  width={300}
                  height={300}
                  className="rounded-md object-contain max-h-[300px] w-auto"
                  data-ai-hint="food ingredients photo"
                />
                 <Button
                   onClick={handleExtractIngredients}
                   disabled={isExtracting || !!extractedIngredients}
                   className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                 >
                   {isExtracting ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Extracting...
                     </>
                   ) : extractedIngredients ? (
                     <>
                       <CheckCircle className="mr-2 h-4 w-4" />
                       Ingredients Extracted
                     </>
                   ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Extract Ingredients
                      </>
                   )}
                 </Button>
            </div>
          )}

          {extractedIngredients && extractedIngredients.length > 0 && (
            <Card className="mt-6 bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600"/> Extracted Ingredients
                </CardTitle>
                <CardDescription>We found the following ingredients in your image:</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {extractedIngredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary">{ingredient}</Badge>
                ))}
              </CardContent>
               <div className="p-6 pt-0">
                <Button
                  onClick={handleGenerateRecipe}
                  disabled={isGenerating || !!recipe}
                   className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Recipe...
                    </>
                   ) : recipe ? (
                     <>
                       <CheckCircle className="mr-2 h-4 w-4" />
                       Recipe Generated Below
                     </>
                   ) : (
                    'Generate Recipe with these Ingredients'
                  )}
                </Button>
               </div>
            </Card>
          )}
            {extractedIngredients && extractedIngredients.length === 0 && !isExtracting &&(
                 <Card className="mt-6 bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center text-yellow-800 dark:text-yellow-300">
                        <AlertTriangle className="h-5 w-5 mr-2"/> No Ingredients Found
                      </CardTitle>
                      <CardDescription className="text-yellow-700 dark:text-yellow-400">
                          We couldn't detect any ingredients in the uploaded image. Please try a clearer photo or use the manual entry option.
                      </CardDescription>
                    </CardHeader>
                 </Card>
            )}
        </CardContent>
      </Card>

       {isGenerating && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Generating your recipe...</p>
         </div>
       )}

       {recipe && !isGenerating && <RecipeDisplay recipe={recipe} />}

    </div>
  );
}
