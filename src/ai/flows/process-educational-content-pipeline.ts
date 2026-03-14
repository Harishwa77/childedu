'use server';
/**
 * @fileOverview This file implements a master Genkit flow for the EduSense AI processing pipeline.
 *
 * It takes multimodal content (audio, video, docs, images), transcribes it,
 * generates a NoteGPT-style summary, flashcards, quiz questions, 
 * and provides translations for multilingual accessibility.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const ProcessEducationalContentInputSchema = z.object({
  contentDataUri: z
    .string()
    .describe(
      "The multimodal content as a data URI that must include a MIME type and use Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  contentType: z
    .string()
    .describe(
      'The MIME type of the content (e.g., audio/wav, video/mp4, application/pdf, image/jpeg).'
    ),
  resourceId: z.string().describe('The ID of the associated resource.'),
});
export type ProcessEducationalContentInput = z.infer<
  typeof ProcessEducationalContentInputSchema
>;

// Output Schema (NoteGPT-style intelligence)
const ProcessEducationalContentOutputSchema = z.object({
  summary: z.string().describe('A high-level pedagogical summary of the content.'),
  keyConcepts: z.array(z.string()).describe('Fundamental educational topics identified in the content.'),
  flashcards: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).describe('A set of interactive flashcards for review.'),
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
  })).describe('A set of multiple-choice quiz questions based on the content.'),
  activitySuggestions: z.array(z.string()).describe('Classroom or home activity ideas inspired by the content.'),
  translations: z.object({
    Tamil: z.object({
      summary: z.string(),
      concepts: z.array(z.string()),
    }),
    Hindi: z.object({
      summary: z.string(),
      concepts: z.array(z.string()),
    }),
  }).describe('Multilingual versions of the primary summary and concepts.'),
  transcript: z.string().optional().describe('Verbatim transcription of any audio/video dialogue.'),
});
export type ProcessEducationalContentOutput = z.infer<
  typeof ProcessEducationalContentOutputSchema
>;

/**
 * processEducationalContent - Master function to trigger the AI pipeline.
 */
export async function processEducationalContent(
  input: ProcessEducationalContentInput
): Promise<ProcessEducationalContentOutput> {
  return processEducationalContentFlow(input);
}

const processPrompt = ai.definePrompt({
  name: 'processEducationalContentPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: ProcessEducationalContentInputSchema },
  output: { schema: ProcessEducationalContentOutputSchema },
  prompt: `You are an expert AI Autonomous Intelligence Layer for early childhood education, specialized in transforming raw content into structured knowledge.

You are processing a file of type: {{{contentType}}}.

Please analyze the following content:
{{media url=contentDataUri}}

TASKS:
1. SUMMARY: Provide a concise, pedagogical summary focusing on educational value and teacher/student interactions.
2. KEY CONCEPTS: Identify 3-5 fundamental educational topics (e.g., "Pattern Recognition", "Social Cooperation").
3. FLASHCARDS: Generate 5 flashcards (question and answer) that reinforce the key concepts.
4. QUIZ: Create 3 multiple-choice questions with 4 options each and identify the correct answer.
5. ACTIVITIES: Suggest 3 classroom or home activities that build upon this content.
6. TRANSCRIPT: If this is an audio or video file, provide a FULL, VERBATIM transcript of all spoken dialogue.
7. MULTILINGUAL (CRITICAL): Provide a naturally translated summary and list of key concepts in Tamil and Hindi.

Ensure the final JSON output matches the requested schema perfectly.`,
});

const processEducationalContentFlow = ai.defineFlow(
  {
    name: 'processEducationalContentFlow',
    inputSchema: ProcessEducationalContentInputSchema,
    outputSchema: ProcessEducationalContentOutputSchema,
  },
  async (input) => {
    const { output } = await processPrompt(input);
    if (!output) {
      throw new Error('Autonomous AI pipeline failed to generate results.');
    }
    return output!;
  }
);
