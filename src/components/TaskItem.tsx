import { Checkbox } from "@/components/ui/checkbox";
import { useTaskStore } from "@/state/taskStore";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  isComplete: boolean;
}

export function TaskItem({ task, isComplete }: TaskItemProps) {
  const { toggleTaskCompletion, viewDate } = useTaskStore();
  const dateString = format(viewDate, 'yyyy-MM-dd');

  const handleToggle = () => {
    toggleTaskCompletion(task.id, viewDate);
  };

  return (
    <div className="flex items-center space-x-4 px-6 py-4 border-b">
      <Checkbox
        id={`${task.id}-${dateString}`}
        checked={isComplete}
        onCheckedChange={handleToggle}
        className="h-6 w-6 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <label
        htmlFor={`${task.id}-${dateString}`}
        className={cn(
          "text-base font-normal leading-none cursor-pointer",
          isComplete && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </label>
      {task.dueTime && task.dueTime !== 'all_day' && (
        <span className="ml-auto text-sm font-mono text-muted-foreground">
          {task.dueTime}
        </span>
      )}
    </div>
  );
}