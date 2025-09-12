// src/app/api/affiliate/request/route.ts
import { NextResponse } from "next/server";

type Body = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  country: string;
  motivation: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    // Validación mínima
    if (!body?.uid || !body?.email) {
      return NextResponse.json({ success: false, message: "Missing uid/email" }, { status: 400 });
    }

    // Construimos el contenido del correo
    const subject = `Nueva solicitud de afiliado: ${body.firstName} ${body.lastName}`;
    const html = `
      <h2>Nueva solicitud de aprobación (Afiliados)</h2>
      <p><strong>UID:</strong> ${body.uid}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p><strong>Nombre:</strong> ${body.firstName}</p>
      <p><strong>Apellido:</strong> ${body.lastName}</p>
      <p><strong>Documento:</strong> ${body.idNumber}</p>
      <p><strong>Teléfono:</strong> ${body.phone}</p>
      <p><strong>País:</strong> ${body.country}</p>
      <p><strong>Motivación:</strong> ${body.motivation}</p>
    `;

    // Preferimos RESEND, si existe
    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@sommelierai.pro";
    const EMAIL_TO = "vip@sommelierai.pro";

    if (RESEND_API_KEY) {
      // Envío con Resend
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: EMAIL_TO,
          subject,
          html,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Resend error:", text);
        // devolvemos 200 para no bloquear la UX, pero logueamos
      }
    } else {
      // Sin API key -> simulamos envío y seguimos
      console.log("[DEV] Email to vip@sommelierai.pro:", { subject, html });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Affiliate request error:", e);
    return NextResponse.json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
  }
}
