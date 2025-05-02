import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ImageUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to FridgeRecipe!</h1>
      <p className="text-lg text-muted-foreground text-center max-w-xl">
        Turn the ingredients you already have into delicious meals. Choose how you want to start:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              Manual Ingredient Entry
            </CardTitle>
            <CardDescription>
              Type in the ingredients you have on hand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/manual-entry" passHref>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Start Typing
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageUp className="h-6 w-6 text-primary" />
              Upload Ingredient Photo
            </CardTitle>
            <CardDescription>
              Snap a picture of your ingredients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/image-upload" passHref>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Upload Image
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
