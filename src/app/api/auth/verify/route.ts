import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar JWT
    const payload = await verifyJwt(token)
    const email = payload.email as string | undefined

    if (!email) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Autenticado',
        user: { email }
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Não autenticado' },
      { status: 401 }
    )
  }
}