
'use server';

import { z } from 'zod';
import type { WineAnalysisClientSchema } from '@/lib/schemas';
import type { WineAnalysis, WineAnalysisError } from '@/types';
import { translations } from '@/lib/translations';
import { analyzeWineFlow } from './analyze-wine';

/**
 * This is the public-facing Server Action that the client calls.
 * It now delegates directly to the Genkit flow.
 * Usage validation is handled on the client-side before this action is called.
 * @param userInput The user's input for the wine analysis.
 * @returns A promise that resolves to the wine analysis or an error.
 */
export async function getWineAnalysis(userInput: z.infer<typeof WineAnalysisClientSchema>): Promise<WineAnalysis | WineAnalysisError> {
  const language = userInput.language || 'es';
  const t = translations[language];

  try {
    // Execute the actual analysis flow
    const result: WineAnalysis = await analyzeWineFlow(userInput);
    
    return result;

  } catch (e: unknown) {
    console.error('Full AI Error / Fetch Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
    
    let userFriendlyError: string;
    
    if (errorMessage.includes('QuotaFailure')) {
      userFriendlyError = t.quota;
    } else if (errorMessage.includes('API key not valid')) {
      userFriendlyError = t.invalidKey;
    } else if (errorMessage.includes('did not return a structured response')) {
      userFriendlyError = t.jsonError;
    } else {
      userFriendlyError = `${t.generic} ${t.detail}${errorMessage.split('\n')[0]}`;
    }
  
    return { error: userFriendlyError };
  }
}
