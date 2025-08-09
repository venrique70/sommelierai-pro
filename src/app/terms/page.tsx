// src/app/terms/page.tsx
export const metadata = {
  title: "Términos y Condiciones | SommelierPro AI",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-4xl p-6 text-justify space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Términos y Condiciones</h1>
      <p className="opacity-80 text-sm text-center mb-8">
        Última actualización: 8 de agosto de 2025
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Introducción</h2>
        <p>
          Bienvenido a <strong>SommelierPro AI</strong>. Al acceder o utilizar nuestra aplicación,
          aceptas estos Términos y Condiciones. Si no estás de acuerdo, por favor no utilices el servicio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Aceptación de los Términos</h2>
        <p>
          Estos Términos constituyen un acuerdo legalmente vinculante entre tú y SommelierPro AI.
          Podremos actualizarlos ocasionalmente; la versión vigente estará siempre disponible en esta página.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Elegibilidad</h2>
        <p>
          Debes tener la edad legal en tu jurisdicción para celebrar contratos, o contar con autorización de tu
          representante legal. Eres responsable de que el uso cumpla con las leyes que te aplican.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Cuenta y Seguridad</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
          <li>Eres responsable de la confidencialidad de tus credenciales y de toda actividad en tu cuenta.</li>
          <li>Notifica de inmediato cualquier uso no autorizado a <a className="underline" href="mailto:soporte@sommelierai.pro">soporte@sommelierai.pro</a>.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Planes, Pagos y Renovaciones</h2>
        <p>
          Algunos servicios pueden requerir suscripción de pago. Los precios, cargos y ciclos de facturación
          se informan en la compra. Los impuestos aplicables pueden añadirse. Puedes cancelar en cualquier
          momento; las cuotas ya abonadas no son reembolsables salvo que la ley lo exija.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Uso Permitido</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>No intentes descompilar, realizar ingeniería inversa o evadir medidas técnicas.</li>
          <li>No uses el servicio para infringir derechos de terceros ni la ley.</li>
          <li>No intentes acceder a datos o sistemas a los que no tengas permiso.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Contenido y Propiedad Intelectual</h2>
        <p>
          SommelierPro AI y sus licenciantes conservan todos los derechos sobre la app y su contenido.
          Las marcas, logotipos y nombres comerciales son propiedad de sus titulares. Nos concedes una
          licencia no exclusiva para procesar el contenido que subas únicamente a efectos de prestar el servicio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Privacidad</h2>
        <p>
          El tratamiento de tus datos personales se rige por nuestra{" "}
          <a href="/privacy-policy" className="underline">Política de Privacidad</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">9. Servicios y Enlaces de Terceros</h2>
        <p>
          Podemos integrar servicios de terceros. No somos responsables por su disponibilidad o contenido.
          El uso de dichos servicios puede estar sujeto a términos y políticas propias del tercero.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Disponibilidad y Cambios del Servicio</h2>
        <p>
          Podremos introducir cambios, suspender o interrumpir funciones (total o parcialmente) en cualquier
          momento. Procuraremos notificar cambios sustanciales cuando sea razonable hacerlo.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">11. Limitación de Responsabilidad</h2>
        <p>
          En la medida permitida por la ley, SommelierPro AI no será responsable por pérdidas indirectas,
          incidentales, especiales, punitivas o consecuentes, ni por pérdida de beneficios o datos, derivadas
          del uso o imposibilidad de uso del servicio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">12. Indemnización</h2>
        <p>
          Aceptas indemnizar y mantener indemne a SommelierPro AI frente a reclamaciones de terceros
          derivadas de tu uso del servicio o incumplimiento de estos Términos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">13. Cancelación</h2>
        <p>
          Puedes cancelar tu cuenta en cualquier momento. Podemos suspender o cancelar tu acceso si
          incumples estos Términos o si lo exige la ley. Algunas cláusulas seguirán vigentes tras la cancelación.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">14. Modificaciones</h2>
        <p>
          Publicaremos las modificaciones en esta página con una nueva fecha de “Última actualización”.
          El uso continuado del servicio tras los cambios implica tu aceptación de los Términos actualizados.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">15. Ley Aplicable y Jurisdicción</h2>
        <p>
          Estos Términos se rigen por las leyes aplicables del país/estado de constitución u operación de
          SommelierPro AI, sin perjuicio de normas de conflicto. La jurisdicción exclusiva será la de sus tribunales competentes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">16. Contacto</h2>
        <p>
          Si tienes preguntas, escríbenos a{" "}
          <a className="underline" href="mailto:soporte@sommelierai.pro">soporte@sommelierai.pro</a>.
        </p>
      </section>
    </main>
  );
}
// trigger redeploy
