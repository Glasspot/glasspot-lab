# Glasspot Lab — Web (Etapa 1: estructura visual y navegación)

Versión de prueba del recorrido completo del visitante. **No usa servicios pagos, no guarda datos y no usa inteligencia artificial real.** Todo el contenido que no está confirmado aparece con una etiqueta amarilla de "Provisional".

## Requisitos

- **Node.js 20.9 o superior** (recomendado: la versión LTS desde https://nodejs.org).
  Para verificarlo, abrí una terminal y escribí: `node -v`

## Cómo ejecutarlo (en tu PC)

1. Abrí una terminal en esta carpeta (`04_Web\glasspot-lab`).
   En Windows: abrí la carpeta en el Explorador, escribí `cmd` en la barra de direcciones y apretá Enter.
2. Instalá las dependencias (solo la primera vez):
   ```
   npm install
   ```
3. Iniciá el sitio:
   ```
   npm run dev
   ```
4. Abrí en el navegador: **http://localhost:3000**

Para cortar el servidor: `Ctrl + C` en la terminal.

### Probarlo desde el celular (misma red Wi-Fi)

1. En la PC, ejecutá:
   ```
   npm run celular
   ```
   (compila la versión optimizada y la publica en tu red local).
2. En la terminal aparece una línea `Network: http://192.168.x.x:3000`. Abrí esa dirección en el navegador del celular.
3. Si Windows pregunta por el firewall, permití el acceso en **redes privadas**.

El botón "Sacar una foto" usa la cámara nativa del celular, así que funciona sin HTTPS en esta prueba local.

## Cómo probar cada pantalla

| # | Pantalla | Dirección | Qué revisar |
|---|---|---|---|
| 1 | Inicio | `/` | Textos aprobados, las 2 tarjetas de producto |
| 2 | Concepto | `/p/tender` · `/p/escritorio` | Imagen conceptual, título, botón para continuar |
| 3 | Foto | `/p/escritorio/experiencia` | Cámara, galería, ejemplo, vista previa, repetir, consentimiento |
| 4 | Procesamiento | se abre al confirmar la foto | Animación de respiración, texto fijo |
| 5 | Resultado | se abre solo a los ~3,5 s | Imagen de prueba, aviso, beneficios provisionales, pregunta |
| 6 | Contacto | "Continuar" desde el resultado | Validación de email/teléfono, consentimiento, opción de omitir |
| 7 | Cierre | después del contacto | Mensaje final |
| — | Privacidad | `/privacidad` | Texto provisional |

### Atajos de prueba (agregar al final de la dirección de la experiencia)

| Parámetro | Efecto |
|---|---|
| `?paso=procesando` | Abre directo la pantalla 4 con una foto de demostración |
| `?paso=resultado` | Abre directo la pantalla 5 |
| `?paso=contacto` | Abre directo la pantalla 6 |
| `?paso=cierre` | Abre directo la pantalla 7 |
| `?simular=error` | La generación falla → mensaje de error con reintento |
| `?simular=demora` | Tarda 15 s → a los 10 s aparece "Está tardando un poco más…" y luego termina bien |
| `?simular=lento` | Supera el máximo de 30 s → error recuperable |

Se pueden combinar: `/p/tender/experiencia?paso=procesando&simular=error`

### Ver los eventos de analítica

Abrí las herramientas de desarrollo del navegador (F12 → pestaña **Consola**). Cada paso muestra una línea `[Glasspot Lab · evento] …`. También se pueden listar todos con `window.__glasspotEvents`.
Los eventos nunca incluyen el email ni el teléfono.

> En modo `npm run dev` algunos eventos aparecen duplicados: es un comportamiento normal de React en desarrollo. Con `npm run celular` no pasa.

## Estructura

```
src/
  app/                       Páginas (rutas)
    page.tsx                 Pantalla 1 — Inicio
    p/[producto]/page.tsx    Pantalla 2 — Concepto
    p/[producto]/experiencia Pantallas 3 a 7
    privacidad/              Política provisional
  components/                Piezas visuales reutilizables
    experience/              Una pieza por pantalla (foto, procesamiento, resultado, contacto, cierre)
  content/
    copy.ts                  Todos los textos (APROBADO = del brief, SUGERIDO = a revisar)
    products.ts              Productos: nombre, imágenes, beneficios, datos técnicos
  lib/
    analytics.ts             Registro de eventos (hoy: consola)
    prepareImage.ts          Reduce la foto y elimina metadatos (GPS) en el celular
    imageProvider/           Generación de imágenes: hoy simulada, en Etapa 2 la real
public/
  productos/<slug>/          Imágenes de cada producto
  demo/                      Foto de demostración para los atajos de prueba
```

## Cómo cambiar contenido

- **Textos:** `src/content/copy.ts`
- **Productos, beneficios e imágenes:** `src/content/products.ts` y `public/productos/<slug>/`
- **Agregar un producto:** sumar un objeto en `products.ts` y su carpeta de imágenes. Las pantallas se adaptan solas.

## Etapa 2 — Generación real con IA (OpenAI)

1. Copiá `.env.local.example`, renombrá la copia a `.env.local` y pegá tu clave en `OPENAI_API_KEY=`.
2. Reiniciá la web (cerrá la ventana negra y doble clic en **Iniciar Glasspot Lab**).
3. Recorré el flujo normalmente: la foto ahora se procesa con IA. Sin clave, la web sigue usando la simulación.

Cómo funciona (archivo `src/lib/server/visualizer.ts`):
1. Un modelo de visión analiza la foto (¿hay ventana?, ángulo, luz, ancho estimado). Si no hay ventana o aparecen personas, se pide otra foto.
2. El modelo de imagen recibe la foto + el kit de referencia (`referencias/escritorio/`) + la ficha técnica (`src/content/productSpecs.ts`).
3. Un control de calidad automático revisa el resultado; si no lo aprueba, reintenta una vez.

### Prueba comparativa
1. Guardá fotos de ventanas en `02_Contenido/prueba_ia/fotos_ventanas` (si sabés el ancho, ponelo en el nombre: `cocina_120cm.jpg`).
2. Con la web encendida, doble clic en **Prueba IA**.
3. Los resultados quedan en `02_Contenido/prueba_ia/resultados/<fecha>/` con un `resumen.csv`.

## Lo que NO hace esta etapa

- Sin clave de API configurada, la generación es simulada y está marcada como prueba.
- No guarda contactos ni eventos.
- No tiene panel privado (Etapa 3).
