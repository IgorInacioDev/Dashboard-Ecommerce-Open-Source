import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground">A rota solicitada não existe.</p>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}