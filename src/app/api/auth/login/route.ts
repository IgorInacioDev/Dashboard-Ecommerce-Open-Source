import { NextRequest, NextResponse } from 'next/server'
import { signJwt } from '@/lib/auth'

// Credenciais de exemplo - em produção, isso deveria vir de um banco de dados
const ADMIN_CREDENTIALS = {
  email: 'admin@teste.com',
  password: 'Linkedin34$'
}

// Token JWT (assinado com HS256 via jose)
async function generateToken(email: string): Promise<string> {
  // 24 horas
  return await signJwt({ email }, 24 * 60 * 60)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar credenciais
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = await generateToken(email)

    // Criar resposta com cookie seguro
    const response = NextResponse.json(
      { 
        message: 'Login realizado com sucesso',
        // Não retornamos token no corpo por ser httpOnly
        user: { email }
      },
      { status: 200 }
    )

    // Definir cookie de sessão httpOnly
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para logout
export async function DELETE() {
  const response = NextResponse.json(
    { message: 'Logout realizado com sucesso' },
    { status: 200 }
  )

  // Remover cookie de sessão
  response.cookies.delete('session')

  return response
}