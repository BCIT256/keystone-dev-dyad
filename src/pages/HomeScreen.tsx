import { useEffect, useState } from 'react';
import { useTaskStore } from '@/state/taskStore';
import { format } from 'date-fns';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskButton } from '@/components/AddTaskButton';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function HomeScreen() {
  const { fetchTasks, getTasksForDate, isLoading } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const today = new Date();
  const tasksForToday = getTasksForDate(today);

  return (
    <div className="container mx-auto p-4 md:p-8 pb-24">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{getGreeting()}, User</h1>
        <p className="text-muted-foreground text-lg">{format(today, 'EEEE, MMMM d')}</p>
      </header>

      <main>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Today's Tasks</CardTitle>
              <p className="text-sm text-muted-foreground">🔥 5-day streak!</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : tasksForToday.length > 0 ? (
              <div>
                {tasksForToday.map(({ task, isComplete }) => (
                  <TaskItem key={task.id} task={task} isComplete={isComplete} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <p className="text-lg text-muted-foreground">All clear for today!</p>
                <p className="text-sm text-muted-foreground">Add a new task to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddTaskButton onClick={() => setIsModalOpen(true)} />
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}