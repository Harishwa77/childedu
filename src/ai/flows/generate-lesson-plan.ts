'use server';
/**
 * @fileOverview A Genkit flow for generating a structured lesson plan based on educational summaries.
 *
 * - generateLessonPlan - A function that creates a lesson plan for teachers.
 * - LessonPlanInput - The input type for the generateLessonPlan function.
 * - LessonPlanOutput - The return type for the generateLessonPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LessonPlanInputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of a classroom activity or resource.'),
  keyActivities: z.array(z.string()).describe('The key activities identified in the resource.'),
  targetAge: z.string().default('3-5 years').describe('The target age group for the lesson plan.'),
});
export type LessonPlanInput = z.infer<typeof LessonPlanInputSchema>;

const LessonPlanOutputSchema = z.object({
  title: z.string().describe('The title of the lesson plan.'),
  objectives: z.array(z.string()).describe('Learning objectives for the children.'),
  materials: z.array(z.string()).describe('Required materials for the activity.'),
  steps: z.array(z.string()).describe('Step-by-step instructions for the teacher.'),
  assessment: z.string().describe('How to assess if learning objectives were met.'),
});
export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const lessonPlanPrompt = ai.definePrompt({
  name: 'lessonPlanPrompt',
  input: { schema: LessonPlanInputSchema },
  output: { schema: LessonPlanOutputSchema },
  prompt: `You are an expert curriculum designer for early childhood education.
Based on the following activity summary and identified skills, create a comprehensive, structured lesson plan for children aged {{{targetAge}}}.

Activity Summary:
{{{summary}}}

Key Skills/Activities:
{{#each keyActivities}}
- {{{this}}}
{{/each}}

Ensure the lesson plan is engaging, tactile, and encourages social-emotional growth.`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: LessonPlanInputSchema,
    outputSchema: LessonPlanOutputSchema,
  },
  async (input) => {
    const { output } = await lessonPlanPrompt(input);
    if (!output) throw new Error('Failed to generate lesson plan.');
    return output;
  }
);
