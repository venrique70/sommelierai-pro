export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// RESPUESTA DEMO: 3 elementos con id válidos
const demoItems = [
  { id: "demo-1", wineName: "Catena Zapata",        year: 2018, createdAt: "2023-10-26T12:30:00.000Z" },
  { id: "demo-2", wineName: "Whisky Grants",        year: 2023, createdAt: "2023-10-25T12:30:00.000Z" },
  { id: "demo-3", wineName: "Albariño Rías Baixas", year: 2021, createdAt: "2023-09-12T12:30:00.000Z" },
];

export async function GET() {
  const body = JSON.stringify({ ok: true, items: demoItems });
  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/json", "x-mode": "demo" },
  });
}