// src/app/privacy-policy/page.tsx
export const metadata = {
  title: "Política de Privacidad",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-4xl p-6 text-justify space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Política de Privacidad</h1>
      <p className="opacity-80 text-sm text-center mb-8">
        Última actualización: 8 de agosto de 2025
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Introducción</h2>
        <p>
          En <strong>SommelierPro AI</strong> valoramos y respetamos tu privacidad. 
          Esta política explica cómo recopilamos, usamos y protegemos la información 
          que nos proporcionas al utilizar nuestra aplicación y nuestros servicios.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Información que Recopilamos</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Datos de registro: nombre, correo electrónico y contraseña.</li>
          <li>Información de uso de la app, como vinos consultados y maridajes generados.</li>
          <li>Datos técnicos: dirección IP, tipo de dispositivo y sistema operativo.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Uso de la Información</h2>
        <p>Utilizamos tu información para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Brindarte acceso a las funciones de la aplicación.</li>
          <li>Personalizar recomendaciones y mejorar la experiencia de usuario.</li>
          <li>Comunicarnos contigo para soporte o novedades importantes.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Compartición de Datos</h2>
        <p>
          No compartimos tu información personal con terceros, salvo cuando sea necesario 
          para cumplir con obligaciones legales o mejorar el servicio mediante proveedores 
          de confianza que cumplen con normativas de protección de datos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Seguridad</h2>
        <p>
          Implementamos medidas técnicas y organizativas para proteger tu información contra 
          accesos no autorizados, pérdida o divulgación indebida.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Tus Derechos</h2>
        <p>
          Puedes acceder, rectificar o eliminar tus datos personales enviando una solicitud 
          a nuestro equipo de soporte en <a href="mailto:soporte@sommelierai.pro" className="underline">soporte@sommelierai.pro</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Cambios a esta Política</h2>
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
          Te notificaremos sobre cambios relevantes a través de la aplicación o por correo electrónico.
        </p>
      </section>

      <p className="text-sm opacity-70 text-center mt-8">
        © {new Date().getFullYear()} SommelierPro AI. Todos los derechos reservados.
      </p>
    </main>
  );
}
