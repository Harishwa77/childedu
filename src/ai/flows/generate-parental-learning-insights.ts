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
  skills: z.object({
    language: z.number(),
    numeracy: z.number(),
    social: z.number(),
    motor: z.number(),
  }).optional().describe("The child's current skill levels (0-100)."),
});
export type ParentalLearningInsightsInput = z.infer<typeof ParentalLearningInsightsInputSchema>;

const ParentalLearningInsightsOutputSchema = z.object({
  learningSummary: z
    .string()
    .describe("A personalized summary of the child's learning progress."),
  homeActivitySuggestions: z
    .array(z.string())
    .describe("A list of tailored suggestions for home activities to support the child's development."),
  targetedIntervention: z
    .string()
    .optional()
    .describe("A specific recommendation if the child is struggling in a particular area."),
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

Your task is to analyze the provided information about a child's classroom observations, relevant educational content, and their current developmental skill levels to generate a clear summary and actionable home activity suggestions.

Child's Name: {{{childName}}}

Classroom Observations Summary:
{{{classroomObservations}}}

Processed Educational Content Summary:
{{{processedEducationalContent}}}

Current Skill Levels (0-100):
{{#if skills}}
- Language: {{{skills.language}}}
- Numeracy: {{{skills.numeracy}}}
- Social: {{{skills.social}}}
- Motor: {{{skills.motor}}}
{{else}}
- Skill data not provided.
{{/if}}

Based on this information, generate:
1. A concise, personalized summary of {{{childName}}}'s learning progress.
2. A list of 3-5 tailored home activity suggestions. 
3. TARGETED RECOMMENDATION: If the child has any skill score below 70, provide a specific "Targeted Intervention" for that area (e.g., if struggling with numbers, suggest counting games or visual number activities).

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
