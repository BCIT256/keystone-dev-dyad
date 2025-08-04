import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from '@/state/taskStore';
import { RecurrenceType, Task } from '@/types';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { HelpCircle } from 'lucide-react';

const weekDays = [
  { value: '0', label: 'Sunday' }, { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' }, { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  recurrenceType: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  dayOfWeek: z.string().optional(),
  biweeklyWeeks: z.enum(['first_third', 'second_fourth']).optional(),
  dayOfMonth: z.coerce.number().min(1).max(31).optional(),
  useLastDay: z.boolean().optional(),
  isAllDay: z.boolean(),
  time: z.string().optional(),
}).refine(data => data.recurrenceType !== 'weekly' || !!data.dayOfWeek, {
  message: "Day of the week is required.", path: ["dayOfWeek"],
}).refine(data => data.recurrenceType !== 'biweekly' || !!data.dayOfWeek, {
  message: "Day of the week is required.", path: ["dayOfWeek"],
}).refine(data => data.recurrenceType !== 'biweekly' || !!data.biweeklyWeeks, {
  message: "Bi-weekly schedule is required.", path: ["biweeklyWeeks"],
}).refine(data => data.recurrenceType !== 'monthly' || !!data.dayOfMonth, {
  message: "Day of the month is required.", path: ["dayOfMonth"],
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const addTask = useTaskStore(state => state.addTask);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      recurrenceType: 'daily',
      dayOfWeek: '1',
      biweeklyWeeks: 'first_third',
      dayOfMonth: 1,
      useLastDay: false,
      isAllDay: true,
      time: '09:00',
    },
  });

  const recurrenceType = form.watch('recurrenceType');
  const dayOfMonth = form.watch('dayOfMonth');

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleSave = (values: FormValues) => {
    let recurrence: Task['recurrence'];

    switch (values.recurrenceType) {
      case 'daily':
        recurrence = { type: 'daily' };
        break;
      case 'weekly':
        recurrence = { type: 'weekly', dayOfWeek: parseInt(values.dayOfWeek!, 10) };
        break;
      case 'biweekly':
        recurrence = { type: 'biweekly', dayOfWeek: parseInt(values.dayOfWeek!, 10), biweeklyWeeks: values.biweeklyWeeks };
        break;
      case 'monthly':
        recurrence = { type: 'monthly', dayOfMonth: values.dayOfMonth, isLastDayOfMonth: values.dayOfMonth === 31 && values.useLastDay };
        break;
    }

    const taskData: Omit<Task, 'id' | 'userId' | 'createdAt'> = {
      title: values.title,
      recurrence,
      dueTime: values.isAllDay ? 'all_day' : values.time,
    };

    addTask(taskData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>What do you want to accomplish?</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="e.g. Walk the dog" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="recurrenceType" render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4 pt-2">
                    {(['daily', 'weekly', 'biweekly', 'monthly'] as RecurrenceType[]).map(type => (
                      <FormItem key={type} className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value={type} id={`r-${type}`} /></FormControl>
                        <Label htmlFor={`r-${type}`} className="capitalize font-normal">{type}</Label>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )} />

            {(recurrenceType === 'weekly' || recurrenceType === 'biweekly') && (
              <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {weekDays.map(day => <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {recurrenceType === 'biweekly' && (
              <FormField control={form.control} name="biweeklyWeeks" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weeks</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1">
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="first_third" id="bw1" /></FormControl><Label htmlFor="bw1" className="font-normal">1st & 3rd week of month</Label></FormItem>
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="second_fourth" id="bw2" /></FormControl><Label htmlFor="bw2" className="font-normal">2nd & 4th week of month</Label></FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )} />
            )}

            {recurrenceType === 'monthly' && (
              <>
                <FormField control={form.control} name="dayOfMonth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month</FormLabel>
                    <FormControl><Input type="number" min="1" max="31" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {Number(dayOfMonth) === 31 && (
                  <FormField control={form.control} name="useLastDay" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <div className="flex items-center gap-1.5">
                          <FormLabel>End of Month</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adjusts for shorter months (e.g., 30 days).</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">Ensures this task appears on the last day of every month.</p>
                      </div>
                    </FormItem>
                  )} />
                )}
              </>
            )}

            <FormField control={form.control} name="isAllDay" render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl><Checkbox id="all-day" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <Label htmlFor="all-day" className="font-normal">All day</Label>
              </FormItem>
            )} />

            {!form.watch('isAllDay') && (
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Due at</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                </FormItem>
              )} />
            )}
            
            <DialogFooter>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}