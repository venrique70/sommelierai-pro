
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentErrorPage() {
    return (
        <div className="flex items-center justify-center min-h-full py-12">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="items-center">
                    <div className="p-3 bg-destructive/20 rounded-full">
                         <XCircle className="size-12 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl mt-4">Error en el Pago</CardTitle>
                    <CardDescription className="text-base pt-2">
                        No pudimos procesar tu pago en este momento. Por favor, inténtalo de nuevo o prueba con otro método de pago.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="w-full" variant="secondary">
                        <Link href="/planes">Volver a los Planes</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
