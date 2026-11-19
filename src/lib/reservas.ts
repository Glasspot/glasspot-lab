import type { Recorrido } from "@/lib/journey";
import { getCampaign, getSessionId, track } from "@/lib/analytics";

/**
 * Registro de una reserva gratuita del precio de lanzamiento.
 * NO es una venta: es un registro calificado (vio el precio, manifestó interés
 * en comprar a ese precio y dejó un contacto válido).
 *
 * Etapa 3: `registrarReserva` enviará este objeto a la base de datos.
 * Hoy solo registra el evento, SIN datos personales.
 */
export type ReservaRegistro = {
  producto: string;
  precio: number;
  moneda: string;
  variantePrecio: number;
  recorrido: Recorrido;
  usoExperiencia: boolean;
  nombre?: string;
  email?: string;
  telefono?: string;
  consentimientoProducto: boolean;
  consentimientoPromociones: boolean;
  versionConsentimiento: string;
  fecha: string; // ISO
  origen: Record<string, string>; // UTM de la campaña, si los hay
  sesion: string;
};

export const CONSENT_VERSION_RESERVA = "2026-11-18";

export function armarRegistro(
  datos: Omit<ReservaRegistro, "fecha" | "origen" | "sesion" | "versionConsentimiento">,
): ReservaRegistro {
  return {
    ...datos,
    versionConsentimiento: CONSENT_VERSION_RESERVA,
    fecha: new Date().toISOString(),
    origen: getCampaign(),
    sesion: getSessionId(),
  };
}

export async function registrarReserva(r: ReservaRegistro): Promise<void> {
  // Etapa 1: el contacto no se guarda ni se envía. Solo el evento, sin datos personales.
  track("reservation_submitted", {
    product: r.producto,
    price: r.precio,
    variant: r.variantePrecio,
    path: r.recorrido,
    used_experience: r.usoExperiencia,
    has_email: !!r.email,
    has_phone: !!r.telefono,
    has_name: !!r.nombre,
    promo_consent: r.consentimientoPromociones,
    consent_version: r.versionConsentimiento,
  });
}
