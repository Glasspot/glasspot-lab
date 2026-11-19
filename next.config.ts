import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permite abrir el servidor de desarrollo desde un celular en la misma red Wi-Fi
  // (direcciones privadas habituales). Solo afecta a `npm run dev`.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  // Las fotos de referencia de los productos se leen del disco en el servidor:
  // hay que incluirlas en el paquete que se publica (Vercel).
  outputFileTracingIncludes: {
    "/api/visualizar": ["./referencias/**/*"],
  },
};

export default nextConfig;
