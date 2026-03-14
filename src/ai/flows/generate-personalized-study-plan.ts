'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized study plan based on a student's interaction history.
 *
 * - generatePersonalizedStudyPlan - Analyzes resource history and engagement to suggest a tailored learning path.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyInteractionSchema = z.object({
  resourceName: z.string(),
  type: z.enum(['view', 'quiz_complete', 'flashcard_flip']),
  performance: z.number().optional().describe('Score from 0-100 for quizzes.'),
  timestamp: z.string(),
});

const PersonalizedStudyPlanInputSchema = z.object({
  childName: z.string(),
  history: z.array(StudyInteractionSchema),
  currentSkills: z.object({
    language: z.number(),
    numeracy: z.number(),
    social: z.number(),
    motor: z.number(),
  }).optional(),
});
export type PersonalizedStudyPlanInput = z.infer<typeof PersonalizedStudyPlanInputSchema>;

const PersonalizedStudyPlanOutputSchema = z.object({
  analysis: z.string().describe('Analysis of the student\'s learning style and current focus.'),
  recommendedPath: z.array(z.object({
    topic: z.string(),
    reason: z.string(),
    priority: z.enum(['High', 'Medium', 'Low']),
  })),
  weeklySchedule: z.array(z.object({
    day: z.string(),
    activity: z.string(),
    objective: z.string(),
  })),
});
export type PersonalizedStudyPlanOutput = z.infer<typeof PersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: PersonalizedStudyPlanInput): Promise<PersonalizedStudyPlanOutput> {
  return studyPlanFlow(input);
}

const studyPlanPrompt = ai.definePrompt({
  name: 'studyPlanPrompt',
  input: { schema: PersonalizedStudyPlanInputSchema },
  output: { schema: PersonalizedStudyPlanOutputSchema },
  prompt: `You are an expert AI Learning Scientist. Your goal is to analyze a child's interaction history with educational resources and generate a personalized "Adaptive Study Plan".

Child: {{{childName}}}

Interaction History:
{{#each history}}
- Resource: {{{resourceName}}}, Action: {{{type}}}, Performance: {{{performance}}}%, Date: {{{timestamp}}}
{{/each}}

Current Skill Levels:
{{#if currentSkills}}
- Language: {{{currentSkills.language}}}%
- Numeracy: {{{currentSkills.numeracy}}}%
- Social: {{{currentSkills.social}}}%
- Motor: {{{currentSkills.motor}}}%
{{/if}}

TASKS:
1. ANALYSIS: Identify if the child prefers visual (video), auditory (audio/podcast), or tactile (activity-based) learning based on the interaction types.
2. RECOMMENDATIONS: Suggest 3-5 focus areas where the child either shows strong interest or needs improvement.
3. SCHEDULE: Create a simple 5-day study plan (Monday-Friday) that incorporates their preferred learning style.

Keep the tone encouraging for parents.`,
});

const studyPlanFlow = ai.defineFlow(
  {
    name: 'studyPlanFlow',
    inputSchema: PersonalizedStudyPlanInputSchema,
    outputSchema: PersonalizedStudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await studyPlanPrompt(input);
    if (!output) throw new Error('Failed to generate personalized study plan.');
    return output;
  }
);
