// src/app/legal/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal | SommelierPro AI",
  description: "Términos y Condiciones y Política de Privacidad",
  robots: { index: true, follow: true },
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 prose prose-neutral dark:prose-invert">
      <h1>Legal</h1>
      <p><strong>Última actualización:</strong> 09 de agosto de 2025</p>

      <nav aria-label="Índice" className="not-prose">
        <ol className="list-decimal pl-5 space-y-1">
          <li><a href="#terminos">Términos y Condiciones</a></li>
          <li><a href="#privacidad">Política de Privacidad</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ol>
      </nav>
      <hr />

      {/* Términos */}
      <h2 id="terminos">Términos y Condiciones</h2>
      <p><em>Bienvenido(a) a SommelierPro AI…</em></p>
      <ul>
        <li>Debes ser mayor de edad para usar la app.</li>
        <li>No puedes usar la app para fines ilegales o que infrinjan derechos.</li>
        <li>Podemos suspender o cerrar cuentas por incumplimiento.</li>
        <li>Propiedad intelectual: el contenido generado por SommelierPro AI pertenece a la empresa.</li>
        <li>Limitación de responsabilidad: la información es orientativa.</li>
        <li>Podemos actualizar estos términos; la vigencia aplica al publicarse.</li>
      </ul>

      <hr />

      {/* Privacidad */}
      <h2 id="privacidad">Política de Privacidad</h2>
      <ul>
        <li>Datos de registro: nombre, correo, contraseña (encriptada).</li>
        <li>Datos de uso: consultas, historial, preferencias.</li>
        <li>Datos técnicos: IP, dispositivo, SO, identificadores.</li>
        <li>Usos: prestar y mejorar el servicio, personalizar, pagos, obligaciones legales.</li>
        <li>No vendemos datos; podemos compartir con proveedores bajo confidencialidad o por ley.</li>
        <li>Seguridad: medidas técnicas y organizativas razonables.</li>
        <li>Derechos: acceso, rectificación, eliminación, oposición/limitación, portabilidad.</li>
        <li>Cookies: pueden desactivarse, algunas funciones podrían verse afectadas.</li>
      </ul>

      <hr />

      <h2 id="contacto">Contacto</h2>
      <p>📧 <strong>vip@sommelierai.pro</strong></p>
    </main>
  );
}
