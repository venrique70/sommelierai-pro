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
      return NextResponse.json(
        { success: false, message: "Missing uid/email" },
        { status: 400 }
      );
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    const FROM =
      process.env.EMAIL_FROM || "SommelierPro AI <onboarding@resend.dev>";
    const ADMIN_TO = process.env.AFFILIATE_ADMIN_EMAIL || "vip@sommelierai.pro";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Falta RESEND_API_KEY en el entorno." },
        { status: 500 }
      );
    }

    const subject = `Nueva solicitud de afiliado: ${body.firstName} ${body.lastName}`;
    const text = `
UID: ${body.uid}
Email: ${body.email}
Nombre: ${body.firstName}
Apellido: ${body.lastName}
Documento: ${body.idNumber}
Teléfono: ${body.phone}
País: ${body.country}
Motivación: ${body.motivation}
`.trim();
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

    // Email al admin (vip@sommelierai.pro)
    const adminResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: ADMIN_TO,
        subject,
        html,
        text,
        reply_to: body.email,
      }),
    });
    const adminJson = await adminResp.json().catch(() => ({} as any));
    if (!adminResp.ok) {
      const msg =
        adminJson?.error?.message ||
        adminJson?.message ||
        `Resend error HTTP ${adminResp.status}`;
      return NextResponse.json(
        { success: false, message: msg, details: adminJson },
        { status: adminResp.status }
      );
    }

    // Confirmación al solicitante
    const userHtml = `
      <p>Hola ${body.firstName},</p>
      <p>Hemos recibido tu solicitud. Te avisaremos por este panel cuando sea revisada.</p>
      <p>— Equipo SommelierPro AI</p>
    `;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: body.email,
        subject: "Hemos recibido tu solicitud — SommelierPro AI",
        html: userHtml,
        text: `Hola ${body.firstName}, hemos recibido tu solicitud.`,
        reply_to: ADMIN_TO,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
