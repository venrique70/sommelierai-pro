// src/ai/genkit.ts
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
// Usamos el ID de proyecto técnico asociado al proyecto SommelierPro-Gemini-API
const PROJECT_ID = 'gen-lang-client-0363298351'; 

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
      apiVersion: 'v1',
      // Forzamos el ID de proyecto
      projectId: PROJECT_ID, 
    }),
  ],
  // Forzamos el ID de proyecto para Firebase/Genkit
  firebase: { projectId: PROJECT_ID },
  logLevel: 'debug', 
});
