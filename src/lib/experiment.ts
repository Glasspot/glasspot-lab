/**
 * Test A/B de precio: cada sesión recibe al azar una de las variantes de precio
 * del producto y la mantiene mientras dure la sesión.
 */

import type { Product } from "@/content/products";

export function getPriceVariant(product: Product): { index: number; precio: number } | null {
  if (!product.precios.length) return null;
  const key = `glasspot_precio_${product.slug}`;
  let index: number | null = null;
  try {
    const stored = window.sessionStorage.getItem(key);
    if (stored !== null) index = Number(stored);
  } catch {
    // sin sessionStorage: se elige igual, solo para esta vista
  }
  if (index === null || !Number.isInteger(index) || index < 0 || index >= product.precios.length) {
    index = Math.floor(Math.random() * product.precios.length);
    try {
      window.sessionStorage.setItem(key, String(index));
    } catch {}
  }
  return { index, precio: product.precios[index] };
}
