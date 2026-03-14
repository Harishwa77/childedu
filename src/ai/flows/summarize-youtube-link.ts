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
import { YoutubeTranscript } from 'youtube-transcript';

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
    .describe('A representative transcript or key dialogue highlights from the video.'),
});
export type SummarizeYoutubeLinkOutput = z.infer<typeof SummarizeYoutubeLinkOutputSchema>;

export async function summarizeYoutubeLink(
  input: SummarizeYoutubeLinkInput
): Promise<SummarizeYoutubeLinkOutput> {
  return summarizeYoutubeLinkFlow(input);
}

const youtubeSummarizePrompt = ai.definePrompt({
  name: 'summarizeYoutubeLinkPrompt',
  input: { 
    schema: z.object({
      youtubeUrl: z.string(),
      transcriptText: z.string().optional()
    })
  },
  output: { schema: SummarizeYoutubeLinkOutputSchema },
  prompt: `You are an expert AI assistant specialized in educational content analysis.
You are analyzing the following YouTube video: {{{youtubeUrl}}}.

{{#if transcriptText}}
The following is the actual transcript retrieved from the video:
---
{{{transcriptText}}}
---
{{else}}
Note: I was unable to retrieve a direct transcript for this video. Please analyze it as best as possible based on the URL and your knowledge of common educational topics.
{{/if}}

Tasks:
1. Identify the educational purpose and core subject matter of this video.
2. SUMMARY: Provide a concise summary of the educational value, key takeaways, and teaching methods used.
3. ACTIVITIES: Identify and list 3-5 key teaching or learning activities (e.g., social interaction, tactile play, numeracy, literacy, creative expression).
4. TRANSCRIPT HIGHLIGHTS: Provide a representative verbatim transcript of the most important dialogue or highlights based on the provided text.

Ensure your response follows the requested JSON structure precisely.`,
});

const summarizeYoutubeLinkFlow = ai.defineFlow(
  {
    name: 'summarizeYoutubeLinkFlow',
    inputSchema: SummarizeYoutubeLinkInputSchema,
    outputSchema: SummarizeYoutubeLinkOutputSchema,
  },
  async (input) => {
    let transcriptText = "";
    
    try {
      // Attempt to fetch the transcript to provide real context to the AI
      const transcript = await YoutubeTranscript.fetchTranscript(input.youtubeUrl);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (e) {
      console.warn("Could not fetch YouTube transcript, falling back to URL-only analysis:", e);
    }

    const { output } = await youtubeSummarizePrompt({ 
      youtubeUrl: input.youtubeUrl, 
      transcriptText 
    });
    
    if (!output) {
      throw new Error('Failed to generate YouTube summary.');
    }
    
    return output;
  }
);
