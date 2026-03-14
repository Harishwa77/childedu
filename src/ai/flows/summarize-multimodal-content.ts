'use server';
/**
 * @fileOverview A Genkit flow for summarizing multimodal educational content.
 *
 * - summarizeMultimodalContent - A function that processes uploaded multimodal content
 *   (audio, video, documents, images), transcribes audio/video, identifies key activities,
 *   and generates a concise summary.
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
      'The transcription of the audio content, if the input was an audio or video file.'
    ),
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
  input: {schema: SummarizeMultimodalContentInputSchema},
  output: {schema: SummarizeMultimodalContentOutputSchema},
  model: 'googleai/gemini-1.5-flash', // Use the string ID directly to avoid "ai.model is not a function" error
  prompt: `You are an expert AI assistant that processes educational content.
Given the following content, perform the specified tasks based on its type.

Content Type: {{{contentType}}}

{{#if (eq contentType "audio/wav")}}
  Transcribe the audio content provided. Then, identify any key teaching or learning activities mentioned or implied. Finally, provide a concise summary of the entire content.
  Audio Content: {{media url=contentDataUri}}
{{else if (eq contentType "video/mp4")}}
  Transcribe the video content provided. Then, identify any key teaching or learning activities demonstrated. Finally, provide a concise summary of the entire content.
  Video Content: {{media url=contentDataUri}}
{{else if (or (eq contentType "application/pdf") (eq contentType "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))}}
  Analyze the document content provided. Extract key information, identify learning objectives, categorize the educational content, and provide a concise summary.
  Document Content: {{media url=contentDataUri}}
{{else if (or (eq contentType "image/jpeg") (eq contentType "image/png"))}}
  Analyze the image content provided. Identify and categorize any learning activities depicted. Finally, provide a concise summary of the image's content.
  Image Content: {{media url=contentDataUri}}
{{else}}
  Process the provided content. Identify any key activities and provide a concise summary. If it's audio or video, attempt to transcribe it.
  Content: {{media url=contentDataUri}}
{{/if}}

Ensure your response is a valid JSON object matching the following schema. Make sure to include an empty array for 'keyActivities' if none are found, and omit 'transcript' if not applicable.
`,
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
