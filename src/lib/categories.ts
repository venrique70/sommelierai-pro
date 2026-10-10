// Categorías de producto soportadas por el análisis.
// Seguro para cliente y servidor: no importa nada de servidor.

export const CATEGORY_IDS = ["wine", "beer", "spirits", "nonalcoholic", "chocolate"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface CategoryConfig {
  id: CategoryId;
  labelEs: string;
  labelEn: string;
  /** Contiene alcohol: requiere verificación de edad en la parte social. */
  alcoholic: boolean;
  /** Texto para el prompt de IA (en inglés). Vacío para vino: se usa el prompt original. */
  guidance: string;
  /** Plantillas de prompts para generar imágenes. `t` es el texto descriptivo en inglés. */
  image: {
    visual: (t: string) => string;
    olfactory: (t: string) => string;
    gustatory: (t: string) => string;
    vessel: (v: string) => string;
  };
}

const ABSTRACT_TAIL = "No text, no glass.";

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  wine: {
    id: "wine",
    labelEs: "Vino",
    labelEn: "Wine",
    alcoholic: true,
    guidance: "",
    image: {
      visual: (t) => `Hyper-realistic photo, a glass of wine. ${t}. Studio lighting, neutral background.`,
      olfactory: (t) => `Abstract art, captures the essence of wine aromas. ${t}. ${ABSTRACT_TAIL}`,
      gustatory: (t) => `Abstract textured art, evokes the sensation of wine flavors. ${t}. ${ABSTRACT_TAIL}`,
      vessel: (v) => `Professional product photo of an empty ${v} wine glass. White background, studio lighting.`,
    },
  },
  beer: {
    id: "beer",
    labelEs: "Cerveza",
    labelEn: "Beer",
    alcoholic: true,
    guidance:
      "Category: BEER. Speak as a certified beer expert (Cicerone level). Use beer terminology: style, malt, hops, yeast, bitterness (IBU), carbonation, head retention. " +
      "Field mapping: 'grapeVariety' = beer style and main ingredients (malts/hops); 'barrelInfo' = barrel or wood aging only if explicitly known, else empty; " +
      "'tanninLevel' = 'No Tannins' (or 'Sin Taninos' in Spanish); 'suggestedGlassType' = ideal beer glass; 'decanterRecommendation' = serving advice (no decanting); " +
      "'appellation' = brewery origin designation only if it exists; 'wineryName' = brewery. Never write wine-only terms such as vintage character, tannins or grape varieties.",
    image: {
      visual: (t) => `Hyper-realistic photo, a glass of beer with foam head. ${t}. Studio lighting, neutral background.`,
      olfactory: (t) => `Abstract art, captures the essence of beer aromas, malt and hops. ${t}. ${ABSTRACT_TAIL}`,
      gustatory: (t) => `Abstract textured art, evokes the sensation of beer flavors. ${t}. ${ABSTRACT_TAIL}`,
      vessel: (v) => `Professional product photo of an empty ${v} beer glass. White background, studio lighting.`,
    },
  },
  spirits: {
    id: "spirits",
    labelEs: "Licores y destilados",
    labelEn: "Spirits",
    alcoholic: true,
    guidance:
      "Category: SPIRITS AND LIQUEURS (rum, whisky, gin, tequila, brandy, etc.). Speak as a spirits expert. Use terminology: base ingredient, distillation, cask aging, ABV, nose, palate, finish. " +
      "Field mapping: 'grapeVariety' = base ingredient and style; 'barrelInfo' = cask aging only if explicitly known, else empty; 'tanninLevel' = 'No Tannins' (or 'Sin Taninos'); " +
      "'suggestedGlassType' = ideal glass; 'decanterRecommendation' = serving advice (neat, rocks, water); 'wineryName' = distillery. Encourage moderate consumption. Never write wine-only terms.",
    image: {
      visual: (t) => `Hyper-realistic photo, a glass of spirit served neat. ${t}. Studio lighting, neutral background.`,
      olfactory: (t) => `Abstract art, captures the essence of aged spirit aromas. ${t}. ${ABSTRACT_TAIL}`,
      gustatory: (t) => `Abstract textured art, evokes the sensation of spirit flavors. ${t}. ${ABSTRACT_TAIL}`,
      vessel: (v) => `Professional product photo of an empty ${v} spirits glass. White background, studio lighting.`,
    },
  },
  nonalcoholic: {
    id: "nonalcoholic",
    labelEs: "Bebidas sin alcohol",
    labelEn: "Non-alcoholic drinks",
    alcoholic: false,
    guidance:
      "Category: NON-ALCOHOLIC DRINKS (juice, coffee, tea, sparkling soft drinks, kombucha, alcohol-free wine or beer, etc.). Speak as a beverage expert. Use terminology: origin, ingredients, acidity, sweetness, body, aroma, finish. " +
      "Field mapping: 'grapeVariety' = main ingredient or variety; 'barrelInfo' = empty; 'tanninLevel' = 'No Tannins' (or 'Sin Taninos'); 'suggestedGlassType' = ideal cup or glass; " +
      "'decanterRecommendation' = serving advice; 'wineryName' = producer. Present it as an equal choice for sharing at the table. Never write wine-only terms.",
    image: {
      visual: (t) => `Hyper-realistic photo, a refreshing drink in a glass or cup. ${t}. Studio lighting, neutral background.`,
      olfactory: (t) => `Abstract art, captures the essence of the drink's aromas. ${t}. ${ABSTRACT_TAIL}`,
      gustatory: (t) => `Abstract textured art, evokes the sensation of the drink's flavors. ${t}. ${ABSTRACT_TAIL}`,
      vessel: (v) => `Professional product photo of an empty ${v}. White background, studio lighting.`,
    },
  },
  chocolate: {
    id: "chocolate",
    labelEs: "Chocolate",
    labelEn: "Chocolate",
    alcoholic: false,
    guidance:
      "Category: CHOCOLATE (bars, bonbons, cocoa). Speak as a professional chocolate taster. Use terminology: cocoa origin, cocoa percentage, conching, snap, melt, texture, aroma, finish. " +
      "Field mapping: 'grapeVariety' = cocoa type/origin and percentage; 'barrelInfo' = empty; 'tanninLevel' = 'No Tannins' (or 'Sin Taninos'); 'suggestedGlassType' = ideal tasting setup or serving ware; " +
      "'decanterRecommendation' = serving temperature and resting advice; 'wineryName' = chocolate maker. Recommend pairings with drinks, with and without alcohol. Never write wine-only terms.",
    image: {
      visual: (t) => `Hyper-realistic photo, fine chocolate on a plate. ${t}. Studio lighting, neutral background.`,
      olfactory: (t) => `Abstract art, captures the essence of chocolate aromas. ${t}. No text.`,
      gustatory: (t) => `Abstract textured art, evokes the sensation of chocolate flavors. ${t}. No text.`,
      vessel: (v) => `Professional product photo of an empty ${v}. White background, studio lighting.`,
    },
  },
};

export function getCategory(id?: string | null): CategoryConfig {
  return (id && (CATEGORIES as Record<string, CategoryConfig>)[id]) || CATEGORIES.wine;
}

export function isWine(id?: string | null): boolean {
  return getCategory(id).id === "wine";
}
