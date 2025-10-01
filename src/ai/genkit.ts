// src/ai/genkit.ts
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// 1. ID para la API de Gemini (el que tiene la clave válida)
const GEMINI_PROJECT_ID = 'gen-lang-client-0363298351'; 
// 2. ID para Firebase (el proyecto principal que confirmaste)
const FIREBASE_PROJECT_ID = 'sommelierpro-gemini'; 

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
      apiVersion: 'v1',
      // El plugin de Google AI usa el ID de Gemini
      projectId: GEMINI_PROJECT_ID, 
    }),
  ],
  // El plugin de Firebase usa su ID correcto
  firebase: { projectId: FIREBASE_PROJECT_ID },
  logLevel: 'debug', 
});
