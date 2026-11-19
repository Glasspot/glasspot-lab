/**
 * Etiqueta para contenido no definitivo.
 * Decisión 15/11/2026: en la web pública NO se muestran (se ven poco profesionales).
 * Solo se muestra con `forzar` (ej.: resultado simulado cuando no hay IA configurada).
 */
export function ProvisionalTag({
  children = "Provisional",
  className = "",
  forzar = false,
}: {
  children?: React.ReactNode;
  className?: string;
  forzar?: boolean;
}) {
  if (!forzar) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}
