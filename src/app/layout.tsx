import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Glasspot Lab",
  description:
    "Transformamos espacios desaprovechados en nuevas posibilidades.",
  // Etapa de prueba: no indexar en buscadores.
  robots: { index: false, follow: false },
  // Evita que Safari (iPhone) convierta automáticamente teléfonos, emails y
  // direcciones en enlaces, lo que altera la página antes de que cargue React.
  formatDetection: { telephone: false, email: false, address: false, date: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
