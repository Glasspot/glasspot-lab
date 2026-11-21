/**
 * Ficha técnica que se envía a la IA para cada producto. SOLO SE USA EN EL SERVIDOR.
 *
 * REGLA: cargar únicamente datos confirmados. Los campos `null` todavía no se
 * definieron y NO se envían al modelo (el prompt no inventa medidas).
 *
 * `descripcionVisual` describe lo que se ve en las fotos y renders del kit de
 * referencia; no son promesas comerciales.
 */

export type ProductSpec = {
  slug: string;
  nombreEnIngles: string;
  /** Qué es y cómo se instala, en inglés (los modelos responden mejor). */
  descripcionVisual: string;
  /** Cosas que el modelo NO debe agregar ni cambiar. */
  prohibido: string[];
  /** Dónde va ubicado respecto de la ventana. */
  ubicacion: string;
  /** Foto de ejemplo de una instalación correcta (va como última imagen, con su propia explicación). */
  ejemploCorrecto?: { archivo: string; descripcion: string };
  /** Regla innegociable de dónde se pegan las ventosas (inglés). */
  reglaVentosas: string;
  medidas: {
    anchoCm: number | null;
    profundidadCm: number | null;
    espesorMm: number | null;
    /** Altura total del conjunto: de la cara superior de la tapa al borde inferior de las ventosas. */
    alturaTotalMm?: number | null;
  };
  /** Indicaciones de proporción que la IA debe respetar sí o sí. */
  proporciones?: string;
  material: string | null;
  color: string | null;
  /** Imágenes del kit de referencia (en /referencias/<slug>/) que se envían a la IA. */
  referencias: string[];
  /**
   * Escenarios de uso ("Ver este uso en mi espacio"). La clave coincide con el `id`
   * de los usos del carrusel en products.ts.
   */
  escenarios: Record<string, { escena: string; referenciasExtra?: string[]; controlCalidad?: string }>;
  /**
   * Contexto de instalación cuando NO es el escritorio de ventana (por ejemplo, el
   * tender: ventana o mampara de ducha). Si falta, se usan los textos del escritorio.
   */
  contexto?: {
    /** Qué tiene que mostrar la foto para ser apta (inglés). */
    apta: string;
    /** Mensaje en castellano si la foto no sirve. */
    noApta: string;
    /** Cómo describir la foto del usuario (inglés). Ej: "a window or a shower". */
    escenaFoto: string;
    /** Pedido de ubicación sugerida para el análisis (inglés). */
    posicion: string;
    /** Reemplaza las líneas de escala (inglés). */
    escala: string;
    /** Reemplaza las indicaciones de perspectiva y luz (inglés). */
    perspectivaYLuz: string;
    /** Motivos de rechazo propios del producto para el control de calidad (inglés). */
    qaRechazo: string;
  };
};

export const productSpecs: Record<string, ProductSpec> = {
  // Fuente: renders del producto (carpeta "Producto Glasspot (Tender)", 15/11/2026).
  // Medidas reales pendientes: la escala se describe por proporciones.
  tender: {
    slug: "tender",
    nombreEnIngles: "suction-cup telescopic drying rack",
    descripcionVisual:
      "A compact wall-mounted drying rack in near-black anthracite metal (see the first reference: the product installed on a wall). Its body is a long, slim rectangular horizontal bar (a closed box when folded, with three light-gray rod end caps showing at one end). " +
      "On the back of the bar, against the surface, there are two large round black rubber suction cups, each with a small black lever tab hanging below it; the cups stick flat onto the glass or smooth tile and hold the bar horizontally, close to the surface. " +
      "When extended, three square-section rods slide out of the bar and run horizontally, PARALLEL to the wall, sticking out beyond both ends of the bar. The three rods are stepped like a staircase: " +
      "each one a little further from the wall and a little lower than the previous one, linked by two flat angled cross plates on top. The rods have light-gray end caps. Towels and clothes hang over the rods. Nothing touches the floor.",
    prohibido: [
      "legs or any support reaching the floor",
      "screws, brackets or holes drilled into the wall or tiles",
      "hooks, hangers, shelves, baskets or extra rods that are not in the references",
      "more or fewer than two suction cups",
      "a different color: it is dark graphite-gray metal with black suction cups",
    ],
    ubicacion:
      "Mounted horizontally on the glass shower screen, on the window glass or on a smooth tiled wall, at about chest-to-head height of an adult, centered on a clear area, " +
      "with both suction cups on the same flat surface (never across a frame, a hinge or a joint between glass and tile). The rods are extended and parallel to the surface.",
    reglaVentosas:
      "BOTH suction cups must be stuck flat on window GLASS, on the glass shower screen, or on smooth wall tiles, completely inside that surface with a clear margin around each cup. " +
      "NEVER on a window frame, aluminum profile, sash, mullion, track, sill, a horizontal bar between two panes, the metal frame or hinge of a shower screen, the edge of the glass, a corner, or across the joint between glass and tile.",
    medidas: { anchoCm: null, profundidadCm: null, espesorMm: null },
    proporciones:
      "Each suction cup diameter is almost as tall as the bar is high plus a bit more (the cups stick out above and below the bar). " +
      "Folded, the bar is about 5 to 6 suction-cup diameters long; fully extended, the rods reach about 1.7 times the folded length. The rods are thin compared with the bar.",
    material: "metal (aluminium-look) bar and rods, black rubber suction cups",
    color: "near-black anthracite metal (matte, slightly satin), black suction cups and levers, light gray rod end caps",
    // Primero el producto INSTALADO (cómo va en la pared), después vistas de producto.
    referencias: ["07_instalado_extendido.jpg", "03_extendido.jpg", "02_plegado_ventosas.jpg", "08_instalado_plegado.jpg"],
    escenarios: {
      "ventana-extendido": {
        escena:
          "USE SCENE: drying clothes at the window. Mount the rack on the window glass at about chest height, fully extended, with two or three garments or towels (for example a white t-shirt and two towels) hanging naturally over the rods, catching the daylight.",
        controlCalidad: "The rack is extended with a few garments hanging; garments are expected.",
      },
      "ducha-extendido": {
        escena:
          "USE SCENE: in the shower. Mount the rack on the shower's glass screen or tiled wall (whichever Image 1 shows), at about head height and away from the shower head, fully extended, with two or three towels hanging over the rods. " +
          "If Image 1 is not a bathroom, mount it on the main glass or smooth wall visible instead.",
        controlCalidad: "The rack is extended with towels hanging; towels are expected.",
      },
      "ventana-plegado": {
        escena:
          "USE SCENE: folded at the window. The rods are fully retracted: the rack is a single closed horizontal bar with the two suction cups behind it, stuck on the window glass at about chest height. Nothing hangs from it.",
        controlCalidad: "The rack must be FOLDED (one closed bar, no rods sticking out) and empty.",
      },
      "ducha-plegado": {
        escena:
          "USE SCENE: folded in the shower. The rods are fully retracted: the rack is a single closed horizontal bar with the two suction cups behind it, stuck on the shower's glass screen or tiled wall at about head height. Nothing hangs from it. " +
          "If Image 1 is not a bathroom, mount it on the main glass or smooth wall visible instead.",
        controlCalidad: "The rack must be FOLDED (one closed bar, no rods sticking out) and empty.",
      },
    },
    contexto: {
      apta: "a window with visible glass, a glass shower screen, or a smooth tiled bathroom wall is clearly shown",
      noApta: "No encontramos una ventana, una mampara ni una pared de azulejos en la foto.",
      escenaFoto: "a bathroom (glass shower screen or tiled wall) or a window",
      posicion:
        "where on the glass shower screen, window glass or smooth tiled wall a horizontal drying rack about the width of a bath towel would fit, centered on a clear flat area at chest-to-head height, with both suction cups on the same flat surface",
      escala:
        "this is a household accessory one person holds with both hands. Extended, it is roughly as long as a bath towel is wide; it never spans the whole shower screen or window. " +
        "Use door handles, taps, tiles and window frames in Image 1 to keep a believable real size.",
      perspectivaYLuz:
        "- Follow the exact perspective and vanishing lines of Image 1; the bar and rods must be level and parallel to the surface. " +
        "Match the real light direction, intensity and color temperature of Image 1, with soft shadows of the rack and of the hanging clothes on the surface, subtle reflections on glass or glossy tiles, " +
        "Unless the USE SCENE says otherwise, show the rack fully extended with two or three ordinary towels or garments hanging naturally over the rods so the use is clear. The product must look photographed in that exact light, never pasted.",
      qaRechazo:
        "any suction cup touches or sits on a window frame, aluminum profile, sash, track, sill, shower-screen frame or hinge, or the edge of the glass (cups must be fully on glass or tile), " +
        "the product does not resemble the references (long dark-gray bar, two large black suction cups on its back, three telescopic rods), the suction cups are not on a flat glass or tile surface, " +
        "the rods stick out perpendicular to the wall instead of running parallel to it, it has legs, hooks or extra parts, the scale is absurd (much bigger than a bath towel), it floats away from the surface, the perspective is clearly wrong, " +
        "or the rest of the original photo was noticeably changed (a few hanging garments are expected and OK)",
    },
  },
  escritorio: {
    slug: "escritorio",
    nombreEnIngles: "window desk",
    descripcionVisual:
      "A compact cantilevered desk: a single flat rectangular board of light guatambú multilayer plywood (18 mm) held horizontally by two hinged brackets (black and metal) fixed under the board, next to the glass. " +
      "Each bracket ends in a large round black suction cup with a lever clamp. The two suction cups stick onto the window glass BELOW the board level, so when the desk is open the board sits on top of them " +
      "and projects perpendicular to the glass toward the room, like a small floating shelf a laptop can sit on. The hinges let the board fold DOWN flat against the glass. " +
      "There is nothing touching the floor and nothing touching the window frame.",
    prohibido: [
      "legs or any support reaching the floor",
      "brackets screwed into the wall or the window frame",
      "drawers, shelves, edges or rails that are not in the reference",
      "a different board shape (it is a plain flat rectangle)",
      "more or fewer than two suction cups",
    ],
    ubicacion:
      "HORIZONTAL PLACEMENT RULE (very important): the desk is always centered left-to-right within ONE single glass pane, at the middle of that pane between its side frames. " +
      "BOTH suction cups must be stuck on the SAME pane of glass. Never place one suction cup on one pane and the other on a different pane, and never across a frame, mullion or sash bar. " +
      "Only if no single pane is wide enough for the 40 cm board may it span two panes. Board level with the floor.",
    // Instalación correcta en una ventana con travesaño (render aprobado por Martín, 20/11/2026)
    ejemploCorrecto: {
      archivo: "12_ejemplo_travesano.jpg",
      descripcion:
        "a CORRECT installation on a window that has a horizontal aluminum bar between an upper and a lower glass: the desk is mounted HIGH on the upper glass, " +
        "both suction cups are fully on the same pane of glass, clearly ABOVE the horizontal bar, and nothing rests on the bar. " +
        "Use it ONLY to learn this placement logic (height and where the cups go); never copy its window, view or furniture.",
    },
    reglaVentosas:
      "BOTH suction cups must be stuck flat on the transparent GLASS of the window, completely inside the glass area, with clear glass visible all around each cup. " +
      "NEVER on the aluminum or wooden frame, sash, mullion, sliding track, sill, wall or any profile, not even partially. " +
      "MANY WINDOWS HAVE A HORIZONTAL ALUMINUM BAR (transom/middle rail) between an upper and a lower glass: never rest the board on that bar and never stick the cups on it or straddling it. " +
      "Choose ONE glass area (the upper or the lower pane) and keep the whole product, cups included, inside it: if you use the upper pane, the cups must end clearly ABOVE that bar; if the lower pane, the board goes below the bar. " +
      "The cups sit BELOW the board (the whole assembly is 13.4 cm tall), so the board must be mounted high enough on the pane that the cups end well above the bottom frame: " +
      "place the board top at least about 20 cm above the bottom edge of the visible glass, higher if needed. Never rest the cups on the bottom frame or the sill.",
    // Medidas reales tomadas del modelo 3D "Diseño Glasspot" (confirmado por Martín 15/11/2026):
    // tapa 40 cm (a lo largo del vidrio) × 30 cm (de fondo) × 18 mm; altura total 13,4 cm;
    // ventosas de 12 cm de diámetro, centros separados 23 cm.
    medidas: { anchoCm: 40, profundidadCm: 30, espesorMm: 18, alturaTotalMm: 134 },
    proporciones:
      "Real dimensions: the board is 40 cm wide along the glass and 30 cm deep (from the glass towards the room), 18 mm thick. " +
      "The two suction cups are LARGE: each one is a round black disc 12 cm in diameter (almost a third of the board width), stuck flat on the glass under the board's back edge, " +
      "their centers 23 cm apart, so they sit close to the two ends of the board. " +
      "From the top surface of the board down to the bottom edge of the suction cups the assembly measures 13.4 cm, which is about 45% of the board depth and a third of its width. " +
      "Never draw the cups small, thin or hidden, and never draw the board longer than 40 cm: it is a compact board, wider than deep (4:3). Keep exactly these proportions, as in the references.",
    // Confirmado por Martín (15/11/2026): multilaminado de guatambú, 18 mm (resumen ejecutivo).
    material: "guatambú multilayer plywood, 18 mm thick, with the thin plywood layers visible on the edges",
    color: "pale cream to light yellowish natural wood (guatambú) with a fine, straight, subtle grain and a smooth matte finish",
    // Solo imágenes centradas en el PRODUCTO. Las fotos con ambiente completo
    // (02, 03, 04) hacían que la IA copiara esa escena en lugar de usar la foto del usuario.
    referencias: [
      "01_detalle_ventosas.jpg",
      "08_ventosas_debajo.jpg",
      "09_textura_tapa.jpg",
      "05_render_frente.jpg",
      "06_render_isometrico.jpg",
    ],
    escenarios: {
      "de-pie": {
        escena:
          "USE SCENE: standing desk for working on a laptop. Mount the board HIGH: the laptop SCREEN must be at about the CHEST height of the standing adult, so the board top is roughly at the height of the lower chest / just above the elbows (about 115-125 cm from the floor), never at hip or waist height. " +
          "If a horizontal frame bar crosses the window near that height, mount the board on the upper glass, high enough that both suction cups end clearly above that bar. " +
          "Add one adult person standing in front of it, working on a laptop placed on the board. Show the person from behind or from the side, face not visible, natural posture and realistic proportions relative to the window and the product. " +
          "The laptop must look the right size for the board.",
        controlCalidad: "A standing person working on a laptop is expected in this scene.",
      },
      desayuno: {
        escena:
          "USE SCENE: breakfast at the window. Mount the board at about table height for a seated adult (around 75-85 cm from the floor), on a part of the glass where both suction cups fit fully on glass; if a frame bar is in the way, go higher. " +
          "Add a healthy breakfast on the board (a cup of coffee, a bowl of yogurt with fruit and granola) and one adult person sitting on a simple chair in front of it, seen from behind or partially (shoulders, arms, hands), face not visible.",
        controlCalidad: "A seated person and breakfast items are expected in this scene.",
      },
      decorativo: {
        escena:
          "USE SCENE: decorative corner, no people. Mount the board at mid height of a clear glass area (both cups fully on glass) and place on it two or three minimal decorative objects (a small plant in a ceramic pot, a glass vase with a few stems, or a compact speaker). Calm, tidy, design-magazine look.",
        controlCalidad: "Decorative objects on the board are expected; no people.",
      },
      plegado: {
        escena:
          "USE SCENE: folded. The board is FOLDED DOWN on its hinges, like a drop-leaf table: the hinges and the two suction cups stay at the TOP, still stuck to the glass, " +
          "and the board HANGS DOWNWARD from them, vertical and flat against the glass. The suction cups and brackets remain visible ABOVE the top edge of the folded board " +
          "(partly covered by it). The board is never above the suction cups when folded and the suction cups are never at the bottom. See the real folded photos in the references. " +
          "If the window has a curtain or roller blind, show it partially lowered in front of the folded desk; if it has none, do not add one. No people, or at most a hand pulling the curtain.",
        referenciasExtra: ["10_plegado_real.jpg", "11_bisagra_plegado.jpg", "07_render_plegado.jpg"],
        controlCalidad:
          "In this scene the board must be folded flat and vertical against the glass, hanging DOWN from the hinges, with the suction cups at the TOP (above the board). Reject if the suction cups are at the bottom.",
      },
    },
  },
};

export function getProductSpec(slug: string): ProductSpec | undefined {
  return productSpecs[slug];
}
