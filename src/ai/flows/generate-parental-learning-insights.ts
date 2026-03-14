'use server';
/**
 * @fileOverview A Genkit flow for generating personalized learning insights and home activity suggestions for parents.
 *
 * - generateParentalLearningInsights - A function that handles the generation of parental learning insights.
 * - ParentalLearningInsightsInput - The input type for the generateParentalLearningInsights function.
 * - ParentalLearningInsightsOutput - The return type for the generateParentalLearningInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParentalLearningInsightsInputSchema = z.object({
  childName: z.string().describe("The name of the child."),
  classroomObservations: z
    .string()
    .describe("A summary of the child's classroom observations and activities."),
  processedEducationalContent: z
    .string()
    .describe("A summary of relevant processed educational content for the child."),
});
export type ParentalLearningInsightsInput = z.infer<typeof ParentalLearningInsightsInputSchema>;

const ParentalLearningInsightsOutputSchema = z.object({
  learningSummary: z
    .string()
    .describe("A personalized summary of the child's learning progress."),
  homeActivitySuggestions: z
    .array(z.string())
    .describe("A list of tailored suggestions for home activities to support the child's development."),
});
export type ParentalLearningInsightsOutput = z.infer<typeof ParentalLearningInsightsOutputSchema>;

export async function generateParentalLearningInsights(
  input: ParentalLearningInsightsInput
): Promise<ParentalLearningInsightsOutput> {
  return parentalLearningInsightsFlow(input);
}

const parentalLearningInsightsPrompt = ai.definePrompt({
  name: 'parentalLearningInsightsPrompt',
  input: {schema: ParentalLearningInsightsInputSchema},
  output: {schema: ParentalLearningInsightsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized learning insights and home activity suggestions to parents.

Your task is to analyze the provided information about a child's classroom observations and relevant educational content to generate a clear summary of their learning progress and actionable home activity suggestions.

Child's Name: {{{childName}}}

Classroom Observations Summary:
{{{classroomObservations}}}

Processed Educational Content Summary:
{{{processedEducationalContent}}}

Based on this information, generate:
1. A concise, personalized summary of {{{childName}}}'s learning progress, highlighting key achievements and areas for development.
2. A list of 3-5 tailored home activity suggestions that align with their current learning and support their development. Each suggestion should be practical and easy for parents to implement.

Ensure the tone is encouraging and supportive.`,
});

const parentalLearningInsightsFlow = ai.defineFlow(
  {
    name: 'parentalLearningInsightsFlow',
    inputSchema: ParentalLearningInsightsInputSchema,
    outputSchema: ParentalLearningInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await parentalLearningInsightsPrompt(input);
    return output!;
  }
);
