import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
      apiVersion: 'v1',
    }),
  ],
});
