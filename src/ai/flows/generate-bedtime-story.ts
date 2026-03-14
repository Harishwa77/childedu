'use server';
/**
 * @fileOverview A Genkit flow for generating personalized bedtime stories for children.
 *
 * - generateBedtimeStory - A function that creates a unique story based on classroom activities.
 * - BedtimeStoryInput - The input type for the function.
 * - BedtimeStoryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BedtimeStoryInputSchema = z.object({
  childName: z.string().describe("The name of the child."),
  activitySummary: z.string().describe("The educational activity that happened today."),
  theme: z.enum(['Adventure', 'Space', 'Magic', 'Animals']).default('Adventure'),
});
export type BedtimeStoryInput = z.infer<typeof BedtimeStoryInputSchema>;

const BedtimeStoryOutputSchema = z.object({
  title: z.string().describe("The title of the bedtime story."),
  story: z.string().describe("The full text of the personalized story."),
  moral: z.string().describe("A simple moral lesson for the child."),
});
export type BedtimeStoryOutput = z.infer<typeof BedtimeStoryOutputSchema>;

export async function generateBedtimeStory(input: BedtimeStoryInput): Promise<BedtimeStoryOutput> {
  return bedtimeStoryFlow(input);
}

const bedtimeStoryPrompt = ai.definePrompt({
  name: 'bedtimeStoryPrompt',
  input: { schema: BedtimeStoryInputSchema },
  output: { schema: BedtimeStoryOutputSchema },
  prompt: `You are an expert children's book author. Your goal is to write a calming, short bedtime story for a child named {{{childName}}}.

The story MUST incorporate the following classroom activity that {{{childName}}} did today:
"{{{activitySummary}}}"

Theme: {{{theme}}}

Instructions:
1. Make the story engaging and suitable for a 3-5 year old.
2. Ensure {{{childName}}} is the hero of the story.
3. Use simple language but rich imagery.
4. Conclude with a heartwarming moral that reinforces the educational value of the activity.

Tone: Calming, whimsical, and encouraging.`,
});

const bedtimeStoryFlow = ai.defineFlow(
  {
    name: 'bedtimeStoryFlow',
    inputSchema: BedtimeStoryInputSchema,
    outputSchema: BedtimeStoryOutputSchema,
  },
  async (input) => {
    const { output } = await bedtimeStoryPrompt(input);
    if (!output) throw new Error('Failed to generate bedtime story.');
    return output;
  }
);
