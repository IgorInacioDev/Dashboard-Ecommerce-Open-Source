import { NextResponse } from 'next/server'
import { signJwt } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  // TODO: validar credenciais
  const token = await signJwt({ sub: 'user-id', email })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
  return res
}