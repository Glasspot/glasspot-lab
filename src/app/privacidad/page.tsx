export const metadata = { title: "Privacidad · Glasspot Lab" };

// Texto provisional y fiel a cómo funciona hoy la web. Antes de publicar con ads,
// revisarlo con un profesional (Ley 25.326 de Protección de Datos Personales).
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-xl px-5">
      <h1 className="text-3xl font-light tracking-tight">Privacidad</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-gris-4">
        <p>
          Glasspot Lab es un laboratorio de desarrollo de productos. Usamos tus datos solo para lo que
          te explicamos acá.
        </p>
        <h2 className="pt-2 text-base font-medium text-tinta">Fotos de tu espacio</h2>
        <p>
          Si usás la visualización, tu foto se envía a un servicio de inteligencia artificial (OpenAI)
          únicamente para generar la imagen del producto en tu espacio. Antes de enviarla quitamos los
          datos de ubicación y del dispositivo. No guardamos tu foto ni la usamos para otra cosa.
        </p>
        <h2 className="pt-2 text-base font-medium text-tinta">Reserva del precio de lanzamiento</h2>
        <p>
          Si reservás tu precio, registramos tu nombre (si lo dejás), tu correo electrónico o teléfono,
          el producto, el precio que viste y la fecha. Los usamos para avisarte sobre ese producto y su
          eventual lanzamiento. Solo te enviamos novedades de otros productos si lo aceptaste.
        </p>
        <h2 className="pt-2 text-base font-medium text-tinta">Uso de la web</h2>
        <p>
          Registramos de forma anónima cómo se usa la web (qué pantallas se ven y qué botones se tocan)
          para mejorarla. Esos registros no incluyen tu correo ni tu teléfono.
        </p>
        <h2 className="pt-2 text-base font-medium text-tinta">Tus derechos</h2>
        <p>
          Podés pedirnos en cualquier momento que te demos de baja, o acceder, corregir o eliminar tus
          datos.
        </p>
      </div>
    </div>
  );
}
