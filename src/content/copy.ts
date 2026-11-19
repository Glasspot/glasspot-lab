/**
 * Textos del sitio.
 *
 * - Los marcados como APROBADO están copiados textualmente del brief
 *   (Glasspot_Lab_Brief_Claude_Code.md). No modificarlos sin aprobación.
 * - Los marcados como SUGERIDO son textos de interfaz (botones, ayudas, errores)
 *   que el brief no define. Están listados en 02_Contenido/contenido_pendiente.md
 *   para revisión.
 */

export const copy = {
  marca: "Glasspot Lab",

  inicio: {
    // APROBADO
    titulo:
      "¿Alguna vez sentiste que tu casa podía ofrecer más de lo que parece a primera vista?",
    // APROBADO
    complemento:
      "Exploramos nuevas formas de aprovechar los espacios que ya tenés, transformando lugares desaprovechados en nuevas posibilidades.",
    // APROBADO
    institucional:
      "Somos un equipo argentino de apasionados por el diseño y la innovación, que aplica ingeniería para desarrollar soluciones funcionales a problemas reales.",
    // APROBADO
    pregunta: "¿Qué espacio te gustaría transformar?",
  },

  concepto: {
    // APROBADO
    titulo: "Descubrí una nueva forma de aprovechar tu espacio.",
    // SUGERIDO
    cta: "Ver cómo quedaría en mi espacio",
    // APROBADO (Martín, 18/11/2026) — acceso directo al precio
    ctaPrecio: "Ver precio de lanzamiento",
    // SUGERIDO
    volver: "Volver",
    // SUGERIDO
    etiquetaImagen: "Imagen conceptual",
  },

  foto: {
    // APROBADO
    titulo: "Mostranos dónde te gustaría aprovechar este espacio.",
    // APROBADO
    parrafos: [
      "Vamos a abrir la cámara para que puedas sacar una foto del lugar donde te gustaría instalar nuestro producto.",
      "No hace falta que muestres toda la habitación ni que prepares nada especial. Simplemente necesitamos ver la ventana y su entorno inmediato.",
      "¡Con eso alcanza para mostrarte cómo podría quedar nuestra solución en tu espacio!",
    ],
    // APROBADO (texto del botón)
    botonCamara: "Sacar una foto",
    // SUGERIDO
    botonGaleria: "Elegir una foto de la galería",
    // SUGERIDO
    ejemplo: "Ejemplo de qué mostrar",
    // SUGERIDO
    repetir: "Sacar otra",
    // SUGERIDO
    confirmar: "Usar esta foto",
    // SUGERIDO — consentimiento previo al procesamiento (brief, sección 7)
    consentimiento:
      "Acepto que Glasspot Lab use esta foto únicamente para generar la visualización.",
    // SUGERIDO
    errorFormato:
      "No pudimos abrir esa imagen. Probá con otra foto o sacá una nueva.",
    // SUGERIDO
    privacidadBreve:
      "Antes de usarla, quitamos de la foto los datos de ubicación y del dispositivo.",
  },

  procesando: {
    // APROBADO
    titulo: "Estamos preparando tu espacio.",
    // SUGERIDO
    demora: "Está tardando un poco más de lo habitual.",
    // SUGERIDO
    error: "No pudimos preparar la visualización esta vez.",
    // SUGERIDO
    reintentar: "Intentar de nuevo",
    // SUGERIDO
    otraFoto: "Usar otra foto",
    // SUGERIDO
    salir: "Salir",
  },

  resultado: {
    // APROBADO
    aviso:
      "Imagen ilustrativa: el resultado real puede variar.",
    // APROBADO
    pregunta: "¿Te sorprendió esta solución o ya habías visto algo parecido?",
    // APROBADO
    opciones: {
      nueva: "Sí, es la primera vez que veo algo así.",
      conocida: "No, ya había visto alguna solución parecida.",
    },
    // SUGERIDO
    graciasRespuesta: "¡Gracias por contarnos!",
    // SUGERIDO
    continuar: "Continuar",
    // SUGERIDO
    omitir: "Prefiero no responder",
  },

  usos: {
    // SUGERIDO
    titulo: "Más formas de usarlo",
    // SUGERIDO
    verEnMiEspacio: "Ver este uso en mi espacio",
    // SUGERIDO
    preparando: "Preparando este uso en tu espacio…",
    // SUGERIDO
    enTuEspacio: "En tu espacio",
    // SUGERIDO
    error: "No pudimos preparar este uso. Probá con otro o intentá más tarde.",
    // SUGERIDO
    reintentar: "Intentar de nuevo",
  },

  // Versión corta (Martín pidió textos más concisos, 19/11/2026)
  precio: {
    etiqueta: "Precio de lanzamiento",
    bajada: "El precio con el que queremos lanzarlo.",
    parrafos: ["Antes de lanzarlo, queremos saber si te interesa."],
    destacado: "Anotate gratis: si lo lanzamos, te avisamos y te respetamos este precio.",
    anotarse: "",
    sinPagos: "Sin pagos ni compromiso de compra.",
    sinFecha: "Todavía sin fecha de lanzamiento.",
    reservar: "Reservar mi precio",
    ahoraNo: "Ahora no, gracias",
  },

  reserva: {
    titulo: "¡Ayudanos a hacerlo realidad!",
    parrafos: ["Si lo comprarías a este precio, dejanos tu contacto."],
    destacado: "Tu interés decide si lo lanzamos.",
    cierreTexto: ["No pagás nada ni te comprometés a comprar."],
    precioReservado: "Tu precio",
    nombre: "Nombre",
    opcional: "(opcional)",
    email: "Correo electrónico",
    telefono: "Teléfono",
    placeholderEmail: "tu@email.com",
    placeholderTelefono: "351 123 4567",
    ayudaContacto: "Completá al menos uno.",
    consentimientoProducto: "Acepto que me contacten sobre este producto y su lanzamiento.",
    consentimientoPromociones: "Quiero novedades de otros productos de Glasspot Lab.",
    boton: "Confirmar mi reserva",
    aclaracion:
      "Reserva gratuita. No garantiza disponibilidad ni fecha de entrega. Si lanzamos el producto, respetamos este precio a quienes se registraron.",
    errorFaltaContacto: "Dejanos tu correo o tu teléfono.",
    errorEmail: "Revisá el correo electrónico.",
    errorTelefono: "Revisá el teléfono: código de área y número.",
    errorConsentimiento: "Para reservar, aceptá que te contactemos sobre este producto.",
    volver: "Volver",
  },

  parteDelLab: {
    titulo: "¡Ya sos parte de Glasspot Lab!",
    parrafos: ["Gracias: tu interés nos ayuda a decidir qué productos lanzar."],
    destacado: "Si lanzamos el que elegiste, te avisamos y respetamos tu precio.",
    gracias: "",
    otras: "Ver otras soluciones",
  },

  contacto: {
    // APROBADO
    titulo: "¿Querés ser de los primeros en conocer su lanzamiento?",
    // APROBADO
    subtitulo:
      "Suscribite y recibí novedades y descuentos exclusivos para nuestra comunidad.",
    // SUGERIDO (el brief pide "Correo electrónico o teléfono")
    etiquetaCampo: "Correo electrónico o teléfono",
    // SUGERIDO
    placeholder: "tu@email.com o 351 123 4567",
    // APROBADO
    boton: "QUIERO RECIBIR BENEFICIOS",
    // APROBADO
    aclaracion:
      "Tu suscripción es voluntaria. Podés darte de baja cuando quieras.",
    // SUGERIDO — consentimiento comercial (brief, pantalla 6)
    consentimiento:
      "Acepto recibir novedades y promociones de Glasspot Lab por este medio.",
    // SUGERIDO
    omitir: "Prefiero no dejar mis datos",
    // SUGERIDO
    errorFormato: "Revisá el dato: ingresá un email o un teléfono válido.",
    // SUGERIDO
    errorConsentimiento:
      "Para suscribirte, necesitamos que aceptes recibir comunicaciones.",
  },

  cierre: {
    // APROBADO
    titulo: "¡Gracias por descubrir Glasspot Lab!",
    // APROBADO
    parrafos: [
      "Estamos trabajando para transformar espacios desaprovechados en nuevas posibilidades.",
      "Muy pronto vas a conocer nuestras novedades.",
    ],
    // SUGERIDO
    volverInicio: "Volver al inicio",
  },

  pie: {
    // SUGERIDO — principio fundamental del brief
    lema: "Transformamos espacios desaprovechados en nuevas posibilidades.",
    privacidad: "Privacidad",
  },
} as const;
