import { notFound } from "next/navigation";
import { getProduct, products } from "@/content/products";
import { DirectPrice } from "@/components/reserva/DirectPrice";

export function generateStaticParams() {
  return products
    .filter((p) => p.activo && p.estado === "disponible" && p.precios.length > 0)
    .map((p) => ({ producto: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params;
  const p = getProduct(producto);
  return { title: p ? `Precio de lanzamiento · ${p.nombre} · Glasspot Lab` : "Glasspot Lab" };
}

// Camino B — precio de lanzamiento y reserva directa
export default async function PrecioPage({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params;
  const product = getProduct(producto);
  if (!product || product.estado !== "disponible" || !product.precios.length) notFound();
  return <DirectPrice slug={product.slug} />;
}
