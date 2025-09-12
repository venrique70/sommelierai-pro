// src/app/api/affiliate/request/route.ts
import { NextResponse } from "next/server";
import type { Transporter } from "nodemailer";

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

const ADMIN_TO = process.env.AFFILIATE_ADMIN_EMAIL || "vip@sommelierai.pro";
const FROM      = process.env.EMAIL_FROM || "SommelierPro AI <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// SMTP (fallback)
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 0);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

async function sendViaResend(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string }) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || "",
      reply_to: opts.replyTo,
    }),
  });
  const json = await resp.json().catch(() => ({} as any));
  if (!resp.ok) {
    const msg = json?.error?.message || json?.message || `Resend error HTTP ${resp.status}`;
    const err = new Error(msg) as any;
    err.status = resp.status;
    err.details = json;
    throw err;
  }
  return json;
}

async function ensureTransport(): Promise<Transporter | null> {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465 TLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.uid || !body?.email) {
      return NextResponse.json({ success: false, message: "Missing uid/email" }, { status: 400 });
    }

    const subjectAdmin = `Nueva solicitud de afiliado: ${body.firstName} ${body.lastName}`;
    const textAdmin = `
UID: ${body.uid}
Email: ${body.email}
Nombre: ${body.firstName}
Apellido: ${body.lastName}
Documento: ${body.idNumber}
Teléfono: ${body.phone}
País: ${body.country}
Motivación: ${body.motivation}
`.trim();
    const htmlAdmin = `
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

    // 1) Intento con Resend
    try {
      await sendViaResend({
        to: ADMIN_TO,
        subject: subjectAdmin,
        html: htmlAdmin,
        text: textAdmin,
        replyTo: body.email,
      });

      // confirmación al solicitante
      await sendViaResend({
        to: body.email,
        subject: "Hemos recibido tu solicitud — SommelierPro AI",
        html: `<p>Hola ${body.firstName},</p><p>Hemos recibido tu solicitud. Te avisaremos por este panel cuando sea revisada.</p><p>— Equipo SommelierPro AI</p>`,
        text: `Hola ${body.firstName}, hemos recibido tu solicitud.`,
        replyTo: ADMIN_TO,
      });

      return NextResponse.json({ success: true });
    } catch (e: any) {
      // 2) Fallback SMTP si hay credenciales
      const transporter = await ensureTransport();
      if (transporter) {
        await transporter.sendMail({
          from: FROM,
          to: ADMIN_TO,
          subject: subjectAdmin,
          html: htmlAdmin,
          text: textAdmin,
          replyTo: body.email,
        });
        await transporter.sendMail({
          from: FROM,
          to: body.email,
          subject: "Hemos recibido tu solicitud — SommelierPro AI",
          html: `<p>Hola ${body.firstName},</p><p>Hemos recibido tu solicitud. Te avisaremos por este panel cuando sea revisada.</p><p>— Equipo SommelierPro AI</p>`,
          text: `Hola ${body.firstName}, hemos recibido tu solicitud.`,
          replyTo: ADMIN_TO,
        });
        return NextResponse.json({ success: true, note: "sent via SMTP fallback" });
      }
      // Si no hay SMTP, devolver detalle de Resend
      const msg = e?.message || "Resend error";
      return NextResponse.json({ success: false, message: msg, details: e?.details || null }, { status: e?.status || 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
  }
}
