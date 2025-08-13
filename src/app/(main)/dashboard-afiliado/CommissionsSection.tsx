"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Building, Users } from "lucide-react";

export type VendorLevel = "Nuevo" | "Pregrado" | "Bachelor" | "Pro" | "Master";

const COMMISSIONS_BY_USER = [
  { level: "Nuevo",    requirement: "0-4 Referidos",   iniciado: "0%",  unaCopa: "0%",  copaPremium: "0%",  sibarita: "0%"  },
  { level: "Pregrado", requirement: "5-9 Referidos",   iniciado: "5%",  unaCopa: "8%",  copaPremium: "10%", sibarita: "15%" },
  { level: "Bachelor", requirement: "10-19 Referidos", iniciado: "7%",  unaCopa: "10%", copaPremium: "12%", sibarita: "17%" },
  { level: "Pro",      requirement: "20-29 Referidos", iniciado: "9%",  unaCopa: "12%", copaPremium: "15%", sibarita: "18%" },
  { level: "Master",   requirement: "30+ Referidos",   iniciado: "11%", unaCopa: "15%", copaPremium: "17%", sibarita: "20%" },
] as const;

const COMMISSIONS_CORP = [
  { subscriptions: "10-15", copaPremium: "10%", sibarita: "15%" },
  { subscriptions: "16-20", copaPremium: "12%", sibarita: "17%" },
  { subscriptions: "21-25", copaPremium: "15%", sibarita: "20%" },
] as const;

export default function CommissionsSection({ currentLevel }: { currentLevel?: VendorLevel }) {
  const highlight = currentLevel ?? "Bachelor";

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary" />
            Comisiones por Planes de Usuario
          </CardTitle>
          <CardDescription>Tu comisión por referidos individuales se basa en tu nivel y el plan del referido.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel</TableHead>
                <TableHead>Requisito</TableHead>
                <TableHead>Iniciado</TableHead>
                <TableHead>Una Copa</TableHead>
                <TableHead>Copa Premium</TableHead>
                <TableHead>Sibarita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMMISSIONS_BY_USER.map((row) => {
                const isMe = row.level === highlight;
                return (
                  <TableRow key={row.level} className={isMe ? "bg-accent" : ""}>
                    <TableCell className="font-medium">
                      {row.level}
                      {isMe && <Badge variant="outline" className="ml-2">Tu Nivel</Badge>}
                    </TableCell>
                    <TableCell>{row.requirement}</TableCell>
                    <TableCell>{row.iniciado}</TableCell>
                    <TableCell>{row.unaCopa}</TableCell>
                    <TableCell>{row.copaPremium}</TableCell>
                    <TableCell>{row.sibarita}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="text-primary" />
            Comisiones por Planes Corporativos
          </CardTitle>
          <CardDescription>Comisiones especiales por la venta de planes corporativos por volumen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volumen (Suscripciones)</TableHead>
                <TableHead>Copa Premium</TableHead>
                <TableHead>Sibarita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMMISSIONS_CORP.map((row) => (
                <TableRow key={row.subscriptions}>
                  <TableCell className="font-medium">{row.subscriptions}</TableCell>
                  <TableCell>{row.copaPremium}</TableCell>
                  <TableCell>{row.sibarita}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
