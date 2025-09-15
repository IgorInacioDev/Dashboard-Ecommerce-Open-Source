'use client'

import React from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  // Middleware é responsável por proteger rotas e redirecionar.
  // Este wrapper deve apenas fornecer providers (se houver) e renderizar children.
  return <>{children}</>
}