'use server';
/**
 * @fileOverview A Genkit flow for summarizing multimodal educational content using Gemini 2.5 Flash.
 *
 * - summarizeMultimodalContent - A function that processes uploaded multimodal content
 *   (audio, video, documents, images), transcribes audio/video, identifies key activities,
 *   and generates a concise summary with pedagogical analysis.
 * - SummarizeMultimodalContentInput - The input type for the summarizeMultimodalContent function.
 * - SummarizeMultimodalContentOutput - The return type for the summarizeMultimodalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const SummarizeMultimodalContentInputSchema = z.object({
  contentDataUri: z
    .string()
    .describe(
      "The multimodal content (audio, video, document, or image) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  contentType: z
    .string()
    .describe(
      'The MIME type of the content (e.g., audio/wav, video/mp4, application/pdf, image/jpeg, application/vnd.openxmlformats-officedocument.wordprocessingml.document).'
    ),
});
export type SummarizeMultimodalContentInput = z.infer<
  typeof SummarizeMultimodalContentInputSchema
>;

// Output Schema
const SummarizeMultimodalContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the content.'),
  keyActivities: z
    .array(z.string())
    .describe('A list of key teaching or learning activities identified in the content.'),
  transcript: z
    .string()
    .optional()
    .describe(
      'A full, verbatim transcription of any spoken dialogue in the audio or video track.'
    ),
  analysis: z.object({
    activityName: z.string().describe('The name of the primary activity detected.'),
    studentEngagement: z.enum(['High', 'Medium', 'Low']).describe('The overall level of student engagement.'),
    participationPatterns: z.string().describe('Observations on how students are participating (e.g., group dynamics, individual focus).'),
    teachingEffectiveness: z.string().describe('An assessment of the teaching methods used.'),
    recommendedImprovement: z.string().describe('Actionable advice to improve the activity or teaching effectiveness.'),
  }).optional().describe('Pedagogical analysis specifically for video content.'),
});
export type SummarizeMultimodalContentOutput = z.infer<
  typeof SummarizeMultimodalContentOutputSchema
>;

// Wrapper function
export async function summarizeMultimodalContent(
  input: SummarizeMultimodalContentInput
): Promise<SummarizeMultimodalContentOutput> {
  return summarizeMultimodalContentFlow(input);
}

// Genkit Prompt Definition
const summarizePrompt = ai.definePrompt({
  name: 'summarizeMultimodalContentPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: SummarizeMultimodalContentInputSchema},
  output: {schema: SummarizeMultimodalContentOutputSchema},
  prompt: `You are an expert AI assistant specialized in early childhood educational content analysis.
You have been provided with a file of type: {{{contentType}}}.

Please analyze the following content:
{{media url=contentDataUri}}

Tasks:
1. SUMMARY: Provide a concise summary of the visual and auditory events. Focus on educational value and the interactions taking place.
2. ACTIVITIES: Identify and list 3-5 key teaching or learning activities demonstrated (e.g., social interaction, tactile play, numeracy, literacy, creative expression).
3. TRANSCRIPT: If the content is an audio or video file with spoken dialogue, provide a FULL, VERBATIM transcript of all spoken words. Label speakers (e.g., "Teacher:", "Child:").
4. PEDAGOGICAL ANALYSIS (CRITICAL for Videos): If this is a video, analyze student engagement (High/Medium/Low), participation patterns, and teaching effectiveness. Provide a specific "Recommended Improvement" for the teacher.

Ensure your response follows the requested JSON structure precisely.`,
});

// Genkit Flow Definition
const summarizeMultimodalContentFlow = ai.defineFlow(
  {
    name: 'summarizeMultimodalContentFlow',
    inputSchema: SummarizeMultimodalContentInputSchema,
    outputSchema: SummarizeMultimodalContentOutputSchema,
  },
  async (input) => {
    const {output} = await summarizePrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary.');
    }
    return output;
  }
);
