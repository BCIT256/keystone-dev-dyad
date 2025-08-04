import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddTaskButtonProps {
  onClick: () => void;
  adsVisible: boolean;
}

export function AddTaskButton({ onClick, adsVisible }: AddTaskButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed right-8 h-16 w-16 rounded-full shadow-lg z-10",
        adsVisible ? "bottom-32" : "bottom-24"
      )}
      aria-label="Add new task"
    >
      <Plus className="h-8 w-8" />
    </Button>
  );
}