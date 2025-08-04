import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from '@/state/taskStore';
import { RecurrenceType, Task } from '@/types';
import { Checkbox } from './ui/checkbox';
import { showError } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const weekDays = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const addTask = useTaskStore(state => state.addTask);
  const [title, setTitle] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [dayOfWeek, setDayOfWeek] = useState<string>('1');
  const [biweeklyWeeks, setBiweeklyWeeks] = useState<'first_third' | 'second_fourth'>('first_third');
  const [dayOfMonth, setDayOfMonth] = useState<string>('1');
  const [useLastDay, setUseLastDay] = useState(false);
  const [isAllDay, setIsAllDay] = useState(true);
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    if (recurrenceType !== 'monthly' || dayOfMonth !== '31') {
      setUseLastDay(false);
    }
  }, [recurrenceType, dayOfMonth]);

  const resetForm = () => {
    setTitle('');
    setRecurrenceType('daily');
    setDayOfWeek('1');
    setBiweeklyWeeks('first_third');
    setDayOfMonth('1');
    setUseLastDay(false);
    setIsAllDay(true);
    setTime('09:00');
  };

  const handleSave = () => {
    if (!title.trim()) {
      showError("Please enter a title for the task.");
      return;
    }

    let recurrence: Task['recurrence'];

    switch (recurrenceType) {
      case 'daily':
        recurrence = { type: 'daily' };
        break;
      case 'weekly':
        recurrence = { type: 'weekly', dayOfWeek: parseInt(dayOfWeek, 10) };
        break;
      case 'biweekly':
        recurrence = { type: 'biweekly', dayOfWeek: parseInt(dayOfWeek, 10), biweeklyWeeks };
        break;
      case 'monthly': {
        const day = parseInt(dayOfMonth, 10);
        if (isNaN(day) || day < 1 || day > 31) {
          showError("Please enter a valid day of the month (1-31).");
          return;
        }
        recurrence = { 
          type: 'monthly', 
          dayOfMonth: day,
          isLastDayOfMonth: dayOfMonth === '31' && useLastDay
        };
        break;
      }
      default:
        return;
    }

    const taskData: Omit<Task, 'id' | 'userId' | 'createdAt'> = {
      title,
      recurrence,
      dueTime: recurrenceType === 'daily' ? (isAllDay ? 'all_day' : time) : undefined,
    };

    addTask(taskData);
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            What do you want to accomplish?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" placeholder="e.g. Walk the dog" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4 pt-2">
            <Label className="text-right pt-2">Recurrence</Label>
            <RadioGroup
              value={recurrenceType}
              onValueChange={(value: string) => setRecurrenceType(value as RecurrenceType)}
              className="col-span-3 flex flex-col gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="r1" />
                <Label htmlFor="r1">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="r2" />
                <Label htmlFor="r2">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biweekly" id="r3" />
                <Label htmlFor="r3">Bi-weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="r4" />
                <Label htmlFor="r4">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
          {(recurrenceType === 'weekly' || recurrenceType === 'biweekly') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day
              </Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map(day => (
                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {recurrenceType === 'biweekly' && (
            <div className="grid grid-cols-4 items-start gap-4 pt-2">
              <Label className="text-right pt-2">Weeks</Label>
              <RadioGroup value={biweeklyWeeks} onValueChange={(v) => setBiweeklyWeeks(v as any)} className="col-span-3 flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="first_third" id="bw1" />
                  <Label htmlFor="bw1">1st & 3rd week of month</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="second_fourth" id="bw2" />
                  <Label htmlFor="bw2">2nd & 4th week of month</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          {recurrenceType === 'monthly' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dayOfMonth" className="text-right">Day of Month</Label>
                <Input id="dayOfMonth" type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} className="col-span-3" />
              </div>
              {dayOfMonth === '31' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div/>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="last-day" checked={useLastDay} onCheckedChange={(checked) => setUseLastDay(Boolean(checked))} />
                          <Label htmlFor="last-day" className="font-normal cursor-pointer">Adjust for shorter months</Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ensures this task appears on the last day of every month.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </>
          )}
          {recurrenceType === 'daily' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Time</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox id="all-day" checked={isAllDay} onCheckedChange={(checked) => setIsAllDay(Boolean(checked))} />
                  <Label htmlFor="all-day">All day</Label>
                </div>
              </div>
              {!isAllDay && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="due-time" className="text-right">
                    Due at
                  </Label>
                  <Input id="due-time" type="time" value={time} onChange={e => setTime(e.target.value)} className="col-span-3" />
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}