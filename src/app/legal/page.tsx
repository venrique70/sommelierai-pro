// src/app/legal/page.tsx
import type { Metadata } from "next";
import {
  ShieldCheck,
  BookOpenText,
  Smartphone,
  UserRoundCog,
  Copyright,
  CircleAlert,
  RefreshCcw,
  Database,
  Info,
  Share2,
  Lock,
  BadgeCheck,
  Cookie,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Legal / Términos y Condiciones y Política de Privacidad",
  description:
    "Términos y Condiciones, Política de Privacidad y avisos legales de SommelierPro AI.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/legal" },
};

type Section = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "introduccion",
    title: "Introducción",
    icon: ShieldCheck,
    body: (
      <p>
        Bienvenido(a) a SommelierPro AI. Al utilizar nuestra aplicación, sitio
        web o servicios, aceptas expresamente estos Términos y Condiciones y
        nuestra Política de Privacidad. Si no estás de acuerdo con alguno de
        los puntos aquí descritos, te recomendamos no utilizar la aplicación.
      </p>
    ),
  },
  {
    id: "definiciones",
    title: "Definiciones",
    icon: BookOpenText,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          “Nosotros” / “la empresa”: SommelierPro AI, propiedad de [Nombre
          legal de la empresa].
        </li>
        <li>“Usuario” / “tú”: Persona que descarga, accede o utiliza la app.</li>
        <li>
          “Servicios”: Funcionalidades de la app, incluyendo análisis sensorial
          de vinos, recomendaciones y maridajes.
        </li>
      </ul>
    ),
  },
  {
    id: "uso-aplicacion",
    title: "Uso de la Aplicación",
    icon: Smartphone,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Debes ser mayor de edad en tu país para usar la app.</li>
        <li>
          No puedes usar la aplicación para fines ilegales o que infrinjan
          derechos de terceros.
        </li>
        <li>
          Nos reservamos el derecho de suspender o eliminar cuentas que
          incumplan estos términos.
        </li>
      </ul>
    ),
  },
  {
    id: "registro-cuenta",
    title: "Registro y Cuenta",
    icon: UserRoundCog,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Algunos servicios requieren registro con correo electrónico o cuenta
          de Google.
        </li>
        <li>Es tu responsabilidad mantener la confidencialidad de tu contraseña.</li>
        <li>No compartas tu cuenta con terceros.</li>
      </ul>
    ),
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad Intelectual",
    icon: Copyright,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Todo el contenido generado por SommelierPro AI (textos, imágenes,
          análisis) pertenece a la empresa.
        </li>
        <li>
          No está permitido reproducir, distribuir o modificar el contenido sin
          autorización escrita.
        </li>
      </ul>
    ),
  },
  {
    id: "limitacion-responsabilidad",
    title: "Limitación de Responsabilidad",
    icon: CircleAlert,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          La información y recomendaciones ofrecidas son orientativas y no
          constituyen asesoramiento profesional.
        </li>
        <li>
          No nos hacemos responsables por decisiones de compra o consumo basadas
          en el uso de la app.
        </li>
      </ul>
    ),
  },
  {
    id: "modificaciones",
    title: "Modificaciones",
    icon: RefreshCcw,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Podemos actualizar estos términos y la política de privacidad en
          cualquier momento.
        </li>
        <li>
          La fecha de “Última actualización” se modificará y los cambios
          entrarán en vigor en cuanto se publiquen.
        </li>
      </ul>
    ),
  },
  {
    id: "informacion-recopilada",
    title: "Información que Recopilamos",
    icon: Database,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Datos de registro: Nombre, correo electrónico, contraseña (encriptada).</li>
        <li>Datos de uso: Consultas de vinos, historial de análisis, preferencias de idioma.</li>
        <li>Datos técnicos: IP, tipo de dispositivo, sistema operativo, identificadores únicos.</li>
      </ul>
    ),
  },
  {
    id: "uso-informacion",
    title: "Uso de la Información",
    icon: Info,
    body: (
      <>
        <p>Utilizamos tus datos para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proporcionar y mejorar el servicio.</li>
          <li>Personalizar la experiencia de usuario.</li>
          <li>
            Procesar suscripciones y pagos (a través de proveedores externos como PayPal o
            Lemon Squeezy).
          </li>
          <li>Cumplir con obligaciones legales.</li>
        </ul>
      </>
    ),
  },
  {
    id: "comparticion-informacion",
    title: "Compartición de Información",
    icon: Share2,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>No vendemos tus datos personales.</li>
        <li>
          Podemos compartir información con proveedores de servicios (hosting,
          pagos, analítica) bajo acuerdos de confidencialidad.
        </li>
        <li>Podemos divulgar datos cuando la ley lo requiera.</li>
      </ul>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad",
    icon: Lock,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Implementamos medidas técnicas y organizativas para proteger tus datos.
        </li>
        <li>
          Ningún sistema es 100% seguro, pero tomamos medidas para minimizar
          riesgos.
        </li>
      </ul>
    ),
  },
  {
    id: "derechos-usuario",
    title: "Derechos del Usuario",
    icon: BadgeCheck,
    body: (
      <>
        <p>Dependiendo de tu ubicación, puedes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Acceder, rectificar o eliminar tus datos.</li>
          <li>Oponerte o limitar su tratamiento.</li>
          <li>Solicitar la portabilidad de la información.</li>
        </ul>
        <p>
          Puedes ejercer estos derechos contactándonos en:{" "}
          <strong>vip@sommelierai.pro</strong>.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies y Tecnologías Similares",
    icon: Cookie,
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Usamos cookies para mejorar el funcionamiento y analizar el uso de la
          app.
        </li>
        <li>
          Puedes desactivar las cookies en tu navegador o dispositivo, pero
          algunas funciones podrían no funcionar correctamente.
        </li>
      </ul>
    ),
  },
  {
    id: "contacto",
    title: "Contacto",
    icon: Mail,
    body: (
      <>
        <p>
          Si tienes dudas sobre estos Términos o la Política de Privacidad,
          puedes escribirnos a:
        </p>
        <p>📧 <strong>vip@sommelierai.pro</strong></p>
      </>
    ),
  },
];

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold">
        Legal / Términos y Condiciones y Política de Privacidad
      </h1>
      <p className="mt-1 text-sm opacity-80">
        <strong>Última actualización:</strong> 09 de agosto de 2025
      </p>

      {/* Índice */}
      <nav aria-label="Índice" className="mt-6">
        <ol className="grid gap-2 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-xl border px-4 py-3 hover:bg-white/5 transition"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Contenido */}
      <ol className="mt-8 space-y-6">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.id} id={s.id} className="rounded-2xl border p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full font-semibold bg-amber-500/20 text-amber-400">
                  {i + 1}
                </span>
                <Icon className="size-5 opacity-80" />
                <h2 className="text-lg font-semibold">{s.title}</h2>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {s.body}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
