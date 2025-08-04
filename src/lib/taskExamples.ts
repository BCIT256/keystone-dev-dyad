export const TASK_EXAMPLES: string[] = [
  'Walk the dog',
  'Go for a 30-minute run',
  'Read a chapter of a book',
  'Meditate for 10 minutes',
  'Write a journal entry',
  'Plan tomorrow\'s schedule',
  'Drink 8 glasses of water',
  'Eat a healthy breakfast',
  'Take daily vitamins',
  'Stretch for 15 minutes',
  'Call a family member',
  'Clear email inbox to zero',
  'Tidy up the workspace',
  'Do a 20-minute HIIT workout',
  'Practice a new language on Duolingo',
  'Watch a tutorial for a new skill',
  'Water the houseplants',
  'Take out the trash and recycling',
  'Start a load of laundry',
  'Empty the dishwasher',
  'Create a grocery list',
  'Meal prep for the next 3 days',
  'Pay outstanding bills',
  'Review monthly budget',
  'Deep clean the bathroom',
  'Vacuum all floors',
  'Organize one drawer or closet',
  'Declutter a shelf or surface',
  'Listen to an educational podcast',
  'Watch a thought-provoking documentary',
  'Write down three things you\'re grateful for',
  'Set 3 main goals for the week',
  'Review progress on quarterly goals',
  'Connect with a colleague on LinkedIn',
  'Update professional portfolio',
  'Work on a side project for an hour',
  'Fix a nagging bug in the code',
  'Outline a new blog post',
  'Sketch a new UI concept',
  'Code a small feature or component',
  'Read two articles from a tech journal',
  'Prepare agenda for an upcoming meeting',
  'Follow up on important emails',
  'Brainstorm ideas for a new project',
  'Create a mind map for a complex topic',
  'Practice a presentation',
  'Take a 15-minute walk outside',
  'Do some deep breathing exercises',
  'Listen to a calming playlist',
  'Unfollow negative social media accounts',
  'Spend an hour on a favorite hobby',
  'Draw or paint for 30 minutes',
  'Practice a musical instrument',
  'Cook a new, healthy recipe',
  'Bake cookies from scratch',
  'Try a new local coffee shop',
  'Go to the gym for a strength session',
  'Attend a yoga or pilates class',
  'Go for a swim',
  'Go for a bike ride',
  'Plan a weekend hike',
  'Research a future travel destination',
  'Book flights for a vacation',
  'Learn to juggle with 3 balls',
  'Complete a Sudoku or crossword puzzle',
  'Play a board game with family/friends',
  'Watch the sunset or sunrise',
  'Identify three constellations in the night sky',
  'Visit a local museum or art gallery',
  'Find a free local event to attend',
  'Sign up to volunteer for a cause',
  'Donate old clothes to charity',
  'Offer to help a neighbor with a task',
  'Perform a random act of kindness',
  'Give a genuine compliment to someone',
  'Learn a simple magic trick',
  'Write a short poem or story',
  'Organize a folder of old photos',
  'Organize digital files on computer',
  'Backup important data to the cloud',
  'Clean the inside of the car',
  'Get an automatic car wash',
  'Check car tire pressure and fluids',
  'Schedule a dentist appointment',
  'Schedule an annual doctor check-up',
  'Floss teeth thoroughly',
  'Apply a hydrating face mask',
  'Book a haircut appointment',
  'Mow the lawn',
  'Weed the garden beds',
  'Fix a leaky faucet',
  'Change a burnt-out lightbulb',
  'Learn a new knitting stitch',
  'Try a new guided meditation on an app',
  'Listen to an audiobook during commute',
  'Review and update your resume',
  'Learn 5 new keyboard shortcuts',
  'Clean your phone screen and case',
  'Unsubscribe from junk emails',
];

let recentlyUsed: string[] = [];

/**
 * Gets a random task example that hasn't been used in the last 3 calls.
 * @returns A string with a task example.
 */
export const getRandomTaskExample = (): string => {
  const availableExamples = TASK_EXAMPLES.filter(ex => !recentlyUsed.includes(ex));

  // If all examples have been recently used (unlikely but possible if queue is large),
  // reset the queue to make all examples available again.
  if (availableExamples.length === 0) {
    recentlyUsed = [];
    const allExamples = [...TASK_EXAMPLES];
    const randomIndex = Math.floor(Math.random() * allExamples.length);
    const example = allExamples[randomIndex];
    recentlyUsed.push(example);
    return example;
  }

  const randomIndex = Math.floor(Math.random() * availableExamples.length);
  const example = availableExamples[randomIndex];

  // Add the new example to the queue and ensure it doesn't exceed the size limit.
  recentlyUsed.push(example);
  if (recentlyUsed.length > 3) {
    recentlyUsed.shift(); // Remove the oldest one
  }

  return example;
};