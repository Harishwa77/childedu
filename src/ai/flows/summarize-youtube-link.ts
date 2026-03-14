'use server';
/**
 * @fileOverview A Genkit flow for summarizing educational content from YouTube links with pedagogical analysis.
 *
 * - summarizeYoutubeLink - A function that analyzes a YouTube URL and generates an educational summary and analysis.
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
  analysis: z.object({
    activityName: z.string().describe('The name of the primary activity detected.'),
    studentEngagement: z.enum(['High', 'Medium', 'Low']).describe('The overall level of student engagement.'),
    participationPatterns: z.string().describe('Observations on how students are participating.'),
    teachingEffectiveness: z.string().describe('An assessment of the teaching methods used.'),
    recommendedImprovement: z.string().describe('Actionable advice to improve the activity or teaching.'),
  }).optional().describe('Pedagogical analysis for the video content.'),
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
{{/if}}

Tasks:
1. SUMMARY: Provide a concise summary of the educational value, key takeaways, and teaching methods used.
2. ACTIVITIES: Identify and list 3-5 key teaching or learning activities.
3. TRANSCRIPT HIGHLIGHTS: Provide a representative verbatim transcript of the most important dialogue.
4. PEDAGOGICAL ANALYSIS: Analyze the video to determine student engagement levels, participation patterns, and teaching effectiveness. Provide a "Recommended Improvement".

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
