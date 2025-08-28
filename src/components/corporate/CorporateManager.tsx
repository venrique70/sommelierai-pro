"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus } from "lucide-react";

/* ===== Tipos ===== */
export type CorporatePlan = "Starter" | "Premium" | "Pro";
export type CorporateStatus = "active" | "suspended";
export type CorporateAccount = {
  id: string;
  companyName: string;
  taxId?: string;
  contactEmail: string;
  plan: CorporatePlan;
  seats: number;
  status: CorporateStatus;
  createdAt: string;
  updatedAt?: string;
};
export type CorporateInvite = {
  id: string;
  accountId: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired";
  sentAt: string;
  acceptedAt?: string;
};

type Props = {
  initialAccounts?: CorporateAccount[];
  initialInvites?: CorporateInvite[];
};

function statusBadge(s: CorporateStatus) {
  const map: Record<CorporateStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Activo", variant: "default" },
    suspended: { label: "Suspendido", variant: "secondary" },
  };
  return map[s];
}

export default function CorporateManager({ initialAccounts = [], initialInvites = [] }: Props) {
  const router = useRouter();

  const [tab, setTab] = useState<"accounts" | "invites">("accounts");
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [invites, setInvites] = useState<CorporateInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CorporateStatus | "all">("all");

  const [newCompany, setNewCompany] = useState("");
  const [newTaxId, setNewTaxId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState<CorporatePlan>("Starter");
  const [newSeats, setNewSeats] = useState<number>(3);

  const [inviteAccountId, setInviteAccountId] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  useEffect(() => { setAccounts(initialAccounts); setInvites(initialInvites); setLoading(false); }, [initialAccounts, initialInvites]);

  const filtered = useMemo(() => {
    let list = accounts.slice();
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.companyName.toLowerCase().includes(t) ||
          (a.taxId ?? "").toLowerCase().includes(t) ||
          a.contactEmail.toLowerCase().includes(t)
      );
    }
    if (status !== "all") list = list.filter((a) => a.status === status);
    return list;
  }, [accounts, q, status]);

  function refreshAll() { router.refresh(); }

  async function createAccountReal() {
    if (!newCompany.trim() || !newEmail.trim()) return;
    const res = await fetch("/api/corporate/create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: newCompany.trim(),
        taxId: newTaxId.trim() || undefined,
        contactEmail: newEmail.trim(),
        plan: newPlan, seats: Number(newSeats || 1), status: "active",
      }),
    });
    if (!res.ok) { console.error("create account failed:", await res.text()); alert("Error creando cuenta."); return; }
    setNewCompany(""); setNewTaxId(""); setNewEmail(""); setNewPlan("Starter"); setNewSeats(3);
    router.refresh();
  }

  async function onUpdateAccount(acc: CorporateAccount, patch: Partial<CorporateAccount>) {
    const res = await fetch("/api/corporate/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: acc.id, patch }),
    });
    if (!res.ok) { console.error("update failed:", await res.text()); alert("Error actualizando cuenta."); return; }
    router.refresh();
  }

  async function onSendInvite() {
    const accountId = inviteAccountId || (accounts[0]?.id ?? "");
    if (!accountId || !inviteEmail.trim()) return;
    const res = await fetch("/api/corporate/invite", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, email: inviteEmail.trim(), role: inviteRole }),
    });
    if (!res.ok) { console.error("invite failed:", await res.text()); alert("Error enviando invitación."); return; }
    setInviteEmail(""); router.refresh();
  }

  return (
    <Card className="border">
      <CardHeader className="flex items-center justify-between gap-2 md:flex-row">
        <div><CardTitle>Cuentas Corporativas</CardTitle><CardDescription>Administra cuentas empresa e invitaciones de usuarios.</CardDescription></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAll} disabled={loading}>{loading ? <>Cargando…</> : (<><RefreshCw className="mr-2 h-4 w-4" /> Refrescar</>)}</Button>
          <Button variant={tab === "accounts" ? "default" : "outline"} onClick={()=>setTab("accounts")}>Cuentas</Button>
          <Button variant={tab === "invites" ? "default" : "outline"} onClick={()=>setTab("invites")}>Invitaciones</Button>
        </div>
      </CardHeader>

      <CardContent>
        {tab === "accounts" && (
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2"><label className="block text-sm mb-1">Buscar</label>
              <Input placeholder="Empresa, RUC, email…" value={q} onChange={(e)=>setQ(e.target.value)} /></div>
            <div><label className="block text-sm mb-1">Estado</label>
              <select className="w-full rounded border bg-transparent px-3 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value as CorporateStatus | "all")}>
                <option value="all">Todos</option><option value="active">Activo</option><option value="suspended">Suspendido</option>
              </select></div>
          </div>
        )}

        {tab === "accounts" && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40"><tr>
                  <th className="px-3 py-2 text-left">Empresa</th><th className="px-3 py-2 text-left">RUC</th><th className="px-3 py-2 text-left">Plan</th><th className="px-3 py-2 text-left">Asientos</th><th className="px-3 py-2 text-left">Estado</th><th className="px-3 py-2 text-right">Acciones</th>
                </tr></thead>
                <tbody>
                  {loading ? (<tr><td className="px-3 py-4" colSpan={6}>Cargando…</td></tr>) :
                   filtered.length === 0 ? (<tr><td className="px-3 py-10 text-center opacity-70" colSpan={6}>Sin resultados.</td></tr>) :
                   filtered.map(a => {
                    const b = statusBadge(a.status);
                    return (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2">{a.companyName}</td>
                        <td className="px-3 py-2">{a.taxId ?? "—"}</td>
                        <td className="px-3 py-2">{a.plan}</td>
                        <td className="px-3 py-2">{a.seats}</td>
                        <td className="px-3 py-2"><Badge variant={b.variant}>{b.label}</Badge></td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <Button size="sm" variant="outline" onClick={()=>onUpdateAccount(a,{ status:"active" })}>Activar</Button>
                            <Button size="sm" variant="secondary" onClick={()=>onUpdateAccount(a,{ status:"suspended" })}>Suspender</Button>
                            <Button size="sm" variant="outline" onClick={()=>onUpdateAccount(a,{ plan:"Premium" })}>Plan Premium</Button>
                            <Button size="sm" variant="outline" onClick={()=>onUpdateAccount(a,{ seats:a.seats+1 })}>+1 asiento</Button>
                          </div>
                        </td>
                      </tr>
                    );})}
                </tbody>
              </table>
            </div>

            <div className="rounded border p-4">
              <h3 className="font-semibold mb-2">Nueva cuenta</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Empresa *" value={newCompany} onChange={(e)=>setNewCompany(e.target.value)} />
                <Input placeholder="RUC / Tax ID" value={newTaxId} onChange={(e)=>setNewTaxId(e.target.value)} />
                <Input placeholder="Email de contacto *" type="email" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)} />
                <select className="rounded border bg-transparent px-3 py-2 text-sm" value={newPlan} onChange={(e)=>setNewPlan(e.target.value as CorporatePlan)}>
                  <option value="Starter">Starter</option><option value="Premium">Premium</option><option value="Pro">Pro</option>
                </select>
                <Input type="number" min={1} placeholder="Asientos" value={newSeats} onChange={(e)=>setNewSeats(Number(e.target.value || 1))} />
              </div>
              <div className="mt-3"><Button onClick={createAccountReal}><Plus className="mr-2 h-4 w-4" />Guardar</Button></div>
            </div>
          </div>
        )}

        {tab === "invites" && (
          <div className="space-y-4">
            <div className="rounded border p-4">
              <h3 className="font-semibold mb-2">Enviar invitación</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <select className="rounded border bg-transparent px-3 py-2 text-sm" value={inviteAccountId} onChange={(e)=>setInviteAccountId(e.target.value)}>
                  <option value="">Selecciona cuenta</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.companyName}</option>)}
                </select>
                <Input placeholder="usuario@empresa.com" type="email" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} />
                <div className="flex items-center gap-2">
                  <select className="rounded border bg-transparent px-3 py-2 text-sm w-40" value={inviteRole} onChange={(e)=>setInviteRole(e.target.value as any)}>
                    <option value="member">Miembro</option><option value="admin">Admin</option>
                  </select>
                  <Button onClick={onSendInvite}>Enviar</Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40"><tr>
                  <th className="px-3 py-2 text-left">Cuenta</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Rol</th><th className="px-3 py-2 text-left">Estado</th><th className="px-3 py-2 text-left">Enviado</th>
                </tr></thead>
                <tbody>
                  {loading ? (<tr><td className="px-3 py-4" colSpan={5}>Cargando…</td></tr>) :
                   invites.length === 0 ? (<tr><td className="px-3 py-10 text-center opacity-70" colSpan={5}>Sin invitaciones.</td></tr>) :
                   invites.map(i => {
                    const acc = accounts.find(a => a.id === i.accountId);
                    return (
                      <tr key={i.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2">{acc?.companyName ?? i.accountId}</td>
                        <td className="px-3 py-2">{i.email}</td>
                        <td className="px-3 py-2">{i.role}</td>
                        <td className="px-3 py-2"><Badge variant={i.status==="pending"?"outline":"default"}>{i.status}</Badge></td>
                        <td className="px-3 py-2">{new Date(i.sentAt).toLocaleString()}</td>
                      </tr>
                    );})}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
