"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";

// Mantengo el tipo para no romper imports antiguos, pero no se usa.
export type VendorLevel = "Nuevo" | "Pregrado" | "Bachelor" | "Pro" | "Master";

const PLAN_COMMISSIONS: { plan: string; month: string; year: string }[] = [
  { plan: "descúbrete",   month: "0%",  year: "0%"  },
  { plan: "iniciado",     month: "5%",  year: "6%"  },  // tu ajuste
  { plan: "una copa",     month: "10%", year: "12%" },
  { plan: "copa premium", month: "15%", year: "17%" },
  { plan: "sibarita",     month: "20%", year: "22%" },
];

export default function CommissionsSection(_props?: { currentLevel?: VendorLevel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" />
          Comisiones por plan
        </CardTitle>
        <CardDescription>
          Comisión estándar por cada plan de suscripción. Los planes anuales pagan más.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Mes</TableHead>
              <TableHead>Año</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PLAN_COMMISSIONS.map((row) => (
              <TableRow key={row.plan}>
                <TableCell className="font-medium capitalize">{row.plan}</TableCell>
                <TableCell>{row.month}</TableCell>
                <TableCell>{row.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
