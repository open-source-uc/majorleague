import Link from "next/link";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Página no encontrada</h1>
      <p className="text-md text-foreground mt-2 text-sm">La página que estás buscando no existe.</p>
      <Link href="/" className="text-primary-darken text-md mt-2 text-sm">
        Volver a la página principal
      </Link>
    </div>
  );
}
