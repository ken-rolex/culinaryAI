{'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChefHat, ImageUp } from 'lucide-react';
import Link from 'next/link';
import HealthMeter from '@/components/health-meter'; // Import the new component

const Home = () => {
  const homeText = {
    welcome: 'Welcome to FridgeRecipe!',
    intro:
      'Turn the ingredients you already have into delicious meals. Choose how you want to start:',
    manualEntry: 'Manual Ingredient Entry',
    typeIngredients: 'Type in the ingredients you have on hand.',
    startTyping: 'Start Typing',
    photoUpload: 'Upload Ingredient Photo',
    snapPicture: 'Snap a picture of your ingredients.',
    uploadImage: 'Upload Image',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-center">
          {homeText.welcome}
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl">
          {homeText.intro}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Manual Entry */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              {homeText.manualEntry}
            </CardTitle>
            <CardDescription>{homeText.typeIngredients}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/manual-entry" passHref>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {homeText.startTyping}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageUp className="h-6 w-6 text-primary" />
              {homeText.photoUpload}
            </CardTitle>
            <CardDescription>{homeText.snapPicture}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/image-upload" passHref>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {homeText.uploadImage}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Health Meter Section */}
      <HealthMeter />

    </div>
  );
};

export default Home;
