import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddTaskButtonProps {
  onClick: () => void;
}

export function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-8 h-16 w-16 rounded-full shadow-lg z-10"
      aria-label="Add new task"
    >
      <Plus className="h-8 w-8" />
    </Button>
  );
}