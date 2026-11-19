/**
 * Registro de eventos del recorrido.
 *
 * Etapa 1: los eventos solo se muestran en la consola del navegador y se guardan
 * en memoria (window.__glasspotEvents) para poder revisarlos.
 * Etapa 3: esta misma función enviará los eventos al backend propio.
 *
 * REGLA: nunca incluir email, teléfono ni otros datos personales en los eventos.
 */

export type EventName =
  | "page_view"
  | "product_selected"
  | "camera_opened"
  | "photo_captured"
  | "photo_submitted"
  | "image_generation_started"
  | "image_generation_completed"
  | "image_generation_failed"
  | "perception_question_answered"
  | "contact_form_started"
  | "contact_submitted"
  | "subscription_consent_given"
  | "usage_slide_viewed"
  | "usage_in_my_space_requested"
  | "usage_generation_completed"
  | "usage_generation_failed"
  | "price_viewed"
  | "reserve_clicked"
  | "reserve_declined"
  | "waitlist_opened"
  | "model3d_viewed"
  | "experience_started"
  | "price_direct_clicked"
  | "reservation_form_opened"
  | "reservation_submitted"
  | "other_solutions_clicked";

type EventProps = Record<string, string | number | boolean | undefined>;

export type TrackedEvent = {
  name: EventName;
  sessionId: string;
  timestamp: string;
  campaign: Record<string, string>;
  props: EventProps;
};

const SESSION_KEY = "glasspot_session_id";
const CAMPAIGN_KEY = "glasspot_campaign";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

let memorySessionId: string | null = null;
let memoryCampaign: Record<string, string> | null = null;

function safeGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Algunos navegadores internos bloquean sessionStorage: seguimos en memoria.
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getSessionId(): string {
  if (memorySessionId) return memorySessionId;
  const stored = safeGet(SESSION_KEY);
  memorySessionId = stored ?? newId();
  if (!stored) safeSet(SESSION_KEY, memorySessionId);
  return memorySessionId;
}

/** Guarda los parámetros UTM de la primera página visitada en la sesión. */
export function getCampaign(): Record<string, string> {
  if (memoryCampaign) return memoryCampaign;
  const stored = safeGet(CAMPAIGN_KEY);
  if (stored) {
    try {
      memoryCampaign = JSON.parse(stored) as Record<string, string>;
      return memoryCampaign;
    } catch {
      // continúa y vuelve a leer la URL
    }
  }
  const params = new URLSearchParams(window.location.search);
  const campaign: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) campaign[key] = value.slice(0, 100);
  }
  memoryCampaign = campaign;
  safeSet(CAMPAIGN_KEY, JSON.stringify(campaign));
  return campaign;
}

declare global {
  interface Window {
    __glasspotEvents?: TrackedEvent[];
  }
}

export function track(name: EventName, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  const event: TrackedEvent = {
    name,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    campaign: getCampaign(),
    props,
  };
  window.__glasspotEvents = window.__glasspotEvents ?? [];
  window.__glasspotEvents.push(event);
  // eslint-disable-next-line no-console
  console.info(`[Glasspot Lab · evento] ${name}`, event);
}
