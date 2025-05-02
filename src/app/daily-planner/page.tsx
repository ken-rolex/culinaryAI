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
import { PlusCircle, GripVertical, Trash2, Utensils, Dumbbell, Edit, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { SortableItem } from '@/components/sortable-item'; // Needs to be created
import { recommendExercises, RecommendExercisesInput, RecommendExercisesOutput } from '@/ai/flows/recommend-exercises';
import { Loader2 } from 'lucide-react';

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
    const savedItems = localStorage.getItem('dailyPlannerItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Save items to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('dailyPlannerItems', JSON.stringify(items));
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
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };

  const addItem = () => {
    if (!newItemTime || !newItemTitle) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide time and title." });
      return;
    }
    const newItem: PlannerItem = {
      id: `item-${Date.now()}`,
      time: newItemTime,
      type: newItemType,
      title: newItemTitle,
      details: newItemDetails,
      completed: false,
    };
    setItems(prevItems => [...prevItems, newItem].sort((a, b) => a.time.localeCompare(b.time))); // Add and sort
    // Reset form
    setNewItemTime('');
    setNewItemTitle('');
    setNewItemDetails('');
    toast({ title: "Item Added", description: `${newItem.title} scheduled for ${newItem.time}.` });
  };

   const startEditItem = (item: PlannerItem) => {
    setEditingItem(item);
    // Prefill state for the dialog (optional, could also pass directly)
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
    setEditingItem(null); // Close dialog implicitly by resetting state
    // Reset form fields
    setNewItemTime('');
    setNewItemTitle('');
    setNewItemDetails('');
     toast({ title: "Item Updated", description: `${newItemTitle} details saved.` });
  };


  const deleteItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    toast({ variant:"destructive", title: "Item Deleted" });
  };

  const toggleComplete = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleGenerateExercises = async () => {
     setIsGeneratingExercises(true);
    try {
        const input: RecommendExercisesInput = {
            ...exercisePreferences
        };
        const result: RecommendExercisesOutput = await recommendExercises(input);

        if (result.suggestedRoutine.length > 0) {
            // Add recommended exercises to the planner
            const exerciseItems: PlannerItem[] = result.suggestedRoutine.map((ex, index) => ({
                id: `ex-${Date.now()}-${index}`,
                time: "18:00", // Default time, user can adjust
                type: 'exercise',
                title: ex.name,
                details: `${ex.description}\n${ex.sets ? `Sets: ${ex.sets}` : ''} ${ex.reps ? `Reps: ${ex.reps}` : ''} ${ex.duration ? `Duration: ${ex.duration}` : ''}\nCategory: ${ex.category || 'General'}`,
                completed: false,
            }));

             // Add notes as a planner item if present
             if (result.notes) {
                 exerciseItems.push({
                     id: `ex-note-${Date.now()}`,
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

    } catch (error) {
        console.error("Error generating exercises:", error);
        toast({ variant: "destructive", title: "Generation Failed", description: "Could not fetch exercise recommendations." });
    } finally {
        setIsGeneratingExercises(false);
    }
  };


  const getItemIcon = (type: PlannerItem['type']) => {
    switch (type) {
      case 'meal': return <Utensils className="h-4 w-4 text-blue-500" />;
      case 'exercise': return <Dumbbell className="h-4 w-4 text-green-500" />;
      case 'note': return <Edit className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Daily Diet & Exercise Planner</CardTitle>
          <CardDescription>Organize your meals, workouts, and notes. Drag to reorder.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* Add New Item Form */}
           <Card className="mb-6 bg-muted/50 p-4">
                <h3 className="text-lg font-semibold mb-3">Add New Plan Item</h3>
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
                    <div className="sm:col-span-2 md:col-span-4">
                        <Button onClick={addItem} className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add to Plan
                        </Button>
                         {/* Exercise Recommendation Button */}
                        <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto ml-0 mt-2 md:mt-0 md:ml-2">
                                    <Dumbbell className="mr-2 h-4 w-4" /> Recommend Exercises
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Exercise Preferences</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {/* Form to collect preferences */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label htmlFor="pref-type" className="text-sm font-medium">Preferences (comma-sep)</label>
                                             <Input id="pref-type" value={exercisePreferences.preferences.join(', ')} onChange={(e) => setExercisePreferences({...exercisePreferences, preferences: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
                                        </div>
                                         <div>
                                             <label htmlFor="pref-goals" className="text-sm font-medium">Goals (comma-sep)</label>
                                             <Input id="pref-goals" value={exercisePreferences.goals.join(', ')} onChange={(e) => setExercisePreferences({...exercisePreferences, goals: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="pref-level" className="text-sm font-medium">Fitness Level</label>
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
                                             <label htmlFor="pref-time" className="text-sm font-medium">Available Time</label>
                                             <Input id="pref-time" value={exercisePreferences.availableTime} onChange={(e) => setExercisePreferences({...exercisePreferences, availableTime: e.target.value})}/>
                                        </div>
                                    </div>
                                      <div>
                                            <label htmlFor="pref-loc" className="text-sm font-medium">Location</label>
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
                                <DialogFooter>
                                    <Button onClick={handleGenerateExercises} disabled={isGeneratingExercises}>
                                        {isGeneratingExercises ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Dumbbell className="mr-2 h-4 w-4" />}
                                        Get Recommendations
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </div>
                </div>
            </Card>


          {/* Planner Items List */}
          {items.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {items.map(item => (
                      <SortableItem key={item.id} id={item.id}>
                         <Card className={cn("flex items-center p-3 transition-colors hover:bg-muted/80", item.completed && "bg-muted/30 opacity-70")}>
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             <span className="cursor-grab touch-none text-muted-foreground hover:text-foreground"><GripVertical size={16} /></span>
                             <Checkbox
                               id={`complete-${item.id}`}
                               checked={item.completed}
                               onCheckedChange={() => toggleComplete(item.id)}
                               aria-label={`Mark ${item.title} as complete`}
                             />
                              <Badge variant="outline" className="whitespace-nowrap">{item.time}</Badge>
                               {getItemIcon(item.type)}
                             <div className="flex-1 min-w-0">
                               <p className={cn("font-medium truncate", item.completed && "line-through")}>{item.title}</p>
                               {item.details && <p className={cn("text-xs text-muted-foreground truncate", item.completed && "line-through")}>{item.details}</p>}
                             </div>
                           </div>
                           <div className="ml-auto flex gap-2 pl-2">
                                {/* Edit Button using Dialog */}
                                <Dialog open={editingItem?.id === item.id} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditItem(item)}>
                                            <Edit size={14} />
                                            <span className="sr-only">Edit Item</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Plan Item</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                             {/* Re-use form fields for editing */}
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="editTime" className="text-right">Time</label>
                                                <Input id="editTime" type="time" value={newItemTime} onChange={(e) => setNewItemTime(e.target.value)} className="col-span-3" required />
                                            </div>
                                             <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="editType" className="text-right">Type</label>
                                                <Select value={newItemType} onValueChange={(value: PlannerItem['type']) => setNewItemType(value)}>
                                                    <SelectTrigger id="editType" className="col-span-3"> <SelectValue /> </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="meal">Meal</SelectItem>
                                                        <SelectItem value="exercise">Exercise</SelectItem>
                                                        <SelectItem value="note">Note</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="editTitle" className="text-right">Title</label>
                                                <Input id="editTitle" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} className="col-span-3" required />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="editDetails" className="text-right">Details</label>
                                                <Textarea id="editDetails" value={newItemDetails} onChange={(e) => setNewItemDetails(e.target.value)} className="col-span-3" rows={3} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            {/* <DialogClose asChild> */}
                                                <Button type="button" onClick={saveEditItem}>Save Changes</Button>
                                            {/* </DialogClose> */}
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>


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
             <div className="text-center text-muted-foreground py-10">
                <p>Your planner is empty. Add some items above or get exercise recommendations!</p>
             </div>
          )}


        </CardContent>
      </Card>
    </div>
  );
}

