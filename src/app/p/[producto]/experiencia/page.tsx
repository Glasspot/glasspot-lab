import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/content/products";
import { Experience } from "@/components/experience/Experience";

export function generateStaticParams() {
  return products.filter((p) => p.activo && p.estado === "disponible").map((p) => ({ producto: p.slug }));
}

// Pantallas 3 a 7 — Foto, procesamiento, resultado, contacto y cierre
export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ producto: string }>;
}) {
  const { producto } = await params;
  const product = getProduct(producto);
  if (!product || product.estado !== "disponible") notFound();
  return (
    <Suspense fallback={null}>
      <Experience slug={product.slug} />
    </Suspense>
  );
}
