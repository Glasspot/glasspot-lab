import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="text-2xl font-light tracking-tight">No encontramos esta página.</h1>
      <div className="mt-8">
        <ButtonLink href="/" variant="secundario">Volver al inicio</ButtonLink>
      </div>
    </div>
  );
}
