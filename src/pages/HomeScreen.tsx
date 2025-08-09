import { useEffect, useState, useRef } from 'react';
import { useTaskStore } from '@/state/taskStore';
import { format } from 'date-fns';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskButton } from '@/components/AddTaskButton';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DevDateControls } from '@/components/DevDateControls';
import { Separator } from '@/components/ui/separator';
import { useDrag, Handler } from '@use-gesture/react';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { useQuoteStore } from '@/state/quoteStore';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function HomeScreen() {
  const { fetchTasks, getTasksForDate, isLoading, currentDate, adsVisible, nextDay, previousDay, completeAllTasks } = useTaskStore();
  const { currentQuote, setDailyQuote } = useQuoteStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
    setDailyQuote();
  }, [fetchTasks, setDailyQuote]);

  const dragHandler: Handler<'drag'> = ({ active, down, movement: [mx], direction: [xDir] }) => {
    const dragDistance = Math.abs(mx);
    const dragThreshold = (containerRef.current?.clientWidth ?? 300) / 4;

    if (!active && dragDistance > dragThreshold) {
      if (xDir > 0) {
        previousDay();
      } else {
        nextDay();
      }
      controls.start({ x: 0, opacity: 1, transition: { duration: 0.3 } });
    } else {
      controls.start({
        x: down ? mx : 0,
        opacity: down ? 1 - dragDistance / 300 : 1,
        transition: { duration: 0 }
      });
    }
  };

  const bind = useDrag(dragHandler, {
    axis: 'x',
    threshold: 10,
  });

  const handleCompleteAll = () => {
    completeAllTasks(currentDate);
  };

  const tasksForDate = getTasksForDate(currentDate);
  const dailyTasks = tasksForDate.filter(t => t.task.recurrence.type === 'daily');
  const scheduledTasks = tasksForDate.filter(t => t.task.recurrence.type !== 'daily');

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col flex-grow overflow-x-hidden" ref={containerRef}>
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter">{getGreeting()}, User</h1>
        <p className="text-lg text-muted-foreground mt-2">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
      </header>

      <motion.div {...bind() as any} animate={controls} className="cursor-grab active:cursor-grabbing" style={{ touchAction: 'pan-y' }}>
        <div className="flex justify-center">
          <img src="/placeholder.svg" alt="Artwork" className="w-full max-w-md h-56 object-cover rounded-xl bg-muted" />
        </div>

        {currentQuote && (
          <figure className="my-8 text-center max-w-md mx-auto">
            <blockquote className="font-dancing-script text-2xl italic text-foreground">
              “{currentQuote.quoteText}”
            </blockquote>
            <figcaption className="mt-2 text-sm text-muted-foreground">
              — {currentQuote.attributedAuthor}
            </figcaption>
          </figure>
        )}

        <main className="flex flex-col flex-grow">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Today's Agenda</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">🔥 5-day streak!</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={handleCompleteAll}>I'm finished</Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Checks off all your tasks for the day.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : tasksForDate.length > 0 ? (
                <div className="space-y-2">
                  {dailyTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground px-6 pt-4 pb-2">Daily Habits</h3>
                      {dailyTasks.map(({ task, isComplete }) => (
                        <TaskItem key={task.id} task={task} isComplete={isComplete} />
                      ))}
                    </div>
                  )}
                  {dailyTasks.length > 0 && scheduledTasks.length > 0 && <Separator />}
                  {scheduledTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground px-6 pt-4 pb-2">Scheduled Tasks</h3>
                      {scheduledTasks.map(({ task, isComplete }) => (
                        <TaskItem key={task.id} task={task} isComplete={isComplete} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-lg text-muted-foreground">All clear for this day!</p>
                  <p className="text-sm text-muted-foreground mt-2">Add a new task to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </motion.div>

      <div className="flex-grow" />
      <div className="pt-8">
        <DevDateControls />
      </div>

      <AddTaskButton onClick={() => setIsModalOpen(true)} adsVisible={adsVisible} />
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}