'use server';
/**
 * @fileOverview This file implements a master Genkit flow for the EduSense AI processing pipeline.
 *
 * It takes multimodal content (audio, video, docs, images), transcribes it,
 * generates a NoteGPT-style summary, flashcards, quiz questions, 
 * and maps the content to a knowledge graph (Activity -> Skill -> Objective -> Age).
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

// Output Schema (Autonomous Knowledge Graph Extraction)
const ProcessEducationalContentOutputSchema = z.object({
  summary: z.string().describe('A high-level pedagogical summary of the content.'),
  keyConcepts: z.array(z.string()).describe('Fundamental educational topics identified in the content.'),
  curriculumObjectives: z.array(z.string()).describe('Specific national or institutional curriculum standards this activity meets.'),
  targetAge: z.string().describe('The primary age group this resource is best suited for (e.g., "3-5 Years").'),
  skillsMapped: z.array(z.enum(['Language', 'Numeracy', 'Social', 'Motor'])).describe('The core skill areas practiced.'),
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
  model: 'googleai/gemini-1.5-flash',
  input: { schema: ProcessEducationalContentInputSchema },
  output: { schema: ProcessEducationalContentOutputSchema },
  prompt: `You are an expert AI Autonomous Intelligence Layer for early childhood education, specialized in transforming raw content into a structured Knowledge Graph.

You are processing a file of type: {{{contentType}}}.

Please analyze the following content:
{{media url=contentDataUri}}

TASKS:
1. SUMMARY: Provide a concise, pedagogical summary focusing on educational value.
2. KNOWLEDGE GRAPH NODES:
   - Identify 3-5 fundamental educational KEY CONCEPTS (e.g., "Animal Empathy", "Basic Numeracy").
   - Map this to specific CURRICULUM OBJECTIVES (standards).
   - Determine the best TARGET AGE for this content.
   - Select which core SKILLS are practiced (Language, Numeracy, Social, Motor).
3. FLASHCARDS: Generate 5 flashcards that reinforce the concepts.
4. QUIZ: Create 3 multiple-choice questions.
5. ACTIVITIES: Suggest 3 classroom or home activities.
6. TRANSCRIPT: If this is an audio or video file, provide a FULL, VERBATIM transcript.
7. MULTILINGUAL: Provide a translated summary and concepts in Tamil and Hindi.

Ensure the final JSON output matches the requested schema perfectly. Focus on how concepts connect to build a Learning DNA for the student.`,
});

const processEducationalContentFlow = ai.defineFlow(
  {
    name: 'processEducationalContentFlow',
    inputSchema: ProcessEducationalContentInputSchema,
    outputSchema: ProcessEducationalContentOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await processPrompt(input);
      if (!output) {
        throw new Error('Autonomous AI pipeline failed to generate results.');
      }
      return output!;
    } catch (error: any) {
      // Check for quota error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error("AI Processing Quota Exceeded. Please try again in 1 minute.");
      }
      throw error;
    }
  }
);
