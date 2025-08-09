import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from '@/state/taskStore';
import { Recurrence, Task } from '@/types';
import { Checkbox } from './ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { getRandomTaskExample } from '@/lib/taskExamples';

const weekDays = [
  { value: '0', label: 'Sunday' }, { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' }, { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const weekOfMonthOptions = [
  { value: 'first', label: 'First' }, { value: 'second', label: 'Second' }, { value: 'third', label: 'Third' },
  { value: 'fourth', label: 'Fourth' }, { value: 'last', label: 'Last' },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  recurrenceType: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  isAllDay: z.boolean(),
  time: z.string().optional(),
  dayOfWeek: z.string().optional(),
  biweeklyWeeks: z.enum(['first_third', 'second_fourth']).optional(),
  monthlyType: z.enum(['dayOfMonth', 'dayOfWeek', 'firstLastDay']).optional(),
  dayOfMonth: z.coerce.number().min(1).max(31).optional(),
  monthlyWeek: z.enum(['first', 'second', 'third', 'fourth', 'last']).optional(),
  monthlyDayOfWeek: z.string().optional(),
  monthlyPosition: z.enum(['first', 'last']).optional(),
}).superRefine((data, ctx) => {
  if (data.recurrenceType === 'weekly' || data.recurrenceType === 'biweekly') {
    if (!data.dayOfWeek) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dayOfWeek'], message: 'Day of the week is required.' });
    }
  }
  if (data.recurrenceType === 'biweekly') {
    if (!data.biweeklyWeeks) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['biweeklyWeeks'], message: 'Bi-weekly schedule is required.' });
    }
  }
  if (data.recurrenceType === 'monthly') {
    if (!data.monthlyType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyType'], message: 'Monthly schedule type is required.' });
    } else {
      if (data.monthlyType === 'dayOfMonth' && data.dayOfMonth === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dayOfMonth'], message: 'Day of month is required.' });
      } else if (data.monthlyType === 'dayOfWeek') {
        if (!data.monthlyWeek) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyWeek'], message: 'Week is required.' });
        if (!data.monthlyDayOfWeek) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyDayOfWeek'], message: 'Day of week is required.' });
      } else if (data.monthlyType === 'firstLastDay' && !data.monthlyPosition) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyPosition'], message: 'Position is required.' });
      }
    }
  }
});


type FormValues = z.infer<typeof formSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const addTask = useTaskStore(state => state.addTask);
  const [placeholder, setPlaceholder] = useState('');
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      recurrenceType: 'daily',
      isAllDay: true,
      time: '09:00',
      dayOfWeek: '1',
      biweeklyWeeks: 'first_third',
      monthlyType: 'dayOfMonth',
      dayOfMonth: 1,
      monthlyWeek: 'first',
      monthlyDayOfWeek: '1',
      monthlyPosition: 'first',
    },
  });

  const recurrenceType = form.watch('recurrenceType');
  const monthlyType = form.watch('monthlyType');

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: '',
        recurrenceType: 'daily',
        isAllDay: true,
        time: '09:00',
        dayOfWeek: '1',
        biweeklyWeeks: 'first_third',
        monthlyType: 'dayOfMonth',
        dayOfMonth: 1,
        monthlyWeek: 'first',
        monthlyDayOfWeek: '1',
        monthlyPosition: 'first',
      });
      setPlaceholder(getRandomTaskExample());
    }
  }, [isOpen, form]);

  const handleSave = (values: FormValues) => {
    let recurrence: Recurrence;

    switch (values.recurrenceType) {
      case 'daily':
        recurrence = { type: 'daily' };
        break;
      case 'weekly':
        recurrence = { type: 'weekly', dayOfWeek: parseInt(values.dayOfWeek!, 10) };
        break;
      case 'biweekly':
        recurrence = { type: 'biweekly', dayOfWeek: parseInt(values.dayOfWeek!, 10), biweeklyWeeks: values.biweeklyWeeks! };
        break;
      case 'monthly':
        if (values.monthlyType === 'dayOfMonth') {
          recurrence = { type: 'monthly', monthlyType: 'dayOfMonth', day: values.dayOfMonth! };
        } else if (values.monthlyType === 'dayOfWeek') {
          recurrence = {
            type: 'monthly',
            monthlyType: 'dayOfWeek',
            week: values.monthlyWeek!,
            dayOfWeek: parseInt(values.monthlyDayOfWeek!, 10),
          };
        } else { // firstLastDay
          recurrence = {
            type: 'monthly',
            monthlyType: 'firstLastDay',
            position: values.monthlyPosition!,
          };
        }
        break;
    }

    const taskData: Omit<Task, 'id' | 'user_id' | 'created_at'> = {
      title: values.title,
      recurrence,
      due_time: values.isAllDay ? 'all_day' : values.time,
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
                <FormControl><Input placeholder={placeholder} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="recurrenceType" render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4 pt-2">
                    {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map(type => (
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
              <div className="space-y-4 rounded-md border p-4">
                <FormField control={form.control} name="monthlyType" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Monthly Schedule</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="dayOfMonth" /></FormControl>
                          <FormLabel className="font-normal">On a specific day</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="dayOfWeek" /></FormControl>
                          <FormLabel className="font-normal">On a relative day of the week</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="firstLastDay" /></FormControl>
                          <FormLabel className="font-normal">On the first or last day</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )} />

                {monthlyType === 'dayOfMonth' && (
                  <FormField control={form.control} name="dayOfMonth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <FormControl><Input type="number" min="1" max="31" placeholder="e.g., 15" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {monthlyType === 'dayOfWeek' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="monthlyWeek" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Week</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {weekOfMonthOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="monthlyDayOfWeek" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {weekDays.map(day => <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                )}

                {monthlyType === 'firstLastDay' && (
                  <FormField control={form.control} name="monthlyPosition" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="first" id="m-first" /></FormControl>
                            <Label htmlFor="m-first" className="font-normal">First day of month</Label>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="last" id="m-last" /></FormControl>
                            <Label htmlFor="m-last" className="font-normal">Last day of month</Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />
                )}
              </div>
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
                  <FormControl><Input type="time" {...field} value={field.value ?? ''} /></FormControl>
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