
"use client";

import * as React from "react";
import { useState } from "react";
import { Wine, Lightbulb, UtensilsCrossed } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { translations, type Language } from "@/lib/translations";
import { WineAnalysisTab } from "@/components/features/wine-analysis-tab";
import { RecommendWineTab } from "@/components/features/recommend-wine-tab";
import { DinnerPairingTab } from "@/components/features/dinner-pairing-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 35.84 32"
    className="size-12 text-primary fill-current hidden sm:block"
  >
    <path d="m11,26.15v-6.64c3.51-.98,6-4,6-7.66s-1.07-6.51-1.97-8.42c-.16-.35-.52-.58-.91-.58H2.87c-.39,0-.74.22-.91.58-.59,1.26-1.97,4.61-1.97,8.42s2.49,6.68,6,7.66v6.64c-2.81,1.12-5,3.14-5,4.7,0,.55.45,1,1,1h13c.55,0,1-.45,1-1,0-1.56-2.19-3.58-5-4.7Zm-2,3.7H3.76c.72-.68,1.94-1.51,3.56-2.05.41-.14.68-.52.68-.95v-9.02c-3.4-.23-6-2.77-6-5.98,0-2.18.56-4.75,1.52-7h9.96c.75,1.73,1.52,4.2,1.52,7,0,3.21-2.6,5.75-6,5.98v9.02c0,.43.28.81.68.95,1.63.54,2.85,1.37,3.57,2.05h-4.25ZM3,11.85c0-1.9.56-3.71,1-5h6v5c0,.55.45,1,1,1s1-.45,1-1v-5h1c.49,1.4,1,3.12,1,5,0,6.41-11,6.94-11,0Z"/>
    <path d="m28.84,13v11l-3-3-3,3,3,3,3-3v4c0,.55-.45,1-1,1h-6c-.55,0-1-.45-1-1v-10l3,3,3-3-3-3-3,3v-7c0-.55.45,1,1,1h2c.55,0,1,.45,1,1s-.45,1-1,1h-1v1h6Zm6.78-7.38c-.34.43-.98.5-1.41.16l-3.97-3.18-1.89,4.4h2.47c.42,0,.78.25.93.62.05.12.08.25.08.39v21.99c0,1.1-.9,2-2,2h-10c-1.1,0-2-.9-2-2V8.01c0-.14.03-.27.08-.39.15-.36.51-.62.93-.62h7.33l2.74-6.39c.12-.29.37-.5.68-.58.3-.08.62,0,.87.19l5,4c.43.35.5.97.16,1.41Zm-5.78,3.38h-10v21h10V9Z"/>
  </svg>
);


// Componente principal de la página
export default function SommelierHomePage() {
  const [language, setLanguage] = useState<Language>('es');
  const t = translations[language];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <LanguageSwitcher language={language} setLanguage={setLanguage} />

      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4">
            <LogoIcon />
            <h1 className="text-5xl md:text-6xl font-headline tracking-tighter font-bold">
            SommelierPro AI
            </h1>
            <Badge className="text-lg" variant="outline">BETA</Badge>
        </div>
        <p className="text-2xl text-muted-foreground font-signature">
            {t.discoverWineSecrets}
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-primary/80">
            <span>{t.detailedNotes}</span>
            <span className="text-destructive">&bull;</span>
            <span>{t.sensoryAnalysis}</span>
            <span className="text-destructive">&bull;</span>
            <span>{t.perfectPairings}</span>
        </div>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="analyze">
            <Wine className="mr-2" /> Análisis Sensorial
          </TabsTrigger>
          <TabsTrigger value="recommend">
            <Lightbulb className="mr-2" /> {t.recommendWine}
          </TabsTrigger>
          <TabsTrigger value="pairing">
            <UtensilsCrossed className="mr-2" /> {t.dinnerPairing}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="mt-6">
            <WineAnalysisTab t={t} language={language} />
        </TabsContent>

        <TabsContent value="recommend" className="mt-6">
            <RecommendWineTab t={t} language={language} />
        </TabsContent>
        
        <TabsContent value="pairing" className="mt-6">
            <DinnerPairingTab t={t} language={language} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
