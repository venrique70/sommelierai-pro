"use server";
import { z } from "zod";
import { WineAnalysisClientSchema } from "@/lib/schemas";
import { analyzeWineFlow } from "@/ai/flows/analyze-wine";
import { enrichWineDetails } from "@/ai/flows/enrich-wine-details";
import { evaluateDinnerPairings } from "@/ai/flows/evaluate-dinner-pairings";
import { recommendWineByCountry } from "@/ai/flows/recommend-wine-by-country";

export async function getWineAnalysis(input: z.infer<typeof WineAnalysisClientSchema>) {
  return analyzeWineFlow(input);
}
export async function getEnrichedWineDetails(input: any) {
  return enrichWineDetails(input);
}
export async function evaluateDinner(input: any) {
  return evaluateDinnerPairings(input);
}
export async function recommendByCountry(input: any) {
  return recommendWineByCountry(input);
}