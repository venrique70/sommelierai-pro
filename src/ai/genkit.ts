// src/ai/genkit.ts
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

const GEMINI_PROJECT_ID = 'gen-lang-client-0363298351';
const FIREBASE_PROJECT_ID = 'sommelierpro-gemini';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
      apiVersion: 'v1',
      // projectId es opcional para API key; puedes dejarlo o quitarlo
      projectId: GEMINI_PROJECT_ID,
    }),
  ],
  firebase: { projectId: FIREBASE_PROJECT_ID },
  logLevel: 'debug',
});
