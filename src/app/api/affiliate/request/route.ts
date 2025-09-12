import { NextResponse } from "next/server";

type Body = {
  uid: string;
  email: string; // solicitante
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
    if (!body?.uid || !body?.email) {
      return NextResponse.json({ success: false, message: "Missing uid/email" }, { status: 400 });
    }

    const adminTo = process.env.AFFILIATE_ADMIN_EMAIL || "vip@sommelierai.pro";
    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    const FROM = process.env.EMAIL_FROM || "SommelierPro AI <onboarding@resend.dev>";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Falta RESEND_API_KEY en el entorno." },
        { status: 500 }
      );
    }

    // --- Email al admin ---
    const adminHtml = `
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
    const adminResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: FROM,
        to: adminTo,
        subject: `Nueva solicitud de afiliado: ${body.firstName} ${body.lastName}`,
        html: adminHtml,
        reply_to: body.email,
      }),
    });
    const adminJson = await adminResp.json().catch(() => ({}));
    if (!adminResp.ok) {
      const msg = adminJson?.error?.message || adminJson?.message || `Resend error HTTP ${adminResp.status}`;
      return NextResponse.json({ success: false, message: msg, details: adminJson }, { status: adminResp.status });
    }

    // --- Email de confirmación al solicitante ---
    const userHtml = `
      <p>Hola ${body.firstName},</p>
      <p>Gracias por tu interés en ser referente de SommelierPro AI. Hemos recibido tu solicitud y nuestro equipo la revisará.</p>
      <p>Recibirás una notificación en este panel cuando sea aprobada o rechazada.</p>
      <p>— Equipo SommelierPro AI</p>
    `;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: FROM,
        to: body.email,
        subject: "Hemos recibido tu solicitud — SommelierPro AI",
        html: userHtml,
        reply_to: adminTo,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
  }
}
