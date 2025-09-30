// src/ai/genkit.ts
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY!, // usa la que tengas
      apiVersion: 'v1', // ← forzamos v1 (evita v1beta)
    }),
  ],
});
