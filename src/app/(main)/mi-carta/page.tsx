
"use client";

import { useState } from "react";
import { BookOpenCheck, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


export default function MiCartaPage() {
    const [loading, setLoading] = useState(false);
    
    const handleGenerateDescriptions = () => {
        setLoading(true);
        // Lógica para llamar al nuevo flujo de IA
        console.log("Generando descripciones para la carta...");
        setTimeout(() => setLoading(false), 2000); // Simular llamada a la IA
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
                    <BookOpenCheck />
                    Gestor de Carta de Vinos para Restaurantes
                </h1>
                <p className="text-muted-foreground mt-2">
                    Pega tu lista de vinos actual y deja que nuestra IA la enriquezca con descripciones profesionales, sugerencias de maridaje y precios recomendados.
                </p>
            </div>

            <Alert>
                <AlertTitle>Función en Desarrollo</AlertTitle>
                <AlertDescription>
                    Esta sección es una vista previa de la futura herramienta para restauradores. La funcionalidad completa está en camino.
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <CardTitle>Crea tu Carta Inteligente</CardTitle>
                    <CardDescription>
                        Simplemente pega tu lista de vinos (uno por línea) en el siguiente campo y la IA hará el resto.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="wine-list">Tu lista de vinos</Label>
                        <Textarea 
                            id="wine-list"
                            placeholder="- Catena Zapata Malbec Argentino 2021&#x0a;- El Enemigo Chardonnay 2022&#x0a;- Whispering Angel Rosé 2023" 
                            rows={10}
                        />
                    </div>
                    <div className="text-center">
                        <Button size="lg" onClick={handleGenerateDescriptions} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                            {loading ? "Enriqueciendo Carta..." : "Enriquecer Carta con IA"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Aquí iría la visualización de la carta generada */}

        </div>
    );
}
