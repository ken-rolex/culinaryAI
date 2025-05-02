import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { ChefHat, ImageUp, Home, MessageCircle, CalendarCheck } from 'lucide-react'; // Added icons

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FridgeRecipe',
  description: 'Generate recipes, plan meals, and get health tips!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased min-h-screen flex flex-col')}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="font-bold inline-block">
                FridgeRecipe
              </span>
            </Link>
            <Menubar className="border-none bg-transparent shadow-none rounded-none">
               <MenubarMenu>
                 <Link href="/" passHref legacyBehavior>
                    <MenubarTrigger className="font-bold cursor-pointer">
                       <Home className="mr-2 h-4 w-4" /> Home
                    </MenubarTrigger>
                 </Link>
               </MenubarMenu>
               <MenubarMenu>
                 <Link href="/manual-entry" passHref legacyBehavior>
                   <MenubarTrigger className="font-bold cursor-pointer">
                     <ChefHat className="mr-2 h-4 w-4" /> Manual Entry
                   </MenubarTrigger>
                  </Link>
               </MenubarMenu>
               <MenubarMenu>
                 <Link href="/image-upload" passHref legacyBehavior>
                   <MenubarTrigger className="font-bold cursor-pointer">
                     <ImageUp className="mr-2 h-4 w-4" /> Image Upload
                   </MenubarTrigger>
                 </Link>
               </MenubarMenu>
               <MenubarMenu>
                 <Link href="/diet-chat" passHref legacyBehavior>
                   <MenubarTrigger className="font-bold cursor-pointer">
                     <MessageCircle className="mr-2 h-4 w-4" /> Diet Chat
                   </MenubarTrigger>
                 </Link>
               </MenubarMenu>
               <MenubarMenu>
                 <Link href="/daily-planner" passHref legacyBehavior>
                   <MenubarTrigger className="font-bold cursor-pointer">
                     <CalendarCheck className="mr-2 h-4 w-4" /> Daily Planner
                   </MenubarTrigger>
                 </Link>
               </MenubarMenu>
            </Menubar>
          </div>
        </header>
        <main className="flex-1 container py-8">
          {children}
        </main>
        <Toaster />
        <footer className="py-6 md:px-8 md:py-0 border-t">
           <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
             <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built with Next.js and Genkit.
             </p>
           </div>
        </footer>
      </body>
    </html>
  );
}
