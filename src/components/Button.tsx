import Link from "next/link";

type Variant = "primario" | "secundario" | "texto";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-12 px-6";

const variants: Record<Variant, string> = {
  primario: "bg-tinta text-papel hover:bg-gris-4 w-full",
  secundario: "border border-tinta text-tinta hover:bg-gris-1 w-full",
  texto: "text-gris-4 underline underline-offset-4 hover:text-tinta min-h-10 px-2",
};

type CommonProps = { variant?: Variant; className?: string; children: React.ReactNode };

export function Button({
  variant = "primario",
  className = "",
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primario",
  className = "",
  children,
  onClick,
}: CommonProps & { href: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
