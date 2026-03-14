'use server';
/**
 * @fileOverview A Genkit flow for generating a short video "Magic Moment" using Veo.
 *
 * - generateMagicMoment - A function that generates a short video based on a text description.
 * - MagicMomentInput - The input type for the generateMagicMoment function.
 * - MagicMomentOutput - The return type for the generateMagicMoment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const MagicMomentInputSchema = z.object({
  prompt: z.string().describe('A description of the educational magic moment to generate.'),
});
export type MagicMomentInput = z.infer<typeof MagicMomentInputSchema>;

const MagicMomentOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type MagicMomentOutput = z.infer<typeof MagicMomentOutputSchema>;

export async function generateMagicMoment(input: MagicMomentInput): Promise<MagicMomentOutput> {
  return generateMagicMomentFlow(input);
}

const generateMagicMomentFlow = ai.defineFlow(
  {
    name: 'generateMagicMomentFlow',
    inputSchema: MagicMomentInputSchema,
    outputSchema: MagicMomentOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: 'googleai/veo-3.0-generate-preview',
      prompt: input.prompt,
      config: {
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes
    let maxRetries = 12; // Wait up to 60 seconds
    while (!operation.done && maxRetries > 0) {
      operation = await ai.checkOperation(operation);
      if (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        maxRetries--;
      }
    }

    if (operation.error) {
      throw new Error('Failed to generate video: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video in the model output.');
    }

    // In this prototype environment, we assume the media URL is a data URI or we can fetch it.
    // Since we need to return it to the client, we'll proxy the fetch if it's a remote URL.
    const videoUrl = videoPart.media.url;
    
    if (videoUrl.startsWith('data:')) {
      return { videoDataUri: videoUrl };
    }

    // If it's a signed URL from Google, we'd normally fetch and base64 encode it.
    // For this prototype, we'll try to fetch it using the API key.
    try {
      const response = await fetch(`${videoUrl}&key=${process.env.GEMINI_API_KEY}`);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return { videoDataUri: `data:video/mp4;base64,${base64}` };
    } catch (e) {
      console.error('Error fetching video content:', e);
      throw new Error('Failed to fetch generated video content.');
    }
  }
);
