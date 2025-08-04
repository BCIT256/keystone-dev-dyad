import { Checkbox } from "@/components/ui/checkbox";
import { useTaskStore } from "@/state/taskStore";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  isComplete: boolean;
}

export function TaskItem({ task, isComplete }: TaskItemProps) {
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);

  const handleToggle = () => {
    toggleTaskCompletion(task.id, new Date());
  };

  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      <Checkbox
        id={task.id}
        checked={isComplete}
        onCheckedChange={handleToggle}
        className="h-6 w-6 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <label
        htmlFor={task.id}
        className={cn(
          "text-lg font-medium leading-none cursor-pointer",
          isComplete && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </label>
    </div>
  );
}