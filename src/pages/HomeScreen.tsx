import { useEffect, useState, useRef } from 'react';
import { useTaskStore } from '@/state/taskStore';
import { format, isToday, isYesterday, isTomorrow, subDays, isAfter, startOfDay } from 'date-fns';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskButton } from '@/components/AddTaskButton';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const getAgendaTitle = (date: Date) => {
  if (isToday(date)) return "Today's Agenda";
  if (isYesterday(date)) return "Yesterday's Agenda";
  if (isTomorrow(date)) return "Tomorrow's Agenda";
  
  const day = format(date, 'd');
  let suffix = 'th';
  if (day.endsWith('1') && !day.endsWith('11')) suffix = 'st';
  else if (day.endsWith('2') && !day.endsWith('12')) suffix = 'nd';
  else if (day.endsWith('3') && !day.endsWith('13')) suffix = 'rd';
  
  return `${format(date, 'MMMM d')}${suffix}'s Agenda`;
};

export default function HomeScreen() {
  const { fetchTasks, getTasksForDate, isLoading, viewDate, adsVisible, nextDay, previousDay, goToToday, completeAllTasks } = useTaskStore();
  const { currentQuote, setDailyQuote } = useQuoteStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const agendaCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
    setDailyQuote();
  }, [fetchTasks, setDailyQuote]);

  useEffect(() => {
    controls.start({ opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } });
  }, [viewDate, controls]);

  const dragHandler: Handler<'drag'> = ({
    event,
    active,
    movement: [mx, my],
    direction: [xDir, yDir],
    initial: [, iy],
    last,
    cancel,
  }) => {
    const targetIsAgenda = agendaCardRef.current?.contains(event.target as Node);
    const isVertical = Math.abs(my) > Math.abs(mx);

    // If the gesture should be a native scroll, we cancel the drag gesture.
    // This applies to:
    // 1. Any swipe not on the agenda card.
    // 2. An upward swipe (scrolling down) on the agenda card.
    if (!targetIsAgenda || (isVertical && yDir < 0)) {
      return cancel();
    }

    // At this point, the gesture is on the agenda and is either horizontal or downwards.
    // We will handle it, so the default scroll behavior should be prevented.

    if (active) {
      // Provide horizontal drag feedback during the gesture
      if (!isVertical) {
        controls.start({ x: mx, opacity: 1 - Math.abs(mx) / (containerRef.current?.offsetWidth || 500) }, { immediate: true });
      }
      return;
    }

    // --- Drag has ended, decide which action to take ---

    // Handle horizontal swipe on the agenda card
    if (!isVertical) {
      const dragThreshold = (containerRef.current?.offsetWidth || 500) / 3.5;
      if (Math.abs(mx) > dragThreshold) {
        const direction = xDir > 0 ? 1 : -1;
        if (direction === 1) { // Swiping right to previous day
          const yesterday = subDays(new Date(), 1);
          if (!isAfter(startOfDay(viewDate), startOfDay(yesterday))) {
            controls.start({ x: 0, opacity: 1, transition: { duration: 0.25 } }); // Snap back
            return;
          }
        }
        controls.start({ x: direction * 500, opacity: 0, transition: { duration: 0.15 } }).then(() => {
          if (direction === 1) previousDay(); else nextDay();
          controls.set({ x: -direction * 500 }); // Prepare for animate in
        });
      } else {
        // If not dragged far enough, snap back
        controls.start({ x: 0, opacity: 1, transition: { duration: 0.25 } });
      }
      return;
    }

    // Handle vertical swipe down on the agenda card
    if (isVertical && yDir > 0) {
      // Case 1: Swipe down from the top of the screen to go to Today's agenda
      if (iy < 150) {
        if (my > 80) { // Check if dragged far enough
          if (!isToday(viewDate)) {
            controls.start({ opacity: 0, transition: { duration: 0.15 } }).then(goToToday);
          } else {
            // Jiggle if already on today
            controls.start({ x: 0, y: [0, -20, 0], transition: { duration: 0.3 } });
          }
        } else {
          controls.start({ x: 0, opacity: 1, transition: { duration: 0.25 } });
        }
        return;
      }
      
      // Case 2: Swipe down when not at the top of the screen to scroll to the top
      if (iy >= 150) {
        if (my > 50) { // Check if dragged far enough
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Snap back any minor horizontal movement
        controls.start({ x: 0, opacity: 1, transition: { duration: 0.25 } });
        return;
      }
    }
  };

  const bind = useDrag(dragHandler, { threshold: 10 });

  const handleCompleteAll = () => {
    completeAllTasks(viewDate);
  };

  const tasksForDate = getTasksForDate(viewDate);
  const dailyTasks = tasksForDate.filter(t => t.task.recurrence.type === 'daily');
  const scheduledTasks = tasksForDate.filter(t => t.task.recurrence.type !== 'daily');

  return (
    <div {...bind() as any} className="container mx-auto p-4 md:p-8 flex flex-col flex-grow overflow-x-hidden" ref={containerRef} style={{ touchAction: 'none' }}>
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter">{getGreeting()}, User</h1>
        <p className="text-lg text-muted-foreground mt-2">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </header>

      <motion.div animate={controls} className="flex flex-col flex-grow">
        <main className="flex flex-col flex-grow">
          <Card ref={agendaCardRef} className="cursor-grab active:cursor-grabbing">
            <CardHeader>
              <div className="flex justify-between items-center gap-4">
                <div>
                  <CardTitle className="text-xl">{getAgendaTitle(viewDate)}</CardTitle>
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

        <div className="mt-auto pt-8">
          <div className="flex justify-center">
            <img src="/placeholder.svg" alt="Artwork" className="w-full max-w-md h-56 object-cover rounded-xl bg-muted" />
          </div>

          {currentQuote && (
            <figure className="my-8 text-center max-w-md mx-auto">
              <blockquote className="font-dancing-script text-2xl text-foreground">
                “{currentQuote.quoteText}”
              </blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground">
                — {currentQuote.attributedAuthor}
              </figcaption>
            </figure>
          )}
        </div>
      </motion.div>

      <AddTaskButton onClick={() => setIsModalOpen(true)} adsVisible={adsVisible} />
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}