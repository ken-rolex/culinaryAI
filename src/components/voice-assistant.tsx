
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Bot, User, Loader2, ChefHat, HeartPulse, StopCircle, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { chatChefAssistant, ChatChefAssistantOutput } from '@/ai/flows/chat-chef-assistant';
import { chatDietAssistant, ChatDietAssistantOutput } from '@/ai/flows/chat-diet-assistant'; // Coach flow
import { RecipeDisplay } from './recipe-display'; // To display suggested recipes

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Define message structure
interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipe?: ChatChefAssistantOutput['suggestedRecipe']; // Optional recipe data
}

type AssistantType = 'chef' | 'coach';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantType, setAssistantType] = useState<AssistantType>('coach');
  const [conversation, setConversation] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  const initializeAssistant = (type: AssistantType) => {
    let initialMessage = '';
    if (type === 'chef') {
      initialMessage = "Hello! I'm your AI Chef. Ask me about recipes, cooking techniques, or anything kitchen-related!";
    } else {
      initialMessage = "Hi there! I'm your AI Health Coach. Let's talk about your diet and fitness goals.";
    }
    setConversation([{ id: 'init', role: 'assistant', content: initialMessage }]);
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false; // Stop after first pause
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(interimTranscript || finalTranscript); // Show interim results
           if (finalTranscript) {
                handleSpeechEnd(finalTranscript); // Process final transcript
                setIsListening(false); // Stop listening visual state
           }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
           let errorMessage = 'Speech recognition error';
           if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
               errorMessage = 'Microphone access denied. Please enable it in your browser settings.';
               setHasMicPermission(false);
           } else if (event.error === 'no-speech') {
               errorMessage = 'No speech detected. Please try again.';
           } else if (event.error === 'network') {
                errorMessage = 'Network error during speech recognition.';
           }
           toast({ variant: 'destructive', title: 'Voice Error', description: errorMessage });
          setIsListening(false);
          setIsProcessing(false);
        };

        recognition.onend = () => {
          // Don't automatically stop processing here if transcript is empty,
          // as onresult might handle the final processing.
          // Only stop listening visual if it wasn't stopped by onresult.
           if(isListening) { // Only stop if still in listening state
                setIsListening(false);
           }
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API not supported in this browser.');
        toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Voice input is not supported here.' });
      }
    }

    // Initialize conversation on component mount or when type changes
    initializeAssistant(assistantType);

  }, [assistantType]); // Re-initialize if assistantType changes

   // Request microphone permission
   useEffect(() => {
     const getMicPermission = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setHasMicPermission(true);
            } catch (error) {
                console.error('Error accessing microphone:', error);
                setHasMicPermission(false);
                 toast({
                    variant: 'destructive',
                    title: 'Microphone Access Denied',
                    description: 'Please enable microphone permissions in your browser settings.',
                });
            }
        } else {
             setHasMicPermission(false); // MediaDevices not supported
             toast({
                variant: 'destructive',
                title: 'Microphone Not Supported',
                description: 'Your browser does not support microphone access.',
            });
        }
     };
       // Only request permission if the dialog is open and permission status is unknown
       if (isOpen && hasMicPermission === null) {
          getMicPermission();
       }
   }, [isOpen, hasMicPermission]); // Depend on isOpen and permission status


  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      setTimeout(() => {
        if (scrollAreaViewportRef.current) {
          scrollAreaViewportRef.current.scrollTo({
            top: scrollAreaViewportRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100); // Delay slightly for render
    }
  }, [conversation]);

  const startListening = () => {
    if (recognitionRef.current && hasMicPermission === true && !isListening && !isSpeaking) {
      try {
         setTranscript(''); // Clear previous transcript
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
         console.error("Error starting recognition:", e);
          toast({ variant: 'destructive', title: 'Voice Error', description: 'Could not start voice recognition.' });
          setIsListening(false);
      }
    } else if (hasMicPermission === false) {
        toast({ variant: 'destructive', title: 'Microphone Required', description: 'Please enable microphone access.' });
    } else if (isSpeaking) {
         toast({ title: 'Please Wait', description: 'Assistant is currently speaking.' });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Processing will happen in onresult or onend
    }
  };

  const handleSpeechEnd = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
        setIsProcessing(false); // No speech detected essentially
        return; // Ignore empty transcripts
    }

    setIsProcessing(true);
    const newUserMessage: VoiceMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: finalTranscript,
    };
    setConversation((prev) => [...prev, newUserMessage]);
    setTranscript(''); // Clear transcript display

    try {
      let assistantResponse: ChatChefAssistantOutput | ChatDietAssistantOutput;
      const commonInput = {
         // Map VoiceMessage to ChatMessageSchema expected by flows
         chatHistory: conversation.map(m => ({ role: m.role, content: m.content })),
         // Add the latest user utterance
         userUtterance: finalTranscript
       };

      if (assistantType === 'chef') {
        assistantResponse = await chatChefAssistant(commonInput);
      } else {
        // For coach, add preferences and current plan if available (adapt as needed)
        const coachInput = {
           chatHistory: conversation.map(m => ({ role: m.role, content: m.content })),
           userPreferences: {}, // Add actual preferences if stored elsewhere
           currentDietPlan: undefined, // Add actual plan if stored elsewhere
        };
         // Add the latest user message to the history being sent
        coachInput.chatHistory.push({ role: 'user', content: finalTranscript });

        assistantResponse = await chatDietAssistant(coachInput);
      }

      const assistantMessageContent = (assistantResponse as any).assistantResponse || "Sorry, I didn't get that.";
      const suggestedRecipe = (assistantResponse as ChatChefAssistantOutput)?.suggestedRecipe;

      const newAssistantMessage: VoiceMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantMessageContent,
        recipe: suggestedRecipe,
      };
      setConversation((prev) => [...prev, newAssistantMessage]);
      speak(assistantMessageContent); // Speak the response

    } catch (err) {
      console.error(`Error calling ${assistantType} assistant:`, err);
       let errorMsg = 'An unknown error occurred.';
       let errorTitle = "Assistant Error";
       if (err instanceof Error) {
           errorMsg = err.message;
            // Check for specific API key error messages
            if (errorMsg.includes('API key not valid') || errorMsg.includes('400 Bad Request') || errorMsg.includes('API_KEY_INVALID')) {
               errorTitle = "API Key Error";
               errorMsg = "Assistant unavailable. Please ensure your GOOGLE_GENAI_API_KEY is set correctly in the .env file, is valid, and the server has been restarted.";
            } else {
                errorMsg = `Sorry, I couldn't get a response: ${errorMsg}`;
            }
       }

      const errorAssistantMessage: VoiceMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error. ${errorMsg}`,
      };
      setConversation((prev) => [...prev, errorAssistantMessage]);
      toast({ variant: 'destructive', title: errorTitle, description: errorMsg });
    } finally {
      setIsProcessing(false);
    }
  }, [conversation, assistantType, toast]);


  const speak = (text: string) => {
    if ('speechSynthesis' in window && text) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        toast({ variant: 'destructive', title: 'Speech Error', description: 'Could not play assistant response.' });
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else if (!text) {
        setIsSpeaking(false); // Ensure speaking state is false if text is empty
    }
  };

  const stopSpeaking = () => {
     if ('speechSynthesis' in window && isSpeaking) {
       window.speechSynthesis.cancel();
       setIsSpeaking(false);
     }
  }

  const switchAssistant = (type: AssistantType) => {
    if (isListening || isSpeaking || isProcessing) {
        toast({title: "Please Wait", description: "Cannot switch assistants while active."});
        return;
    }
    stopSpeaking(); // Stop current speech if any
    setAssistantType(type);
    // initializeAssistant(type); // useEffect will handle this
  };

   const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Stop listening and speaking when dialog closes
            stopListening();
            stopSpeaking();
        }
        setIsOpen(open);
   }

  const AssistantIcon = assistantType === 'chef' ? ChefHat : HeartPulse;
  const AssistantName = assistantType === 'chef' ? 'AI Chef' : 'AI Health Coach';

  return (
    <>
      {/* Buttons to trigger the dialog */}
      <div className="flex gap-4 my-6 justify-center">
         <Button variant="outline" size="lg" onClick={() => { setAssistantType('chef'); setIsOpen(true); }}>
            <ChefHat className="mr-2 h-5 w-5" /> Talk to Chef
         </Button>
          <Button variant="outline" size="lg" onClick={() => { setAssistantType('coach'); setIsOpen(true); }}>
             <HeartPulse className="mr-2 h-5 w-5" /> Talk to Coach
          </Button>
      </div>


      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[525px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AssistantIcon className="h-6 w-6 text-primary" /> {AssistantName} Voice Assistant
            </DialogTitle>
            {/* Assistant Switcher */}
             <div className="flex gap-2 pt-2 justify-center">
                 <Button
                     size="sm"
                     variant={assistantType === 'coach' ? 'default' : 'outline'}
                     onClick={() => switchAssistant('coach')}
                     disabled={isListening || isSpeaking || isProcessing}
                 >
                     <HeartPulse className="mr-2 h-4 w-4" /> Coach
                 </Button>
                 <Button
                     size="sm"
                     variant={assistantType === 'chef' ? 'default' : 'outline'}
                     onClick={() => switchAssistant('chef')}
                     disabled={isListening || isSpeaking || isProcessing}
                 >
                     <ChefHat className="mr-2 h-4 w-4" /> Chef
                 </Button>
             </div>
          </DialogHeader>

          <ScrollArea className="flex-1 py-4 pr-2" viewportRef={scrollAreaViewportRef}>
            <div className="space-y-4">
              {conversation.map((message) => (
                <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border bg-primary/10">
                      <AvatarFallback><Bot size={16} className="text-primary"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn('rounded-lg px-3 py-2 max-w-[80%] text-sm shadow-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {/* Display recipe if present */}
                    {message.recipe && (
                       <div className="mt-4 border-t pt-2">
                            <p className="text-xs font-semibold mb-2">Suggested Recipe:</p>
                            <RecipeDisplay recipe={message.recipe} />
                       </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isProcessing && (
                 <div className="flex justify-start items-center gap-3">
                    <Avatar className="h-8 w-8 border bg-primary/10">
                      <AvatarFallback><Bot size={16} className="text-primary"/></AvatarFallback>
                    </Avatar>
                   <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                     <Loader2 className="h-4 w-4 animate-spin" />
                   </div>
                 </div>
              )}
                {/* Display interim transcript */}
                 {isListening && transcript && (
                    <div className="flex items-start gap-3 justify-end text-muted-foreground italic">
                        <p className="rounded-lg px-3 py-2 max-w-[80%] text-sm bg-secondary/50">{transcript}...</p>
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback><User size={16} /></AvatarFallback>
                        </Avatar>
                    </div>
                 )}
            </div>
          </ScrollArea>

          <DialogFooter className="items-center gap-2 sm:justify-center">
            {isSpeaking ? (
                <Button variant="outline" size="icon" onClick={stopSpeaking} aria-label="Stop speaking">
                    <StopCircle className="h-5 w-5 text-red-500" />
                </Button>
            ) : (
                 <Button
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    disabled={hasMicPermission === false || isProcessing || isSpeaking}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                    className={cn(
                        'rounded-full w-12 h-12',
                        isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90',
                        (hasMicPermission === false || isProcessing || isSpeaking) && 'opacity-50 cursor-not-allowed'
                    )}
                    >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
            )}


             {hasMicPermission === false && (
                <p className="text-xs text-destructive text-center">Microphone access denied.</p>
             )}
          </DialogFooter>
           {/* Speaker Icon indicating assistant is speaking */}
           {isSpeaking && (
               <div className="absolute bottom-6 left-6 text-blue-500 animate-pulse">
                 <Volume2 size={20} />
               </div>
           )}
        </DialogContent>
      </Dialog>
    </>
  );
}
