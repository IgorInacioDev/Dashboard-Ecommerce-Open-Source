"use client"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error('app/global-error boundary captured', { digest: error.digest, message: error.message, stack: error.stack })
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen grid place-items-center bg-background text-foreground p-8">
          <div className="max-w-xl text-center space-y-4">
            <h2 className="text-2xl font-bold">Erro fatal na aplicação</h2>
            <p className="text-muted-foreground">{error.message || "Ocorreu um erro inesperado."}</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => reset()}>Tentar novamente</Button>
              <Button asChild variant="outline">
                <Link href="/">Voltar para a Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}