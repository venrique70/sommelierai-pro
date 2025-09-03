"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, CheckCircle, XCircle } from "lucide-react";

// i18n
import { useLang } from "@/lib/use-lang";

type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
export type Vendor = { id: string; name: string; email: string; phone?: string; docId?: string; status: VendorStatus; createdAt: string; };
export type VendorRequest = { id: string; name: string; email: string; phone?: string; docId?: string; status: "pending" | "approved" | "rejected"; createdAt: string; };

type Props = { initialVendors?: Vendor[]; initialRequests?: VendorRequest[]; };

function statusBadge(s: VendorStatus, lang: "es" | "en") {
  const map = {
    es: {
      approved: { label: "Aprobado", variant: "default" as const },
      pending: { label: "Pendiente", variant: "outline" as const },
      rejected: { label: "Rechazado", variant: "destructive" as const },
      suspended: { label: "Suspendido", variant: "secondary" as const },
    },
    en: {
      approved: { label: "Approved", variant: "default" as const },
      pending: { label: "Pending", variant: "outline" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
      suspended: { label: "Suspended", variant: "secondary" as const },
    },
  } as const;
  return map[lang][s];
}

export default function SellersManager({ initialVendors = [], initialRequests = [] }: Props) {
  const lang = useLang("es");
  const router = useRouter();

  const [tab, setTab] = useState<"list" | "requests">("list");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<VendorStatus | "all">("all");
  const [selected, setSelected] = useState<Vendor | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDoc, setNewDoc] = useState("");

  useEffect(() => {
    setVendors(initialVendors);
    setRequests(initialRequests);
    setLoading(false);
  }, [initialVendors, initialRequests]);

  const filtered = useMemo(() => {
    let list = vendors.slice();
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(t) ||
          v.email.toLowerCase().includes(t) ||
          (v.docId ?? "").toLowerCase().includes(t)
      );
    }
    if (status !== "all") list = list.filter((v) => v.status === status);
    return list;
  }, [vendors, q, status]);

  function refreshAll() {
    router.refresh();
  }

  async function createVendorReal() {
    if (!newName.trim() || !newEmail.trim()) return;
    await fetch("/api/vendors/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        docId: newDoc.trim() || undefined,
        status: "approved",
      }),
    });
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewDoc("");
    router.refresh();
  }

  async function changeStatus(v: Vendor, s: VendorStatus) {
    await fetch("/api/vendors/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: v.id, status: s }),
    });
    router.refresh();
  }

  async function removeVendor(v: Vendor) {
    const msg = lang === "es" ? "¿Eliminar definitivamente?" : "Delete permanently?";
    if (!confirm(msg)) return;
    await fetch("/api/vendors/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: v.id }),
    });
    router.refresh();
  }

  async function approveRequest(r: VendorRequest) {
    await fetch("/api/vendors/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: r.id }),
    });
    router.refresh();
  }
  async function rejectRequest(r: VendorRequest) {
    await fetch("/api/vendors/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: r.id, reason: "Rejected by admin" }),
    });
    router.refresh();
  }

  const t = {
    title: lang === "es" ? "Gestión de Vendedores" : "Vendors Management",
    subtitle:
      lang === "es" ? "Administra vendedores aprobados y solicitudes de ingreso." : "Manage approved vendors and incoming requests.",
    refresh: lang === "es" ? "Refrescar" : "Refresh",
    list: lang === "es" ? "Lista" : "List",
    requests: lang === "es" ? "Solicitudes" : "Requests",
    search: lang === "es" ? "Buscar" : "Search",
    state: lang === "es" ? "Estado" : "Status",
    all: lang === "es" ? "Todos" : "All",
    vendor: lang === "es" ? "Vendedor" : "Vendor",
    email: "Email",
    doc: lang === "es" ? "ID / Pasaporte" : "ID / Passport",
    actions: lang === "es" ? "Acciones" : "Actions",
    loading: lang === "es" ? "Cargando…" : "Loading…",
    empty: lang === "es" ? "Sin resultados." : "No results.",
    approve: lang === "es" ? "Aprobar" : "Approve",
    suspend: lang === "es" ? "Suspender" : "Suspend",
    reject: lang === "es" ? "Rechazar" : "Reject",
    delete: lang === "es" ? "Eliminar" : "Delete",
    close: lang === "es" ? "Cerrar" : "Close",
    vendorDetail: lang === "es" ? "Detalle de vendedor" : "Vendor detail",
    createdAt: lang === "es" ? "Creado" : "Created",
    newVendor: lang === "es" ? "Nuevo vendedor" : "New vendor",
    nameReq: lang === "es" ? "Nombre *" : "Name *",
    emailReq: lang === "es" ? "Email *" : "Email *",
    phone: lang === "es" ? "Teléfono" : "Phone",
    docOpt: lang === "es" ? "ID / Pasaporte Nº (opcional)" : "ID / Passport No. (optional)",
    save: lang === "es" ? "Guardar" : "Save",
    pending: lang === "es" ? "Pendiente" : "Pending",
    noRequests: lang === "es" ? "No hay solicitudes." : "No requests.",
  };

  return (
    <Card className="border">
      <CardHeader className="flex items-center justify-between gap-2 md:flex-row">
        <div>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            {loading ? <> {t.loading} </> : (<><RefreshCw className="mr-2 h-4 w-4" /> {t.refresh}</>)}
          </Button>
          <Button variant={tab === "list" ? "default" : "outline"} onClick={() => setTab("list")}>
            {t.list}
          </Button>
          <Button variant={tab === "requests" ? "default" : "outline"} onClick={() => setTab("requests")}>
            {t.requests}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {tab === "list" && (
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">{t.search}</label>
              <Input
                placeholder={lang === "es" ? "Nombre, email, ID / Pasaporte…" : "Name, email, ID / Passport…"}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t.state}</label>
              <select
                className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus | "all")}
              >
                <option value="all">{t.all}</option>
                <option value="approved">{statusBadge("approved", lang).label}</option>
                <option value="pending">{statusBadge("pending", lang).label}</option>
                <option value="rejected">{statusBadge("rejected", lang).label}</option>
                <option value="suspended">{statusBadge("suspended", lang).label}</option>
              </select>
            </div>
          </div>
        )}

        {tab === "list" && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left">{t.vendor}</th>
                    <th className="px-3 py-2 text-left">{t.email}</th>
                    <th className="px-3 py-2 text-left">{t.doc}</th>
                    <th className="px-3 py-2 text-left">{t.state}</th>
                    <th className="px-3 py-2 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-3 py-4" colSpan={5}>
                        {t.loading}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-3 py-10 text-center opacity-70" colSpan={5}>
                        {t.empty}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((v) => {
                      const b = statusBadge(v.status, lang);
                      return (
                        <tr key={v.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <button className="underline underline-offset-2" onClick={() => setSelected(v)}>
                              {v.name}
                            </button>
                          </td>
                          <td className="px-3 py-2">{v.email}</td>
                          <td className="px-3 py-2">{v.docId ?? "—"}</td>
                          <td className="px-3 py-2">
                            <Badge variant={b.variant}>{b.label}</Badge>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="inline-flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => changeStatus(v, "approved")}>
                                {t.approve}
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => changeStatus(v, "suspended")}>
                                {t.suspend}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => changeStatus(v, "rejected")}>
                                {t.reject}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => removeVendor(v)}>
                                {t.delete}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="rounded border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t.vendorDetail}</h3>
                  <Button variant="ghost" onClick={() => setSelected(null)}>
                    {t.close}
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">{lang === "es" ? "Nombre:" : "Name:"}</span> {selected.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selected.email}
                  </div>
                  <div>
                    <span className="font-medium">{t.doc}:</span> {selected.docId ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium">{t.state}:</span>{" "}
                    <Badge variant={statusBadge(selected.status, lang).variant}>{statusBadge(selected.status, lang).label}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">{t.createdAt}:</span> {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => changeStatus(selected, "approved")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t.approve}
                  </Button>
                  <Button variant="secondary" onClick={() => changeStatus(selected, "suspended")}>
                    {t.suspend}
                  </Button>
                  <Button variant="destructive" onClick={() => changeStatus(selected, "rejected")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    {t.reject}
                  </Button>
                  <Button variant="destructive" onClick={() => removeVendor(selected)}>
                    {t.delete}
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded border p-4">
              <h3 className="font-semibold mb-2">{t.newVendor}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder={t.nameReq} value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder={t.emailReq} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <Input placeholder={t.phone} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                <Input placeholder={t.docOpt} value={newDoc} onChange={(e) => setNewDoc(e.target.value)} />
              </div>
              <div className="mt-3">
                <Button onClick={createVendorReal}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.save}
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left">{lang === "es" ? "Nombre" : "Name"}</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">{t.doc}</th>
                  <th className="px-3 py-2 text-left">{t.state}</th>
                  <th className="px-3 py-2 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-4" colSpan={5}>
                      {t.loading}
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td className="px-3 py-10 text-center opacity-70" colSpan={5}>
                      {t.noRequests}
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-muted-30">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.docId ?? "—"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{statusBadge("pending", lang).label}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => approveRequest(r)}>
                            {t.approve}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectRequest(r)}>
                            {t.reject}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
