"use client";

import * as React from "react";
import { useState } from "react";
import { Wine, Lightbulb, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { translations, type Language } from "@/lib/translations";
import { WineAnalysisTab } from "@/components/features/wine-analysis-tab";
import { RecommendWineTab } from "@/components/features/recommend-wine-tab";
import { DinnerPairingTab } from "@/components/features/dinner-pairing-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.84 32" className="size-12 text-primary fill-current hidden sm:block">
    {/* paths */}
  </svg>
);

export default function SommelierHomePage() {
  const [language, setLanguage] = useState<Language>("es");
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
          <Badge className="text-lg" variant="outline">
            BETA
          </Badge>
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
        <p className="mt-2 text-xs opacity-70 text-center">
          Al continuar, aceptas nuestros{" "}
          <Link href="/legal#terminos" className="underline">
            Términos y Condiciones
          </Link>{" "}
          y <Link href="/legal" className="underline">Legal</Link>.
        </p>
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
