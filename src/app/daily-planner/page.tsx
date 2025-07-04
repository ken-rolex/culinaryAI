
'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, GripVertical, Trash2, Utensils, Dumbbell, Edit, Clock, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { useToast } from "@/hooks/use-toast";
import { SortableItem } from '@/components/sortable-item'; // Needs to be created
import { recommendExercises, RecommendExercisesInput, RecommendExercisesOutput } from '@/ai/flows/recommend-exercises';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import the cn utility function

// Define item structure
interface PlannerItem {
  id: string;
  time: string; // e.g., "08:00"
  type: 'meal' | 'exercise' | 'note';
  title: string;
  details?: string;
  completed: boolean;
}

// Define exercise preference structure
interface ExercisePreferences {
  preferences: string[];
  goals: string[];
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availableTime: string;
  location: 'Home' | 'Gym' | 'Outdoors';
}

export default function DailyPlannerPage() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [newItemTime, setNewItemTime] = useState('');
  const [newItemType, setNewItemType] = useState<'meal' | 'exercise' | 'note'>('meal');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDetails, setNewItemDetails] = useState('');
  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [exercisePreferences, setExercisePreferences] = useState<ExercisePreferences>({
    preferences: ['Cardio'],
    goals: ['Weight Loss'],
    fitnessLevel: 'Beginner',
    availableTime: '30 minutes',
    location: 'Home',
  });
   const [isGeneratingExercises, setIsGeneratingExercises] = useState(false);

  const { toast } = useToast();

  // Load items from local storage on mount
  useEffect(() => {
    // Ensure this runs only on the client
    const savedItems = localStorage.getItem('dailyPlannerItems');
    if (savedItems) {
        try {
            const parsedItems = JSON.parse(savedItems);
            // Basic validation
            if (Array.isArray(parsedItems)) {
                 setItems(parsedItems.sort((a: PlannerItem, b: PlannerItem) => a.time.localeCompare(b.time)));
            } else {
                console.warn("Invalid data found in local storage for daily planner.");
                localStorage.removeItem('dailyPlannerItems'); // Clear invalid data
            }
        } catch (e) {
            console.error("Failed to parse daily planner items from local storage:", e);
            localStorage.removeItem('dailyPlannerItems'); // Clear corrupted data
        }
    }
  }, []);

  // Save items to local storage whenever they change
  useEffect(() => {
     // Ensure this runs only on the client
     if (typeof window !== 'undefined') {
        localStorage.setItem('dailyPlannerItems', JSON.stringify(items));
     }
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        // Ensure indices are valid before moving
        if (oldIndex !== -1 && newIndex !== -1) {
           return arrayMove(currentItems, oldIndex, newIndex);
        }
        return currentItems; // Return unchanged if indices invalid
      });
       toast({ title: "Plan Reordered", description: "Item moved successfully." });
    }
  };

  const addItem = () => {
    if (!newItemTime || !newItemTitle) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide time and title." });
      return;
    }
    const newItem: PlannerItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
      time: newItemTime,
      type: newItemType,
      title: newItemTitle,
      details: newItemDetails,
      completed: false,
    };
    // Add and sort immediately
    setItems(prevItems => [...prevItems, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    // Reset form
    setNewItemTime('');
    setNewItemTitle('');
    setNewItemDetails('');
    setNewItemType('meal'); // Reset type to default
    toast({ title: "Item Added", description: `${newItem.title} scheduled for ${newItem.time}.` });
  };

   const startEditItem = (item: PlannerItem) => {
    setEditingItem(item);
    // Prefill state for the dialog
    setNewItemTime(item.time);
    setNewItemType(item.type);
    setNewItemTitle(item.title);
    setNewItemDetails(item.details || '');
  };

   const saveEditItem = () => {
    if (!editingItem || !newItemTime || !newItemTitle) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide time and title." });
        return;
    };

    setItems(prevItems =>
        prevItems.map(item =>
            item.id === editingItem.id
            ? { ...item, time: newItemTime, type: newItemType, title: newItemTitle, details: newItemDetails }
            : item
        ).sort((a, b) => a.time.localeCompare(b.time)) // Re-sort after edit
    );
    setEditingItem(null); // Close dialog by resetting editing state
    // Reset form fields after saving edit
    setNewItemTime('');
    setNewItemTitle('');
    setNewItemDetails('');
    setNewItemType('meal'); // Reset type to default
    toast({ title: "Item Updated", description: `${newItemTitle} details saved.` });
  };


  const deleteItem = (id: string) => {
     setItems(prevItems => {
         const itemToDelete = prevItems.find(item => item.id === id);
         const updatedItems = prevItems.filter(item => item.id !== id);
          toast({
             variant:"destructive",
             title: "Item Deleted",
             description: itemToDelete ? `${itemToDelete.title} removed from your plan.` : undefined
            });
         return updatedItems;
     });
  };

  const toggleComplete = (id: string) => {
     let itemTitle = '';
     let isCompleted = false;
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
            itemTitle = item.title;
            isCompleted = !item.completed;
            return { ...item, completed: isCompleted };
        }
        return item;
      })
    );
     toast({ title: "Status Updated", description: `${itemTitle} marked as ${isCompleted ? 'complete' : 'incomplete'}.` });
  };

  const handleGenerateExercises = async () => {
     setIsGeneratingExercises(true);
    try {
        const input: RecommendExercisesInput = {
            ...exercisePreferences,
             // Ensure arrays are not empty before sending
             preferences: exercisePreferences.preferences.filter(p => p.trim()),
             goals: exercisePreferences.goals.filter(g => g.trim())
        };

         if (input.preferences.length === 0 || input.goals.length === 0) {
            toast({ variant: "destructive", title: "Missing Preferences", description: "Please specify at least one preference and goal." });
            setIsGeneratingExercises(false);
            return;
        }


        const result: RecommendExercisesOutput = await recommendExercises(input);

        if (result.suggestedRoutine && result.suggestedRoutine.length > 0) {
            // Add recommended exercises to the planner
            const exerciseItems: PlannerItem[] = result.suggestedRoutine.map((ex, index) => ({
                id: `ex-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
                time: "18:00", // Default time, user can adjust
                type: 'exercise',
                title: ex.name || 'Unnamed Exercise', // Fallback title
                details: `${ex.description || 'No description.'}\n${ex.sets ? `Sets: ${ex.sets}` : ''} ${ex.reps ? `Reps: ${ex.reps}` : ''} ${ex.duration ? `Duration: ${ex.duration}` : ''}\nCategory: ${ex.category || 'General'}`,
                completed: false,
            }));

             // Add notes as a planner item if present
             if (result.notes) {
                 exerciseItems.push({
                     id: `ex-note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
                     time: "17:50", // Time before workout maybe
                     type: 'note',
                     title: 'Workout Notes',
                     details: result.notes,
                     completed: false,
                 });
             }


            setItems(prevItems => [...prevItems, ...exerciseItems].sort((a, b) => a.time.localeCompare(b.time)));
            toast({ title: "Exercises Added", description: "Recommended exercises added to your planner." });
            setIsExerciseDialogOpen(false); // Close dialog on success
        } else {
            toast({ variant: "destructive", title: "No Exercises Found", description: result.notes || "Could not generate exercises for these preferences." });
        }

    } catch (err) {
        console.error("Error generating exercises:", err);
        let errorMsg = 'An unknown error occurred.';
        let errorTitle = "Generation Failed";
        if (err instanceof Error) {
            errorMsg = err.message;
            // Check for specific API key error messages
            if (errorMsg.includes('API key not valid') || errorMsg.includes('400 Bad Request') || errorMsg.includes('API_KEY_INVALID')) {
                errorTitle = "API Key Error";
                errorMsg = "Exercise recommendation failed. Please ensure your GOOGLE_GENAI_API_KEY is set correctly in the .env file, is valid, and the server has been restarted after changes.";
            } else {
                 errorMsg = `Could not fetch exercise recommendations: ${errorMsg}.`;
            }
        }

        toast({
            variant: "destructive",
            title: errorTitle,
            description: errorMsg
         });
    } finally {
        setIsGeneratingExercises(false);
    }
  };


  const getItemIcon = (type: PlannerItem['type']) => {
    switch (type) {
      case 'meal': return <Utensils className="h-4 w-4 text-primary" />; // Use primary color for Meal
      case 'exercise': return <Dumbbell className="h-4 w-4 text-accent" />; // Use accent color for Exercise
      case 'note': return <Edit className="h-4 w-4 text-muted-foreground" />; // Use muted for Note
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Daily Diet & Exercise Planner</CardTitle>
          <CardDescription>Organize your meals, workouts, and notes. Drag items to reorder them.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* Add New Item Form */}
           <Card className="mb-6 bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Add New Plan Item</h3>
                 {/* Using Dialog for Add/Edit Form */}
                <Dialog open={editingItem !== null} onOpenChange={(isOpen) => { if (!isOpen) setEditingItem(null); }}>
                    {/* Trigger is handled by the button below */}
                     <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Plan Item' : 'Add New Plan Item'}</DialogTitle>
                        </DialogHeader>
                        {/* Re-use form fields for editing - This content needs to be inside the Dialog */}
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="itemTime" className="text-right">Time</label>
                                <Input id="itemTime" type="time" value={newItemTime} onChange={(e) => setNewItemTime(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="itemType" className="text-right">Type</label>
                                <Select value={newItemType} onValueChange={(value: PlannerItem['type']) => setNewItemType(value)}>
                                    <SelectTrigger id="itemType" className="col-span-3"> <SelectValue /> </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meal">Meal</SelectItem>
                                        <SelectItem value="exercise">Exercise</SelectItem>
                                        <SelectItem value="note">Note</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="itemTitle" className="text-right">Title</label>
                                <Input id="itemTitle" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} className="col-span-3" required placeholder={newItemType === 'meal' ? "e.g., Breakfast" : "e.g., Morning Run"} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="itemDetails" className="text-right">Details</label>
                                <Textarea id="itemDetails" value={newItemDetails} onChange={(e) => setNewItemDetails(e.target.value)} className="col-span-3" rows={3} placeholder={newItemType === 'meal' ? "e.g., Oatmeal with berries" : "e.g., 3 miles, moderate pace"}/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="button" onClick={saveEditItem}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


                {/* Display Form outside dialog for adding new items */}
                 {!editingItem && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label htmlFor="newTime" className="text-sm font-medium">Time</label>
                            <Input id="newTime" type="time" value={newItemTime} onChange={(e) => setNewItemTime(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="newType" className="text-sm font-medium">Type</label>
                            <Select value={newItemType} onValueChange={(value: PlannerItem['type']) => setNewItemType(value)}>
                                <SelectTrigger id="newType">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="meal">Meal</SelectItem>
                                    <SelectItem value="exercise">Exercise</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 sm:col-span-2 md:col-span-1">
                            <label htmlFor="newTitle" className="text-sm font-medium">Title / Name</label>
                            <Input id="newTitle" type="text" placeholder={newItemType === 'meal' ? "e.g., Breakfast" : "e.g., Morning Run"} value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} required />
                        </div>
                        <div className="sm:col-span-2 md:col-span-4 space-y-1">
                            <label htmlFor="newDetails" className="text-sm font-medium">Details (Optional)</label>
                            <Textarea id="newDetails" placeholder={newItemType === 'meal' ? "e.g., Oatmeal with berries" : "e.g., 3 miles, moderate pace"} value={newItemDetails} onChange={(e) => setNewItemDetails(e.target.value)} rows={2} />
                        </div>
                        <div className="sm:col-span-2 md:col-span-4 flex flex-wrap gap-2">
                            <Button onClick={addItem} className="flex-grow sm:flex-grow-0">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add to Plan
                            </Button>
                            {/* Exercise Recommendation Button */}
                            <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex-grow sm:flex-grow-0">
                                        <Dumbbell className="mr-2 h-4 w-4" /> Recommend Exercises
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle>Exercise Preferences</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        {/* Form to collect preferences */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="pref-type" className="text-sm font-medium block mb-1">Preferences (comma-sep)</label>
                                                <Input id="pref-type" placeholder="e.g., Yoga, Cardio" value={exercisePreferences.preferences.join(', ')} onChange={(e) => setExercisePreferences({...exercisePreferences, preferences: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
                                            </div>
                                            <div>
                                                <label htmlFor="pref-goals" className="text-sm font-medium block mb-1">Goals (comma-sep)</label>
                                                <Input id="pref-goals" placeholder="e.g., Weight Loss, Flexibility" value={exercisePreferences.goals.join(', ')} onChange={(e) => setExercisePreferences({...exercisePreferences, goals: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                             <div>
                                                <label htmlFor="pref-level" className="text-sm font-medium block mb-1">Fitness Level</label>
                                                <Select value={exercisePreferences.fitnessLevel} onValueChange={(v: ExercisePreferences['fitnessLevel']) => setExercisePreferences({...exercisePreferences, fitnessLevel: v})}>
                                                    <SelectTrigger id="pref-level"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label htmlFor="pref-time" className="text-sm font-medium block mb-1">Available Time</label>
                                                <Input id="pref-time" placeholder="e.g., 30 minutes" value={exercisePreferences.availableTime} onChange={(e) => setExercisePreferences({...exercisePreferences, availableTime: e.target.value})}/>
                                            </div>
                                             <div>
                                                <label htmlFor="pref-loc" className="text-sm font-medium block mb-1">Location</label>
                                                <Select value={exercisePreferences.location} onValueChange={(v: ExercisePreferences['location']) => setExercisePreferences({...exercisePreferences, location: v})}>
                                                    <SelectTrigger id="pref-loc"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Home">Home</SelectItem>
                                                        <SelectItem value="Gym">Gym</SelectItem>
                                                        <SelectItem value="Outdoors">Outdoors</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                         <Button variant="outline" onClick={() => setIsExerciseDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleGenerateExercises} disabled={isGeneratingExercises}>
                                            {isGeneratingExercises ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Dumbbell className="mr-2 h-4 w-4" />}
                                            Get Recommendations
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                 )}
            </Card>


          {/* Planner Items List */}
          {items.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {items.map(item => (
                      <SortableItem key={item.id} id={item.id}>
                         <Card className={cn("flex items-center p-3 transition-shadow hover:shadow-md", item.completed ? "bg-muted/50 opacity-70" : "bg-card")}>
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             {/* Grip Handle - Make it easier to grab */}
                             <span
                                className="cursor-grab touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                                aria-label="Drag to reorder"
                                >
                                 <GripVertical size={16} />
                             </span>
                             <Checkbox
                               id={`complete-${item.id}`}
                               checked={item.completed}
                               onCheckedChange={() => toggleComplete(item.id)}
                               aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                               className="flex-shrink-0"
                             />
                              <Badge variant="outline" className="whitespace-nowrap flex-shrink-0">{item.time}</Badge>
                               {getItemIcon(item.type)}
                             <div className="flex-1 min-w-0 ml-1">
                               <p className={cn("font-medium truncate", item.completed && "line-through text-muted-foreground")}>{item.title}</p>
                               {item.details && <p className={cn("text-xs text-muted-foreground truncate", item.completed && "line-through")}>{item.details}</p>}
                             </div>
                           </div>
                           <div className="ml-auto flex gap-1 pl-2 flex-shrink-0">
                                {/* Edit Button - Triggers the Dialog */}
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditItem(item)}>
                                    <Edit size={14} />
                                    <span className="sr-only">Edit Item</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteItem(item.id)}>
                                    <Trash2 size={14} />
                                    <span className="sr-only">Delete Item</span>
                                </Button>
                           </div>
                         </Card>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
          ) : (
             <div className="text-center text-muted-foreground py-10 border border-dashed rounded-lg">
                 <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="mb-2">Your planner is empty.</p>
                 <p className="text-sm">Add items using the form above or get exercise recommendations!</p>
             </div>
          )}


        </CardContent>
      </Card>
    </div>
  );
}
