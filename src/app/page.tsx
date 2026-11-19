import { copy } from "@/content/copy";
import { getActiveProducts } from "@/content/products";
import { ProductCard } from "@/components/ProductCard";
import { PageViewTracker } from "@/components/PageViewTracker";

// Pantalla 1 — Inicio
export default function HomePage() {
  const productos = getActiveProducts();
  return (
    <div className="mx-auto max-w-5xl px-5">
      <PageViewTracker page="inicio" />

      <section className="pt-6 pb-10 sm:pt-14 sm:pb-14 max-w-2xl aparecer">
        <h1 className="text-[28px] leading-[1.15] sm:text-5xl sm:leading-[1.08] font-light tracking-tight">
          {copy.inicio.titulo}
        </h1>
        <p className="mt-5 text-[16px] sm:text-lg text-gris-4 leading-relaxed">
          {copy.inicio.complemento}
        </p>
        <p className="mt-4 text-sm text-gris-3 leading-relaxed">{copy.inicio.institucional}</p>
      </section>

      <section aria-labelledby="pregunta-espacio">
        <h2 id="pregunta-espacio" className="text-lg sm:text-xl font-medium mb-4">
          {copy.inicio.pregunta}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {productos.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}
