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

// Logo visible (lee de /public/logo/sommelierpro-beige.svg)
const BrandLogo = () => (
  <img
    src="/logo/sommelierpro-beige.svg"
    alt="SommelierPro AI"
    className="h-12 w-12"
    aria-hidden="true"
  />
);

export default function SommelierHomePage() {
  const [language, setLanguage] = useState<Language>("es");
  const t = translations[language];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <LanguageSwitcher language={language} setLanguage={setLanguage} />

      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4">
          <BrandLogo />
          <h1 className="text-5xl md:text-6xl font-headline tracking-tighter font-bold">
            SommelierPro AI
          </h1>
          <Badge className="text-lg" variant="outline">
            {t.beta}
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
            <Wine className="mr-2" /> {t.analyzeWine}
          </TabsTrigger>
          <TabsTrigger value="recommend">
            <Lightbulb className="mr-2" /> {t.recommendWine}
          </TabsTrigger>
          <TabsTrigger value="pairing">
            <UtensilsCrossed className="mr-2" /> {t.dinnerPairing}
          </TabsTrigger>
        </TabsList>

        <p className="mt-2 text-xs opacity-70 text-center">
          {t.continueAccept}{" "}
          <Link href="/legal#terminos" className="underline">
            {t.terms}
          </Link>{" "}
          {language === "es" ? "y" : "and"}{" "}
          <Link href="/legal" className="underline">
            {t.legal}
          </Link>.
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
