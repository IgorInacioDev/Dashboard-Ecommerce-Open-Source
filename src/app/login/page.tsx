'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        // Cookie httpOnly é setado pelo servidor; não usar localStorage
        const redirectTo = searchParams?.get('redirect') || '/'
        router.replace(redirectTo)
        router.refresh()
      } else {
        setError(data.message || 'Credenciais inválidas')
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0),radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:20px_20px,40px_40px]"></div>
      
      <Card className="w-full max-w-md relative z-10 bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Acesso Administrativo
          </CardTitle>
          <CardDescription className="text-gray-300">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Acesso restrito apenas para administradores autorizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}