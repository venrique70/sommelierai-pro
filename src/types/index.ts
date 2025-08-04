
export type Correction = {
  field: 'Vino' | 'Año' | 'Cepa' | 'Bodega' | 'País' | 'Wine' | 'Year' | 'Grape' | 'Winery' | 'Country';
  original: string;
  corrected: string;
};

export type WineAnalysis = {
  isAiGenerated: boolean;
  wineName: string;
  year: number;
  country?: string;
  wineryName?: string;
  notes: string;
  corrections?: Correction[];
  
  pairingRating?: number;
  pairingNotes?: string;
  foodToPair?: string;
  
  analysis?: {
    grapeVariety: string;
    wineryLocation?: string;
    visual: {
      description: string;
      imageUrl?: string;
    };
    olfactory: {
      description: string;
      imageUrl?: string;
    };
    gustatory: {
      description: string;
      imageUrl?: string;
    };
    body: string;
    finalSensations: string;
    recommendedPairings: string;
    avoidPairings: string;
    wineType: string;
    qualityLevel: string;
    qualityRating: number;
    targetAudience: string;
    appellation?: string;
    barrelInfo: string;
    servingTemperature: string;
    suggestedGlassType: string;
    decanterRecommendation: string;
    agingPotential: string;
    tanninLevel: 'Ligeros' | 'Medios' | 'Fuertes' | 'Sin Taninos' | 'Light' | 'Medium' | 'Strong' | 'No Tannins';
    relevantCulturalOrRegionalNotes?: string;
    awards: string;
    world50BestRestaurants: string;
    visualDescriptionEn: string;
    olfactoryAnalysisEn: string;
    gustatoryPhaseEn: string;
    suggestedGlassTypeImageUrl?: string;
  };

  userId?: string; // For saving to DB
  createdAt?: any; // For saving to DB
  // This property is used on the client-side to differentiate between a verified analysis and a generic AI-generated one.
  wineFound?: boolean;
};


export type WineAnalysisError = {
  error: string;
};
