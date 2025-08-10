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
          <li><a href="#introduccion">1. Introducción</a></li>
          <li><a href="#definiciones">2. Definiciones</a></li>
          <li><a href="#uso-aplicacion">3. Uso de la Aplicación</a></li>
          <li><a href="#registro-cuenta">4. Registro y Cuenta</a></li>
          <li><a href="#propiedad-intelectual">5. Propiedad Intelectual</a></li>
          <li><a href="#limitacion-responsabilidad">6. Limitación de Responsabilidad</a></li>
          <li><a href="#modificaciones">7. Modificaciones</a></li>
          <li><a href="#informacion-recopilada">8. Información que Recopilamos</a></li>
          <li><a href="#uso-informacion">9. Uso de la Información</a></li>
          <li><a href="#comparticion-informacion">10. Compartición de Información</a></li>
          <li><a href="#seguridad">11. Seguridad</a></li>
          <li><a href="#derechos-usuario">12. Derechos del Usuario</a></li>
          <li><a href="#cookies">13. Cookies y Tecnologías Similares</a></li>
          <li><a href="#contacto">14. Contacto</a></li>
        </ol>
      </nav>
      <hr />

      {/* 1. Introducción */}
      <h2 id="introduccion">1. Introducción</h2>
      <p>Bienvenido(a) a SommelierPro AI. Al utilizar nuestra aplicación, sitio web o servicios, aceptas expresamente estos Términos y Condiciones y nuestra Política de Privacidad. Si no estás de acuerdo con alguno de los puntos aquí descritos, te recomendamos no utilizar la aplicación.</p>

      <hr />

      {/* 2. Definiciones */}
      <h2 id="definiciones">2. Definiciones</h2>
      <ul>
        <li>“Nosotros” / “la empresa”: SommelierPro AI, propiedad de [Nombre legal de la empresa].</li>
        <li>“Usuario” / “tú”: Persona que descarga, accede o utiliza la app.</li>
        <li>“Servicios”: Funcionalidades de la app, incluyendo análisis sensorial de vinos, recomendaciones y maridajes.</li>
      </ul>

      <hr />

      {/* 3. Uso de la Aplicación */}
      <h2 id="uso-aplicacion">3. Uso de la Aplicación</h2>
      <ul>
        <li>Debes ser mayor de edad en tu país para usar la app.</li>
        <li>No puedes usar la aplicación para fines ilegales o que infrinjan derechos de terceros.</li>
        <li>Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos.</li>
      </ul>

      <hr />

      {/* 4. Registro y Cuenta */}
      <h2 id="registro-cuenta">4. Registro y Cuenta</h2>
      <ul>
        <li>Algunos servicios requieren registro con correo electrónico o cuenta de Google.</li>
        <li>Es tu responsabilidad mantener la confidencialidad de tu contraseña.</li>
        <li>No compartas tu cuenta con terceros.</li>
      </ul>

      <hr />

      {/* 5. Propiedad Intelectual */}
      <h2 id="propiedad-intelectual">5. Propiedad Intelectual</h2>
      <ul>
        <li>Todo el contenido generado por SommelierPro AI (textos, imágenes, análisis) pertenece a la empresa.</li>
        <li>No está permitido reproducir, distribuir o modificar el contenido sin autorización escrita.</li>
      </ul>

      <hr />

      {/* 6. Limitación de Responsabilidad */}
      <h2 id="limitacion-responsabilidad">6. Limitación de Responsabilidad</h2>
      <ul>
        <li>La información y recomendaciones ofrecidas son orientativas y no constituyen asesoramiento profesional.</li>
        <li>No nos hacemos responsables por decisiones de compra o consumo basadas en el uso de la app.</li>
      </ul>

      <hr />

      {/* 7. Modificaciones */}
      <h2 id="modificaciones">7. Modificaciones</h2>
      <ul>
        <li>Podemos actualizar estos términos y la política de privacidad en cualquier momento.</li>
        <li>La fecha de “Última actualización” se modificará y los cambios entrarán en vigor en cuanto se publiquen.</li>
      </ul>

      <hr />

      {/* 8. Información que Recopilamos */}
      <h2 id="informacion-recopilada">8. Información que Recopilamos</h2>
      <ul>
        <li>Datos de registro: Nombre, correo electrónico, contraseña (encriptada).</li>
        <li>Datos de uso: Consultas de vinos, historial de análisis, preferencias de idioma.</li>
        <li>Datos técnicos: IP, tipo de dispositivo, sistema operativo, identificadores únicos.</li>
      </ul>

      <hr />

      {/* 9. Uso de la Información */}
      <h2 id="uso-informacion">9. Uso de la Información</h2>
      <p>Utilizamos tus datos para:</p>
      <ul>
        <li>Proporcionar y mejorar el servicio.</li>
        <li>Personalizar la experiencia de usuario.</li>
        <li>Procesar suscripciones y pagos (a través de proveedores externos como PayPal o Lemon Squeezy).</li>
        <li>Cumplir con obligaciones legales.</li>
      </ul>

      <hr />

      {/* 10. Compartición de Información */}
      <h2 id="comparticion-informacion">10. Compartición de Información</h2>
      <ul>
        <li>No vendemos tus datos personales.</li>
        <li>Podemos compartir información con proveedores de servicios (hosting, pagos, analítica) bajo acuerdos de confidencialidad.</li>
        <li>Podemos divulgar datos cuando la ley lo requiera.</li>
      </ul>

      <hr />

      {/* 11. Seguridad */}
      <h2 id="seguridad">11. Seguridad</h2>
      <ul>
        <li>Implementamos medidas técnicas y organizativas para proteger tus datos.</li>
        <li>Ningún sistema es 100% seguro, pero tomamos medidas para minimizar riesgos.</li>
      </ul>

      <hr />

      {/* 12. Derechos del Usuario */}
      <h2 id="derechos-usuario">12. Derechos del Usuario</h2>
      <p>Dependiendo de tu ubicación, puedes:</p>
      <ul>
        <li>Acceder, rectificar o eliminar tus datos.</li>
        <li>Oponerte o limitar su tratamiento.</li>
        <li>Solicitar la portabilidad de la información.</li>
      </ul>
      <p>Puedes ejercer estos derechos contactándonos en: <strong>vip@sommelierai.pro</strong>.</p>

      <hr />

      {/* 13. Cookies y Tecnologías Similares */}
      <h2 id="cookies">13. Cookies y Tecnologías Similares</h2>
      <ul>
        <li>Usamos cookies para mejorar el funcionamiento y analizar el uso de la app.</li>
        <li>Puedes desactivar las cookies en tu navegador o dispositivo, pero algunas funciones podrían no funcionar correctamente.</li>
      </ul>

      <hr />

      {/* 14. Contacto */}
      <h2 id="contacto">14. Contacto</h2>
      <p>Si tienes dudas sobre estos Términos o la Política de Privacidad, puedes escribirnos a:</p>
      <p>📧 <strong>vip@sommelierai.pro</strong></p>
    </main>
  );
}