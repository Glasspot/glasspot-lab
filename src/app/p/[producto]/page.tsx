import { notFound } from "next/navigation";
import { copy } from "@/content/copy";
import { getProduct, products } from "@/content/products";
import { ButtonLink } from "@/components/Button";
import { PageViewTracker } from "@/components/PageViewTracker";
import { WaitlistBlock } from "@/components/WaitlistBlock";
import { Viewer3D } from "@/components/Viewer3D";
import { PriceLink } from "@/components/reserva/PriceLink";

export function generateStaticParams() {
  return products.filter((p) => p.activo).map((p) => ({ producto: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params;
  const p = getProduct(producto);
  return { title: p ? `${p.nombre} · Glasspot Lab` : "Glasspot Lab" };
}

// Pantalla 2 — Presentación del producto
export default async function ProductConceptPage({
  params,
}: {
  params: Promise<{ producto: string }>;
}) {
  const { producto } = await params;
  const product = getProduct(producto);
  if (!product) notFound();
  const disponible = product.estado === "disponible";

  return (
    <div className="mx-auto max-w-xl px-5">
      <PageViewTracker page="concepto" product={product.slug} />
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs uppercase tracking-[0.16em] text-gris-3">{product.nombre}</p>
        {!disponible && (
          <span className="rounded-full bg-tinta text-papel px-2.5 py-0.5 text-[10px] font-medium tracking-wide">
            Próximamente
          </span>
        )}
      </div>

      <figure className="relative rounded-2xl overflow-hidden bg-white border border-gris-1 aparecer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.concepto.src}
          alt={product.concepto.alt}
          className={
            disponible && !product.conceptoHorizontal
              ? "w-full aspect-[4/5] object-cover"
              : "w-full aspect-[4/3] object-contain p-6"
          }
        />
      </figure>

      <h1 className="mt-7 text-[26px] leading-tight sm:text-4xl font-light tracking-tight">
        {disponible ? copy.concepto.titulo : "Lo estamos terminando de diseñar."}
      </h1>
      <p className="mt-3 text-[15px] text-gris-4 leading-relaxed">{product.bajada}</p>

      {disponible ? (
        <>
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink href={`/p/${product.slug}/experiencia`}>{copy.concepto.cta}</ButtonLink>
            {product.precios.length > 0 && (
              <PriceLink slug={product.slug} />
            )}
          </div>
          {product.modelo3d && (
            <Viewer3D src={product.modelo3d} alt={`Modelo 3D de ${product.nombre}`} product={product.slug} orbita={product.orbita3d} />
          )}
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink href={`/p/${product.slug}/experiencia`}>{copy.concepto.cta}</ButtonLink>
            {product.precios.length > 0 && <PriceLink slug={product.slug} />}
            <ButtonLink href="/" variant="texto" className="self-center">
              {copy.concepto.volver}
            </ButtonLink>
          </div>
        </>
      ) : (
        <WaitlistBlock product={product} />
      )}
    </div>
  );
}
