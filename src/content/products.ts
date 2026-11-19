/**
 * Configuración de productos.
 *
 * Para sumar un producto nuevo: agregar un objeto a `products` y sus imágenes
 * en /public/productos/<slug>/. No hace falta tocar las pantallas.
 *
 * REGLA: no cargar medidas, materiales, capacidades ni beneficios que no estén
 * confirmados. Mientras falten, `provisional: true` muestra la etiqueta
 * "Provisional" en el sitio.
 */

export type ProductImage = {
  src: string;
  alt: string;
  /** Texto de la etiqueta que se muestra sobre la imagen. */
  etiqueta: string;
};

export type Benefit = {
  titulo: string;
  texto: string;
  provisional: boolean;
};

export type UsoProducto = {
  /** Debe coincidir con una clave de `escenarios` en productSpecs.ts para poder generarlo. */
  id: string;
  titulo: string;
  imagen: ProductImage;
};

export type Product = {
  slug: string;
  activo: boolean;
  /**
   * "disponible": experiencia completa con IA.
   * "proximamente": la tarjeta mide interés y ofrece avisar del lanzamiento (sin IA).
   */
  estado: "disponible" | "proximamente";
  /** Reemplaza el segundo párrafo de la pantalla de foto (qué tiene que mostrar la foto). */
  textoFoto?: string;
  /** La imagen de concepto es horizontal: se muestra completa (4:3) en lugar de 4:5. */
  conceptoHorizontal?: boolean;
  /** Vista inicial del visor 3D (camera-orbit de model-viewer). */
  orbita3d?: string;
  /** Línea corta debajo del título en la pantalla de concepto. */
  bajada: string;
  /** Modelo 3D (.glb) para el visor. */
  modelo3d?: string;
  nombre: string;
  nombreProvisional: boolean;
  /** Imagen de la tarjeta en la pantalla de inicio. */
  portada: ProductImage;
  /** Imagen conceptual de la pantalla 2. */
  concepto: ProductImage;
  /** Ejemplo de qué parte del espacio fotografiar (pantalla 3). */
  ejemploFoto: ProductImage;
  /**
   * Imagen que usa la generación SIMULADA para superponer sobre la foto.
   * Se reemplaza en la Etapa 2 por la generación real.
   */
  superposicionDemo: {
    src: string;
    /** Ancho relativo al ancho de la foto (0 a 1). */
    ancho: number;
    /** Posición vertical del centro, relativa al alto de la foto (0 a 1). */
    centroY: number;
  };
  beneficios: Benefit[];
  /** Datos técnicos confirmados. Vacío hasta que se definan. */
  datosTecnicos: { nombre: string; valor: string }[];
  /** Carrusel de usos (vacío = no se muestra). */
  usos: UsoProducto[];
  /** Mostrar títulos sobre las imágenes del carrusel. */
  usosConTitulo: boolean;
  /**
   * Precios de lanzamiento para el test A/B (cada visitante ve uno al azar).
   * Vacío = no se muestra precio.
   */
  precios: number[];
  moneda: "ARS" | "USD";
};

export const products: Product[] = [
  {
    slug: "escritorio",
    activo: true,
    estado: "disponible",
    modelo3d: "/productos/escritorio/3d/escritorio.glb",
    // Fuente: Resumen ejecutivo Glasspot (nov-2026)
    bajada:
      "Se fija al vidrio con ventosas, sin perforar. Y se pliega sin desinstalarlo.",
    // Nombre de trabajo del brief. Nombre comercial pendiente.
    nombre: "Escritorio de ventana",
    nombreProvisional: true,
    portada: {
      src: "/productos/escritorio/tarjeta.jpg",
      alt: "Boceto técnico del escritorio de ventana con sus dos ventosas",
      etiqueta: "Boceto",
    },
    concepto: {
      src: "/productos/escritorio/concepto.jpg",
      // Render de uso (Martín, 19/11/2026), recortado para destacar el escritorio
      alt: "Mujer desayunando en el escritorio de ventana, con vista a la ciudad",
      etiqueta: "Imagen ilustrativa",
    },
    ejemploFoto: {
      src: "/productos/escritorio/ejemplo-foto.svg",
      alt: "Ejemplo: una foto que muestre la ventana y su entorno inmediato",
      etiqueta: "Ejemplo",
    },
    superposicionDemo: {
      src: "/productos/escritorio/superposicion.png",
      ancho: 0.5,
      centroY: 0.6,
    },
    // Fuente: Resumen ejecutivo Glasspot (nov-2026) + confirmaciones de Martín (15/11/2026)
    beneficios: [
      {
        titulo: "Tu ventana, tu escritorio",
        texto: "Luz natural y vista, sin ocupar el piso.",
        provisional: false,
      },
      {
        titulo: "Sin perforar ni herramientas",
        texto: "Ventosas dobles de vacío. Ideal si alquilás.",
        provisional: false,
      },
      {
        titulo: "Trabajá de pie",
        texto: "Alterná sentado y parado: más pausas activas, menos sedentarismo.",
        provisional: false,
      },
      {
        titulo: "A tu altura",
        texto: "Lo instalás donde te quede cómodo, de pie o sentado.",
        provisional: false,
      },
      {
        titulo: "Se pliega y queda instalado",
        texto: "Lo plegás contra el vidrio y cerrás la cortina.",
        provisional: false,
      },
    ],
    datosTecnicos: [
      { nombre: "Tapa", valor: "Multilaminado de guatambú, 18 mm" },
      { nombre: "Medidas de la tapa", valor: "40 × 30 cm" },
      { nombre: "Altura total", valor: "13,4 cm (tapa + ventosas)" },
      { nombre: "Carga máxima", valor: "Hasta 40 kg" },
      { nombre: "Fijación", valor: "Ventosas dobles de vacío" },
      {
        nombre: "Superficies",
        valor: "Vidrio, azulejo, porcelanato, mármol y metal liso, limpios y sin polvo ni grasa",
      },
      { nombre: "Instalación", valor: "Sin herramientas, sin perforar" },
    ],
    usos: [
      {
        id: "de-pie",
        titulo: "Trabajá de pie",
        imagen: {
          src: "/productos/escritorio/usos/de-pie.jpg",
          alt: "Persona trabajando de pie con una notebook sobre el escritorio de ventana",
          etiqueta: "Imagen ilustrativa",
        },
      },
      {
        id: "desayuno",
        titulo: "Desayuno con vista",
        imagen: {
          src: "/productos/escritorio/usos/desayuno.jpg",
          alt: "Escritorio de ventana con un desayuno: tostadas con palta, jugo y termo, junto a un sillón",
          etiqueta: "Foto real",
        },
      },
      {
        id: "decorativo",
        titulo: "Tu rincón con estilo",
        imagen: {
          src: "/productos/escritorio/usos/decorativo-real.jpg",
          alt: "Escritorio de ventana con un termo, una taza y un parlante frente a una ventana con plantas",
          etiqueta: "Foto real",
        },
      },
      {
        id: "plegado",
        titulo: "Se pliega. No se desinstala.",
        imagen: {
          src: "/productos/escritorio/usos/plegado-real.jpg",
          alt: "Escritorio de ventana plegado hacia abajo contra el vidrio, con las ventosas arriba",
          etiqueta: "Foto real",
        },
      },
    ],
    usosConTitulo: true,
    // Test A/B de precio de preventa (Martín, 15/11/2026): un precio al azar por sesión.
    // Respeta la política: el precio de Mercado Libre ($180.000) es el techo.
    precios: [150000, 165000, 180000],
    moneda: "ARS",
  },
  {
    slug: "tender",
    activo: true,
    estado: "disponible",
    modelo3d: "/productos/tender/3d/tender.glb",
    orbita3d: "250deg 72deg auto",
    // Fuente: renders del producto (carpeta "Producto Glasspot (Tender)", 15/11/2026)
    // y resumen ejecutivo ("usa la pared de la ducha para colgar ropa sin que se vea").
    bajada:
      "Se fija con ventosas a la ventana o a la mampara. Se extiende para colgar la ropa y se pliega cuando no lo usás.",
    // Nombre de trabajo del brief. Nombre comercial pendiente.
    nombre: "Tender para ventana o ducha",
    nombreProvisional: true,
    textoFoto:
      "No hace falta que muestres todo el baño ni la habitación. Simplemente necesitamos ver la ventana o la mampara de la ducha y su entorno inmediato.",
    portada: {
      src: "/productos/tender/tarjeta.jpg",
      alt: "Boceto técnico del tender extendido, con sus dos ventosas",
      etiqueta: "Boceto",
    },
    concepto: {
      // Render del producto en uso (Martín, 19/11/2026)
      src: "/productos/tender/concepto.jpg",
      alt: "Tender extendido en el vidrio de una ventana, con toallas y una remera colgadas",
      etiqueta: "Imagen ilustrativa",
    },
    ejemploFoto: {
      src: "/productos/tender/ejemplo-foto.svg",
      alt: "Ejemplo: una foto que muestre la ventana o la ducha y su entorno inmediato",
      etiqueta: "Ejemplo",
    },
    superposicionDemo: {
      src: "/productos/tender/superposicion.svg",
      ancho: 0.62,
      centroY: 0.55,
    },
    beneficios: [
      {
        titulo: "Colgá la ropa donde no se ve",
        texto: "En la ducha o la ventana, sin ocupar el living ni el balcón.",
        provisional: false,
      },
      {
        titulo: "Sin perforar",
        texto: "Dos ventosas de vacío con palanca. Ideal si alquilás.",
        provisional: false,
      },
      {
        titulo: "Tres varillas extensibles",
        texto: "Plegado, a medio extender o extendido, según cuánta ropa tengas.",
        provisional: false,
      },
      {
        titulo: "Se pliega",
        texto: "Sin uso, queda una barra prolija que no estorba.",
        provisional: false,
      },
    ],
    // Medidas y carga máxima: pendientes de confirmar (no se muestran hasta tenerlas).
    datosTecnicos: [
      { nombre: "Fijación", valor: "Dos ventosas de vacío con palanca" },
      { nombre: "Varillas", valor: "3, extensibles" },
      { nombre: "Posiciones", valor: "Plegado, intermedio y extendido" },
      { nombre: "Instalación", valor: "Sin perforar" },
    ],
    // Renders de uso (Martín, 19/11/2026). Son ilustrativos: se marcan como tales.
    usos: [
      {
        id: "ventana-extendido",
        titulo: "Secá la ropa junto a la ventana",
        imagen: {
          src: "/productos/tender/usos/ventana-extendido.jpg",
          alt: "Tender extendido en el vidrio de una ventana, con ropa colgada al sol",
          etiqueta: "Imagen ilustrativa",
        },
      },
      {
        id: "ducha-extendido",
        titulo: "En la ducha, donde no se ve",
        imagen: {
          src: "/productos/tender/usos/ducha-extendido.jpg",
          alt: "Tender extendido en la pared de azulejos de la ducha, con toallas colgadas",
          etiqueta: "Imagen ilustrativa",
        },
      },
      {
        id: "ventana-plegado",
        titulo: "Plegado, no estorba",
        imagen: {
          src: "/productos/tender/usos/ventana-plegado.jpg",
          alt: "Tender plegado en el vidrio de una ventana",
          etiqueta: "Imagen ilustrativa",
        },
      },
      {
        id: "ducha-plegado",
        titulo: "Se pliega y queda instalado",
        imagen: {
          src: "/productos/tender/usos/ducha-plegado.jpg",
          alt: "Tender plegado en la pared de azulejos de la ducha",
          etiqueta: "Imagen ilustrativa",
        },
      },
    ],
    usosConTitulo: true,
    // Precio de lanzamiento: rango definido por Martín (18/11/2026), test A/B.
    precios: [125000, 145000, 165000],
    moneda: "ARS",
  },
];

export function getActiveProducts(): Product[] {
  // Los disponibles primero; los "próximamente" al final.
  return products
    .filter((p) => p.activo)
    .sort((a, b) => (a.estado === b.estado ? 0 : a.estado === "disponible" ? -1 : 1));
}

export function formatPrice(value: number, moneda: Product["moneda"]) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(value);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.activo);
}

export function isDisponible(p: Product) {
  return p.estado === "disponible";
}
