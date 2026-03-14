'use server';
/**
 * @fileOverview A Genkit flow for translating AI-generated summaries, insights, or recommendations
 * into Tamil, English, or Hindi.
 *
 * - translateAiInsights - A function that handles the translation process.
 * - TranslateAiInsightsInput - The input type for the translateAiInsights function.
 * - TranslateAiInsightsOutput - The return type for the translateAiInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAiInsightsInputSchema = z.object({
  content: z.string().describe('The AI-generated text content to be translated.'),
  targetLanguage: z.enum(['Tamil', 'English', 'Hindi']).describe('The target language for the translation.'),
});
export type TranslateAiInsightsInput = z.infer<typeof TranslateAiInsightsInputSchema>;

const TranslateAiInsightsOutputSchema = z.object({
  translatedContent: z.string().describe('The translated text content in the target language.'),
});
export type TranslateAiInsightsOutput = z.infer<typeof TranslateAiInsightsOutputSchema>;

export async function translateAiInsights(input: TranslateAiInsightsInput): Promise<TranslateAiInsightsOutput> {
  return translateAiInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateAiInsightsPrompt',
  input: {schema: TranslateAiInsightsInputSchema},
  output: {schema: TranslateAiInsightsOutputSchema},
  prompt: `You are a highly skilled multilingual translator. Your task is to accurately and naturally translate the provided text content into the specified target language.

Content to translate: {{{content}}}
Target Language: {{{targetLanguage}}}`,
});

const translateAiInsightsFlow = ai.defineFlow(
  {
    name: 'translateAiInsightsFlow',
    inputSchema: TranslateAiInsightsInputSchema,
    outputSchema: TranslateAiInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to translate content.');
    }
    return output;
  }
);
