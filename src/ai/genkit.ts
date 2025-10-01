// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';

const FIREBASE_PROJECT_ID = 'sommelierpro-gemini';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!, // solo la API key
    }),
    firebase({
      projectId: FIREBASE_PROJECT_ID,
    }),
  ],
  logLevel: 'debug',
});
