
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Bot, User, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { chatDietAssistant, ChatDietAssistantInput, ChatDietAssistantOutput } from '@/ai/flows/chat-diet-assistant';
import { Textarea } from '@/components/ui/textarea'; // Use Textarea for potentially longer plan display/edit
import { cn } from '@/lib/utils'; // Import the cn utility function

// Define message structure
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function DietChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDietPlan, setCurrentDietPlan] = useState<string>(''); // State to hold the evolving diet plan
  const [userPreferences, setUserPreferences] = useState<any>({ // State for user preferences (can be expanded)
     goal: 'General Health',
     dietaryRestrictions: [],
     allergies: [],
     lifestyle: 'Moderate Activity'
  });
  const { toast } = useToast();
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport

  // Initial assistant message
  useEffect(() => {
    setMessages([
      { id: 'init', role: 'assistant', content: "Hello! I'm your diet assistant. How can I help you customize your meal plan today? Tell me about your goals or preferences!" }
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        // Use setTimeout to ensure scrolling happens after the DOM update
        setTimeout(() => {
             if (scrollAreaViewportRef.current) {
                scrollAreaViewportRef.current.scrollTo({ top: scrollAreaViewportRef.current.scrollHeight, behavior: 'smooth' });
             }
        }, 0);
    }
  }, [messages]);


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: trimmedMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    const inputForAI: ChatDietAssistantInput = {
       chatHistory: messages.map(m => ({ role: m.role, content: m.content })), // Pass current messages
       userPreferences: userPreferences, // Pass user preferences
       currentDietPlan: currentDietPlan || undefined, // Pass current plan string
    };
     // Add the new user message to the history being sent
    inputForAI.chatHistory.push({ role: 'user', content: trimmedMessage });

    try {
      const result: ChatDietAssistantOutput = await chatDietAssistant(inputForAI);

      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.assistantResponse
      };
      setMessages(prev => [...prev, newAssistantMessage]);

      // Update the diet plan if the AI provided an update
      if (result.updatedDietPlanSnippet) {
        setCurrentDietPlan(result.updatedDietPlanSnippet);
         toast({
            title: "Diet Plan Updated",
            description: "The assistant suggested changes to your plan.",
            action: <Edit className="h-4 w-4" />, // Simple icon action
         });
      }

      // Optional: Handle suggested actions (e.g., display as buttons)
      if (result.suggestedActions && result.suggestedActions.length > 0) {
        // Example: Log suggestions or add buttons - implementation depends on UI/UX design
        console.log("Suggested actions:", result.suggestedActions);
      }

    } catch (err) {
      console.error('Error calling chat assistant:', err);
      let errorMsg = 'An unknown error occurred.';
      let errorTitle = "Chat Error";
      if (err instanceof Error) {
          errorMsg = err.message;
           if (errorMsg.includes('API key not valid') || errorMsg.includes('400')) {
              errorTitle = "API Key Error";
              errorMsg = "Could not get a response. Please ensure your GOOGLE_GENAI_API_KEY is set correctly in the .env file and is valid.";
           } else {
               errorMsg = `Sorry, I couldn't get a response: ${errorMsg}. Please try again.`;
           }
      }
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMsg, // Use refined message
      });
      // Optionally add an error message to the chat
       const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error. Please ensure your API key is valid and try again.` // Simplified error message in chat
      };
       setMessages(prev => [...prev, errorAssistantMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:flex-row gap-6">
       {/* Chat Interface */}
      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Diet Plan Chat Assistant
          </CardTitle>
          <CardDescription>Chat to customize your diet plan based on your needs.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4 pr-2" viewportRef={scrollAreaViewportRef}> {/* Pass the ref here */}
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[75%] text-sm whitespace-pre-wrap", // Added whitespace-pre-wrap
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-3">
                   <Avatar className="h-8 w-8 border">
                      <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Ask to change meals, timings, or preferences..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputMessage.trim()} aria-label="Send message">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

        {/* Current Diet Plan View/Edit */}
        <Card className="w-full md:w-1/3 lg:w-2/5 shadow-lg flex flex-col">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" /> Current Diet Plan Draft
            </CardTitle>
            <CardDescription>This plan updates based on the chat.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex">
                <Textarea
                    value={currentDietPlan}
                    onChange={(e) => setCurrentDietPlan(e.target.value)} // Allow manual edits if needed
                    placeholder="Your diet plan will appear here as you chat..."
                    className="flex-1 resize-none text-sm"
                    readOnly={isLoading} // Make read-only while AI is processing
                />
            </CardContent>
            {/* Add preference inputs here if desired */}
             {/* <CardFooter>
                 <p className="text-xs text-muted-foreground">You can also manually edit the plan here.</p>
             </CardFooter> */}
        </Card>
    </div>
  );
}
