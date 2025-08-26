type AnyObj = Record<string, any>;

async function dynamicCall<T = any>(paths: string[], fns: string[]) {
  for (const p of paths) {
    try {
      const mod: AnyObj = await import(p);
      for (const name of fns) if (typeof mod[name] === "function") return mod[name] as unknown as T;
      if (typeof mod.default === "function") return mod.default as unknown as T;
    } catch {}
  }
  throw new Error("No se encontró función en: " + paths.join(", "));
}

export async function analyzeWine(input: AnyObj) {
  const fn = await dynamicCall(
    [
      "@/ai/flows/actions",
      "@/lib/actions/wine-analysis",
      "@/ai/flows/analyze-wine"
    ],
    ["getWineAnalysis", "analyzeWineFlow"]
  );
  return fn(input);
}

export async function enrichWineDetails(input: AnyObj) {
  const fn = await dynamicCall(
    ["@/ai/flows/enrich-wine-details"],
    ["enrichWineDetails", "enrichWineDetailsFlow"]
  );
  return fn(input);
}

export async function evaluateDinnerPairings(input: AnyObj) {
  const fn = await dynamicCall(
    ["@/ai/flows/evaluate-dinner-pairings"],
    ["evaluateDinnerPairings", "evaluateDinnerPairingsFlow"]
  );
  return fn(input);
}

export async function recommendWineByCountry(input: AnyObj) {
  const fn = await dynamicCall(
    ["@/ai/flows/recommend-wine-by-country"],
    ["recommendWineByCountry", "recommendWineByCountryFlow"]
  );
  return fn(input);
}
export const recommendWine = recommendWineByCountry;