import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Acceso privado mientras la web está en prueba (por ejemplo, para el socio).
 * Si la variable SITIO_CLAVE está configurada, el navegador pide usuario y clave
 * antes de mostrar cualquier página. Usuario: "glasspot" (o SITIO_USUARIO).
 * Sin SITIO_CLAVE la web queda abierta (en tu PC no se configura).
 */
export function proxy(request: NextRequest) {
  const clave = process.env.SITIO_CLAVE;
  if (!clave) return NextResponse.next();
  const usuario = process.env.SITIO_USUARIO || "glasspot";

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const [u, p] = atob(auth.slice(6)).split(":");
      if (u === usuario && p === clave) return NextResponse.next();
    } catch {}
  }
  return new NextResponse("Acceso restringido", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Glasspot Lab", charset="UTF-8"' },
  });
}

export const config = {
  // Todo, menos los archivos internos de Next y el ícono.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
