'use client';

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
// NOTE: Redux is commented out as it requires client-side setup which is not requested.
// Re-enable if Redux store provider is implemented in layout.tsx or a wrapper component.
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   toggleLanguage,
//   addHistoryItem,
//   setHealthData,
// } from '@/redux/features/appSlice';
import { useState } from 'react';

// NOTE: Components related to Redux state are commented out.
// import HealthMeter from '@/components/HealthMeter';
// import NutrientMeter from '@/components/NutrientMeter';
// import LanguageSwitcher from '@/components/LanguageSwitcher';
// import History from '@/components/History';
// import HealthTips from '@/components/HealthTips';

const Home = () => {
  // NOTE: Redux state and dispatch are commented out.
  // const { isHindi, history, healthData } = useSelector((state: any) => state.app);
  // const dispatch = useDispatch();
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isHindi, setIsHindi] = useState(false); // Placeholder for language state
  const [history, setHistory] = useState<string[]>([]); // Placeholder for history state

  const handleAddHistory = () => {
    const newItem = `Recipe searched at ${new Date().toLocaleTimeString()}`;
    // dispatch(addHistoryItem(newItem));
    setHistory((prev) => [...prev, newItem]); // Placeholder action
  };

  const handleSetHealth = () => {
    // dispatch(setHealthData({ weight: 70, height: 175, age: 30 }));
    console.log('Set health data (placeholder)'); // Placeholder action
  };

  const toggleHistoryVisibility = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const toggleLanguage = () => {
    setIsHindi(!isHindi);
  };


  const homeText = isHindi
    ? {
        welcome: 'फ्रिजरेसिपी में आपका स्वागत है!',
        intro:
          'आपके पास मौजूद सामग्री को स्वादिष्ट भोजन में बदलें। शुरू करने के लिए चुनें:',
        manualEntry: 'मैनुअल सामग्री प्रविष्टि',
        typeIngredients: 'अपने पास मौजूद सामग्री टाइप करें।',
        startTyping: 'टाइप करना शुरू करें',
        photoUpload: 'सामग्री फोटो अपलोड करें',
        snapPicture: 'अपनी सामग्री की एक तस्वीर लें।',
        uploadImage: 'छवि अपलोड करें',
        toggleLang: 'Switch to English',
        showHistory: 'इतिहास दिखाएँ',
        hideHistory: 'इतिहास छिपाएँ',
        setHealth: 'स्वास्थ्य डेटा सेट करें',
      }
    : {
        welcome: 'Welcome to FridgeRecipe!',
        intro:
          'Turn the ingredients you already have into delicious meals. Choose how you want to start:',
        manualEntry: 'Manual Ingredient Entry',
        typeIngredients: 'Type in the ingredients you have on hand.',
        startTyping: 'Start Typing',
        photoUpload: 'Upload Ingredient Photo',
        snapPicture: 'Snap a picture of your ingredients.',
        uploadImage: 'Upload Image',
        toggleLang: 'हिंदी में बदलें',
        showHistory: 'Show History',
        hideHistory: 'Hide History',
        setHealth: 'Set Health Data',
      };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-4">
      {/* Placeholder for LanguageSwitcher */}
       <Button onClick={toggleLanguage} variant="outline" size="sm">{homeText.toggleLang}</Button>
      <h1 className="text-4xl font-bold text-center">
        {homeText.welcome}
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-xl">
        {homeText.intro}
      </p>
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
                onClick={handleAddHistory}
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
      {/* Placeholder for Nutrient Meter Component */}
      {/* <NutrientMeter /> */}
      {/* Placeholder for Health Meter Component */}
      {/* <HealthMeter /> */}
      <Button onClick={handleSetHealth} variant="secondary">{homeText.setHealth}</Button>
      {/* Placeholder for History Component */}
      <Button onClick={toggleHistoryVisibility} variant="outline">
        {isHistoryVisible ? homeText.hideHistory : homeText.showHistory}
      </Button>
      {isHistoryVisible && (
         <Card className="w-full max-w-2xl mt-4">
             <CardHeader>
                 <CardTitle>{isHindi ? 'खोज इतिहास' : 'Search History'}</CardTitle>
             </CardHeader>
             <CardContent>
                 {history.length > 0 ? (
                     <ul className="list-disc pl-5 text-muted-foreground">
                         {history.map((item, index) => <li key={index}>{item}</li>)}
                     </ul>
                 ) : (
                    <p className="text-muted-foreground">{isHindi ? 'कोई इतिहास नहीं मिला।' : 'No history found.'}</p>
                 )}
             </CardContent>
         </Card>
      )}
      {/* Placeholder for Health Tips Component */}
      {/* <HealthTips /> */}
    </div>
  );
};

export default Home;
