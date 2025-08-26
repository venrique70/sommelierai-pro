"use server";
import { z } from "zod";
import { WineAnalysisClientSchema } from "@/lib/schemas";
import { analyzeWineFlow } from "@/ai/flows/analyze-wine";

/** Puente usado por código legado: exporta getWineAnalysis y default */
export async function getWineAnalysis(input: z.infer<typeof WineAnalysisClientSchema>) {
  return analyzeWineFlow(input);
}
export default getWineAnalysis;