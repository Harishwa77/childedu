'use server';
/**
 * @fileOverview A Genkit flow for converting a spoken educational idea into a structured lesson plan and parent summary.
 *
 * - voiceToLesson - A function that transcribes a voice memo and generates a curriculum plan.
 * - VoiceToLessonInput - The input type for the function.
 * - VoiceToLessonOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VoiceToLessonInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The voice recording of the teacher's idea as a data URI. Format: 'data:audio/wav;base64,...'"
    ),
  language: z.enum(['English', 'Tamil', 'Hindi']).default('English'),
});
export type VoiceToLessonInput = z.infer<typeof VoiceToLessonInputSchema>;

const VoiceToLessonOutputSchema = z.object({
  lessonPlan: z.object({
    title: z.string(),
    objectives: z.array(z.string()),
    materials: z.array(z.string()),
    steps: z.array(z.string()),
    assessment: z.string(),
  }),
  parentSummary: z.string().describe('A simplified, encouraging summary for parents.'),
  transcript: z.string().describe('The transcribed text of the voice memo.'),
});
export type VoiceToLessonOutput = z.infer<typeof VoiceToLessonOutputSchema>;

export async function voiceToLesson(input: VoiceToLessonInput): Promise<VoiceToLessonOutput> {
  return voiceToLessonFlow(input);
}

const voiceToLessonPrompt = ai.definePrompt({
  name: 'voiceToLessonPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: VoiceToLessonInputSchema },
  output: { schema: VoiceToLessonOutputSchema },
  prompt: `You are an expert curriculum designer for early childhood education.
You are given a voice recording from a teacher describing an educational idea or lesson intent.

Tasks:
1. TRANSCRIPTION: Transcribe the voice recording exactly.
2. LESSON PLAN: Create a structured lesson plan including a title, learning objectives, required materials, step-by-step instructions, and an assessment method.
3. PARENT SUMMARY: Generate a 2-sentence encouraging summary for parents explaining what their child will learn.

CRITICAL: The entire output (Lesson Plan and Parent Summary) must be in the following language: {{{language}}}.

The voice recording is provided here:
{{media url=audioDataUri}}`,
});

const voiceToLessonFlow = ai.defineFlow(
  {
    name: 'voiceToLessonFlow',
    inputSchema: VoiceToLessonInputSchema,
    outputSchema: VoiceToLessonOutputSchema,
  },
  async (input) => {
    const { output } = await voiceToLessonPrompt(input);
    if (!output) {
      throw new Error('Failed to convert voice to lesson plan.');
    }
    return output;
  }
);
