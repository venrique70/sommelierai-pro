
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-full py-12">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="items-center">
                    <div className="p-3 bg-green-500/20 rounded-full">
                         <CheckCircle className="size-12 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl mt-4">¡Gracias por tu compra!</CardTitle>
                    <CardDescription className="text-base pt-2">
                        Tu pago se ha procesado correctamente. Ahora puedes disfrutar de todas las funcionalidades de SommelierPro AI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/">Volver a la página principal</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
