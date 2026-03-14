'use server';
/**
 * @fileOverview A Genkit flow for summarizing educational content from YouTube links.
 *
 * - summarizeYoutubeLink - A function that analyzes a YouTube URL and generates an educational summary.
 * - SummarizeYoutubeLinkInput - The input type for the summarizeYoutubeLink function.
 * - SummarizeYoutubeLinkOutput - The return type for the summarizeYoutubeLink function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeYoutubeLinkInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to summarize.'),
});
export type SummarizeYoutubeLinkInput = z.infer<typeof SummarizeYoutubeLinkInputSchema>;

const SummarizeYoutubeLinkOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the video content.'),
  keyActivities: z
    .array(z.string())
    .describe('A list of key teaching or learning activities identified in the video.'),
  transcript: z
    .string()
    .optional()
    .describe('A simulated or retrieved transcript of the video dialogue.'),
});
export type SummarizeYoutubeLinkOutput = z.infer<typeof SummarizeYoutubeLinkOutputSchema>;

export async function summarizeYoutubeLink(
  input: SummarizeYoutubeLinkInput
): Promise<SummarizeYoutubeLinkOutput> {
  return summarizeYoutubeLinkFlow(input);
}

const youtubeSummarizePrompt = ai.definePrompt({
  name: 'summarizeYoutubeLinkPrompt',
  input: { schema: SummarizeYoutubeLinkInputSchema },
  output: { schema: SummarizeYoutubeLinkOutputSchema },
  prompt: `You are an expert AI assistant specialized in educational content analysis.
You have been provided with a YouTube URL: {{{youtubeUrl}}}.

Tasks:
1. Identify the educational purpose and content of this video based on your knowledge base (if available) or the URL context.
2. SUMMARY: Provide a concise summary of the educational value and interactions.
3. ACTIVITIES: Identify and list 3-5 key teaching or learning activities (e.g., social interaction, tactile play, numeracy, literacy).
4. TRANSCRIPT: Provide a representative transcript or key dialogue highlights from the video.

Ensure your response follows the requested JSON structure precisely.`,
});

const summarizeYoutubeLinkFlow = ai.defineFlow(
  {
    name: 'summarizeYoutubeLinkFlow',
    inputSchema: SummarizeYoutubeLinkInputSchema,
    outputSchema: SummarizeYoutubeLinkOutputSchema,
  },
  async (input) => {
    const { output } = await youtubeSummarizePrompt(input);
    if (!output) {
      throw new Error('Failed to generate YouTube summary.');
    }
    return output;
  }
);
