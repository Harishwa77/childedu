'use server';
/**
 * @fileOverview A Genkit flow for translating AI-generated summaries, insights, or recommendations
 * into 12+ Indian languages with high pedagogical accuracy.
 *
 * - translateAiInsights - A function that handles the translation process.
 * - TranslateAiInsightsInput - The input type for the translateAiInsights function.
 * - TranslateAiInsightsOutput - The return type for the translateAiInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IndianLanguagesEnum = z.enum([
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Odia',
  'Assamese',
  'Urdu'
]);

const TranslateAiInsightsInputSchema = z.object({
  content: z.string().describe('The AI-generated text content to be translated.'),
  targetLanguage: IndianLanguagesEnum.describe('The target language for the translation.'),
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
  prompt: `You are a highly skilled multilingual translator specialized in Indian languages and early childhood educational terminology. 

Your task is to accurately and naturally translate the provided text into the specified target language.

Target Language: {{{targetLanguage}}}

Context: This content is for an early childhood education platform (EduSense AI). The audience is either a teacher or a parent. 

INSTRUCTIONS:
1. Translate the following content while maintaining its encouraging, professional, and whimsical tone.
2. Use natural-sounding phrasing in the target language (avoid overly literal machine-translation feel).
3. Preserve the meaning of educational terms (e.g., "numeracy", "motor skills") using commonly understood terms in the target culture.
4. ONLY return the translated text. Do not include any explanations or conversational filler.

Content to translate:
---
{{{content}}}
---`,
});

const translateAiInsightsFlow = ai.defineFlow(
  {
    name: 'translateAiInsightsFlow',
    inputSchema: TranslateAiInsightsInputSchema,
    outputSchema: TranslateAiInsightsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to translate content.');
      }
      return output;
    } catch (error: any) {
      // If quota is hit (429), return the original content as a fallback
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn("Translation quota exceeded, falling back to original content.");
        return { translatedContent: input.content };
      }
      // For other errors, log and rethrow
      console.error("Translation Flow Error:", error);
      throw error;
    }
  }
);