export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DOCS DEMO con estructura de detalle (analysis + pairing + imageUrl)
const demoDocs = {
  "demo-1": {
    wineName: "Catena Zapata",
    year: 2018,
    imageUrl: "https://picsum.photos/seed/wine1/640/360",
    analysis: {
      visual:   { color: "Amarillo pajizo", limpidez: "Brillante", lagrimas: "Medias", notas: ["reflejos dorados"] },
      olfativo: { intensidad: "Media+", notas: ["cítricos", "manzana", "flores"] },
      gustativo:{ acidez: "Media+", alcohol: "Medio", cuerpo: "Medio", final: "Medio+", descriptor: "Fresco y balanceado" },
      serving:  { temperatura: "8–10°C", copa: "Blanco", decantar: false }
    },
    pairing: { recomendados: ["Ostras", "Ceviche"] },
    createdAt: "2023-10-26T12:30:00.000Z"
  },
  "demo-2": {
    wineName: "Whisky Grants",
    year: 2023,
    imageUrl: "https://picsum.photos/seed/wine2/640/360",
    analysis: {
      visual:   { color: "Ámbar", limpidez: "Brillante" },
      olfativo: { intensidad: "Media", notas: ["vainilla", "miel", "madera"] },
      gustativo:{ alcohol: "Alto", cuerpo: "Medio", final: "Largo", descriptor: "Redondo" },
      serving:  { temperatura: "18–20°C", copa: "Whisky", decantar: false }
    },
    pairing: { recomendados: ["Chocolate amargo", "Quesos"] },
    createdAt: "2023-10-25T12:30:00.000Z"
  },
  "demo-3": {
    wineName: "Albariño Rías Baixas",
    year: 2021,
    imageUrl: "https://picsum.photos/seed/wine3/640/360",
    analysis: {
      visual:   { color: "Amarillo pálido", limpidez: "Brillante" },
      olfativo: { intensidad: "Media+", notas: ["cítricos", "herbáceo"] },
      gustativo:{ acidez: "Alta", alcohol: "Medio", cuerpo: "Ligero", final: "Medio", descriptor: "Vibrante" },
      serving:  { temperatura: "8–10°C", copa: "Blanco", decantar: false }
    },
    pairing: { recomendados: ["Mariscos", "Pulpo a la gallega"] },
    createdAt: "2023-09-12T12:30:00.000Z"
  }
};

export async function GET(_req, { params }) {
  const doc = demoDocs[params.id];
  if (!doc) {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404, headers: { "content-type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ ok: true, id: params.id, ...doc }), {
    status: 200, headers: { "content-type": "application/json", "x-mode": "demo" }
  });
}