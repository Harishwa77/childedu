'use server';
/**
 * @fileOverview A Genkit flow for generating interactive mini-learning games for children.
 *
 * - generateLearningGame - A function that creates game logic based on a theme and type.
 * - LearningGameInput - Input schema.
 * - LearningGameOutput - Output schema.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LearningGameInputSchema = z.object({
  theme: z.string().describe('The theme for the game (e.g., "Dinosaurs", "Deep Sea", "Numbers").'),
  gameType: z.enum(['matching', 'puzzle']).describe('The type of mini-game to generate.'),
});
export type LearningGameInput = z.infer<typeof LearningGameInputSchema>;

const LearningGameOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  matchingGame: z.object({
    pairs: z.array(z.object({
      id: z.string(),
      icon: z.string().describe('An emoji representing the item.'),
      word: z.string().describe('The word corresponding to the emoji.'),
    })),
  }).optional(),
  puzzleGame: z.object({
    word: z.string(),
    icon: z.string(),
    hint: z.string(),
  }).optional(),
  learningObjective: z.string().describe('A short sentence for teachers/parents about what this game teaches.'),
});
export type LearningGameOutput = z.infer<typeof LearningGameOutputSchema>;

export async function generateLearningGame(input: LearningGameInput): Promise<LearningGameOutput> {
  return generateLearningGameFlow(input);
}

const gamePrompt = ai.definePrompt({
  name: 'generateLearningGamePrompt',
  input: { schema: LearningGameInputSchema },
  output: { schema: LearningGameOutputSchema },
  prompt: `You are an expert educational game designer for toddlers (ages 3-5). 
Your task is to generate the logic and content for a mini-game based on the user's requested theme.

Theme: {{{theme}}}
Game Type: {{{gameType}}}

INSTRUCTIONS:
1. If gameType is 'matching', provide 4-6 unique pairs of emojis and their matching words related to the theme.
2. If gameType is 'puzzle', provide a single short word (3-6 letters) and its corresponding icon and hint.
3. Ensure all content is child-friendly, colorful, and fun.
4. Provide a clear learning objective for the parent.

TONE: Playful and encouraging.`,
});

const generateLearningGameFlow = ai.defineFlow(
  {
    name: 'generateLearningGameFlow',
    inputSchema: LearningGameInputSchema,
    outputSchema: LearningGameOutputSchema,
  },
  async (input) => {
    const { output } = await gamePrompt(input);
    if (!output) throw new Error('Failed to generate learning game.');
    return output;
  }
);
