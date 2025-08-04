
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

/**
 * Initializes and configures the Genkit AI instance.
 * This is the central point for setting up plugins and other Genkit configurations.
 */

// Initialize Genkit with the Google AI plugin.
// This configuration explicitly forces the use of an API key from environment variables.
// Using GEMINI_API_KEY is the standard for server-side environments.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
