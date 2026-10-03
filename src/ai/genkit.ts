// src/ai/genkit.ts
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

const GEMINI_PROJECT_ID = 'gen-lang-client-0363298351';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
      apiVersion: 'v1beta',
      // projectId es opcional para API key; mejor omitirlo para evitar confusión con Vertex:
      // projectId: GEMINI_PROJECT_ID,
    }),
  ],
  logLevel: 'debug',
});
