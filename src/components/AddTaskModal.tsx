import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from '@/state/taskStore';
import { RecurrenceType, Task } from '@/types';
import { Checkbox } from './ui/checkbox';

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
  const [isAllDay, setIsAllDay] = useState(true);
  const [time, setTime] = useState('09:00');

  const handleSave = () => {
    if (!title.trim()) return;

    const taskData: Omit<Task, 'id' | 'userId' | 'createdAt'> = {
      title,
      recurrence: {
        type: recurrenceType,
        ...(recurrenceType !== 'daily' && { dayOfWeek: parseInt(dayOfWeek, 10) }),
      },
      dueTime: recurrenceType === 'daily' ? (isAllDay ? 'all_day' : time) : undefined,
    };

    addTask(taskData);
    onClose();
    // Reset form
    setTitle('');
    setRecurrenceType('daily');
    setIsAllDay(true);
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Recurrence</Label>
            <RadioGroup
              value={recurrenceType}
              onValueChange={(value: string) => setRecurrenceType(value as RecurrenceType)}
              className="col-span-3 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="r1" />
                <Label htmlFor="r1">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="r2" />
                <Label htmlFor="r2">Weekly</Label>
              </div>
            </RadioGroup>
          </div>
          {recurrenceType === 'weekly' && (
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