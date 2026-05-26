export interface ResourceCategory {
  id: string
  title: string
  prompts: readonly string[]
}

export const RESOURCE_CATALOG: readonly ResourceCategory[] = [
  {
    id: "self-knowledge",
    title: "Self-Knowledge & Identity",
    prompts: [
      "What's your superpower?",
      "What have you learned about yourself in the past year?",
      "What about yourself do you have trouble acknowledging?",
      "What's a belief you held strongly that you've since changed your mind about?",
      "What's a version of yourself you had to leave behind?",
      "What's something you're still figuring out?",
      "What's something you've outgrown that you used to love — and how do you feel about that?",
    ],
  },
  {
    id: "values",
    title: "Values & Priorities",
    prompts: [
      "What's most important to you right now?",
      "Have you made space in your life for what you want?",
      'What does "home" mean to you?',
      "How do you want people to think about you or perceive you?",
      "If your legacy could be summed up in one sentence, what would you want it to say?",
    ],
  },
  {
    id: "reflection",
    title: "Reflection & Growth",
    prompts: [
      "What's the best decision you've ever made in your life?",
      "What life lesson have you learned the hard way?",
      "If you could have one conversation with your younger self, what would you say?",
      "What's a chapter of your life you'd want to revisit — not to change it, just to feel it again?",
      "What's changing in your life (for the better)?",
    ],
  },
  {
    id: "perspective",
    title: "Perspective & Worldview",
    prompts: [
      "If you could adopt another perspective about life, what would it be?",
      "If you could change one thing about the world, what would it be?",
      "What's something the world has right, that most people overlook?",
      "What's one thought-provoking question you would ask? Ask it.",
      "What's the best question you've ever been asked?",
    ],
  },
  {
    id: "joy-fear-feeling",
    title: "Joy, Fear & Feeling",
    prompts: [
      "What are you looking forward to?",
      "What scares you the most?",
      "What's the most alive you've ever felt?",
      "What's a small, ordinary thing that brings you a disproportionate amount of joy?",
      "What's the kindest thing anyone has ever done for you?",
    ],
  },
  {
    id: "people",
    title: "People & Relationships",
    prompts: [
      "Who's the most influential person in your life?",
    ],
  },
  {
    id: "imagination",
    title: "Imagination & Play",
    prompts: [
      "If you could create your own holiday, what would it be called and how would it be celebrated?",
      "Which band/artist — dead or alive — would play at your funeral? Or what band/artist are you listening to right now?",
      "If you could travel back in time to one place or one incident, what would it be?",
      "If you could teleport to any location, where would it be?",
      "If your life had a theme song, what would it be right now?",
    ],
  },
  {
    id: "everyday",
    title: "Everyday Life",
    prompts: [
      "What does your day to day look like?",
    ],
  },
] as const
