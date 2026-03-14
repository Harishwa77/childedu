'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI chatbot assistant.
 *
 * - askEducationalAIAssistant - A function that handles user questions using a RAG system.
 * - AskEducationalAIAssistantInput - The input type for the askEducationalAIAssistant function.
 * - AskEducationalAIAssistantOutput - The return type for the askEducationalAIAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AskEducationalAIAssistantInputSchema = z.object({
  question: z.string().describe('The user\'s question to the AI chatbot.'),
  context: z
    .string()
    .describe(
      'Relevant educational resources retrieved from the knowledge base to answer the question.'
    ),
});
export type AskEducationalAIAssistantInput = z.infer<
  typeof AskEducationalAIAssistantInputSchema
>;

const AskEducationalAIAssistantOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      'The AI chatbot\'s answer to the user\'s question, based on the provided context.'
    ),
});
export type AskEducationalAIAssistantOutput = z.infer<
  typeof AskEducationalAIAssistantOutputSchema
>;

export async function askEducationalAIAssistant(
  input: AskEducationalAIAssistantInput
): Promise<AskEducationalAIAssistantOutput> {
  return askEducationalAIAssistantFlow(input);
}

const askEducationalAIAssistantPrompt = ai.definePrompt({
  name: 'askEducationalAIAssistantPrompt',
  input: { schema: AskEducationalAIAssistantInputSchema },
  output: { schema: AskEducationalAIAssistantOutputSchema },
  prompt: `You are an AI chatbot assistant for an early childhood education platform. Your goal is to provide accurate, context-aware answers to questions about curriculum, specific child learning, or general program analytics.

Use ONLY the provided context below to answer the user's question. If the answer cannot be found in the context, clearly state that you do not have enough information to answer. Do not make up answers.

Context:
{{{context}}}

Question:
{{{question}}}

Answer:`,
});

const askEducationalAIAssistantFlow = ai.defineFlow(
  {
    name: 'askEducationalAIAssistantFlow',
    inputSchema: AskEducationalAIAssistantInputSchema,
    outputSchema: AskEducationalAIAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await askEducationalAIAssistantPrompt(input);
    return output!;
  }
);
