
'use client';

import React, { useState, ChangeEvent } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, HeartPulse, AlertTriangle, XCircle, Scale, Ruler, Calendar } from 'lucide-react';
import Image from 'next/image';
import { generateHealthPlan, GenerateHealthPlanInput, GenerateHealthPlanOutput } from '@/ai/flows/generate-health-plan';
import { useToast } from "@/hooks/use-toast";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

// Define BMI statuses
type HealthStatus = "Underweight" | "Fit" | "Overweight" | "Obese" | null;

// Form Schema Definition
const FormSchema = z.object({
  age: z.coerce.number().int().positive({ message: "Age must be a positive number." }).min(1, { message: "Age cannot be zero." }).max(120, {message: "Age seems unrealistic."}),
  weight: z.coerce.number().positive({ message: "Weight must be a positive number." }).min(1, { message: "Weight seems too low."}),
  height: z.coerce.number().int().positive({ message: "Height must be a positive number." }).min(50, { message: "Height seems too low." }).max(280, { message: "Height seems unrealistic."}),
  image: z.string().optional(), // Optional image data URI
});

export default function HealthMeter() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(null);
  const [healthPlan, setHealthPlan] = useState<GenerateHealthPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      image: undefined,
    },
  });

   const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null); // Clear previous errors on new file selection

    if (file) {
       // Check file type and size
       if (!file.type.startsWith('image/')) {
         setError('Please upload a valid image file.');
         setImagePreview(null);
         setImageDataUri(null);
         form.setValue('image', undefined);
         return;
       }
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError('Image size should not exceed 5MB.');
          setImagePreview(null);
          setImageDataUri(null);
          form.setValue('image', undefined);
          return;
       }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setImageDataUri(dataUri);
        form.setValue('image', dataUri); // Store data URI in form state
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        setImagePreview(null);
        setImageDataUri(null);
        form.setValue('image', undefined);
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
       form.setValue('image', undefined);
    }
  };

  const calculateBmi = (weight: number, height: number): { bmi: number, status: HealthStatus } => {
    if (height <= 0 || weight <= 0) return { bmi: 0, status: null };
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    const roundedBmi = parseFloat(calculatedBmi.toFixed(1));

    let status: HealthStatus = null;
    if (roundedBmi < 18.5) status = "Underweight";
    else if (roundedBmi >= 18.5 && roundedBmi <= 24.9) status = "Fit";
    else if (roundedBmi >= 25 && roundedBmi <= 29.9) status = "Overweight";
    else if (roundedBmi >= 30) status = "Obese";

    return { bmi: roundedBmi, status };
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);
    setBmi(null);
    setHealthStatus(null);
    setHealthPlan(null);

    const { bmi: calculatedBmi, status: calculatedStatus } = calculateBmi(data.weight, data.height);
    setBmi(calculatedBmi);
    setHealthStatus(calculatedStatus);

    if (!calculatedStatus) {
        setError("Could not determine health status based on input.");
        setIsLoading(false);
        return;
    }

    const input: GenerateHealthPlanInput = {
      age: data.age,
      weight: data.weight,
      height: data.height,
      bmi: calculatedBmi,
      status: calculatedStatus,
      photoDataUri: imageDataUri ?? undefined, // Pass undefined if null
    };

    try {
      const result = await generateHealthPlan(input);
      setHealthPlan(result);
      toast({
        title: "Health Plan Generated!",
        description: "Check out your personalized diet and suggestions below.",
      });
    } catch (error) {
      console.error('Error generating health plan:', error);
      setError('Failed to generate health plan. Please check your inputs or try again later.');
      toast({
        variant: "destructive",
        title: "Plan Generation Failed",
        description: "Could not generate a health plan. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadgeVariant = (status: HealthStatus) => {
    switch (status) {
      case 'Underweight': return 'default'; // Or maybe secondary
      case 'Fit': return 'secondary'; // Or primary if you want to highlight 'Fit'
      case 'Overweight': return 'destructive';
      case 'Obese': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-primary" />
          Your Health Check
        </CardTitle>
        <CardDescription>
          Enter your details and upload an optional photo to get a personalized health assessment and plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Calendar className="mr-1 h-4 w-4"/>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Scale className="mr-1 h-4 w-4"/>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Ruler className="mr-1 h-4 w-4"/>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

             <div className="space-y-2">
                <FormLabel htmlFor="image-upload" className="flex items-center"><Upload className="mr-1 h-4 w-4"/>Upload Photo (Optional)</FormLabel>
                <FormControl>
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="file:text-foreground"/>
                </FormControl>
                 <FormDescription>
                    A photo can help provide more personalized visual feedback (max 5MB).
                 </FormDescription>
                <FormMessage /> {/* For image-related errors */}
             </div>

             {imagePreview && (
                <div className="mt-4 border rounded-md p-4 flex flex-col items-center space-y-2 bg-muted/30">
                    <p className="font-medium text-sm text-muted-foreground">Image Preview:</p>
                    <Image
                      src={imagePreview}
                      alt="User photo preview"
                      width={150}
                      height={150}
                      className="rounded-md object-cover max-h-[150px] w-auto"
                      data-ai-hint="person photo"
                    />
                </div>
             )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                 <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1 text-destructive hover:bg-destructive/20 rounded-full">
                    <XCircle className="h-4 w-4"/>
                    <span className="sr-only">Dismiss error</span>
                 </button>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing & Generating Plan...
                </>
              ) : (
                'Check Health & Get Plan'
              )}
            </Button>
          </form>
        </Form>

         {/* Results Section */}
        {(bmi !== null || healthStatus !== null || healthPlan !== null) && !isLoading && (
            <div className="mt-8 space-y-6 animate-in fade-in duration-500">
                <Separator />
                 <h3 className="text-xl font-semibold text-center">Your Health Assessment</h3>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    {bmi !== null && (
                        <Card>
                            <CardHeader><CardTitle>BMI</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{bmi}</p>
                            </CardContent>
                        </Card>
                    )}
                    {healthStatus && (
                         <Card>
                            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                            <CardContent>
                                 <Badge variant={getStatusBadgeVariant(healthStatus)} className="text-lg px-4 py-1">{healthStatus}</Badge>
                            </CardContent>
                        </Card>
                    )}
                 </div>

                {healthPlan && (
                    <Card className="bg-secondary/30 border-secondary">
                        <CardHeader>
                            <CardTitle>Personalized Health Plan</CardTitle>
                            <CardDescription>Based on your input, here's a suggested plan:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {healthPlan.visualFeedback && (
                                <div>
                                    <h4 className="font-semibold mb-2">Visual Feedback:</h4>
                                    <p className="text-sm text-muted-foreground">{healthPlan.visualFeedback}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold mb-2">Diet Plan:</h4>
                                <p className="text-sm whitespace-pre-line">{healthPlan.dietPlan}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Suggestions:</h4>
                                <p className="text-sm whitespace-pre-line">{healthPlan.suggestions}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}

      </CardContent>
    </Card>
  );
}
