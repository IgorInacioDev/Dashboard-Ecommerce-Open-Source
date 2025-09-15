import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const token = /(?:^|; )session=([^;]+)/.exec(cookie)?.[1]
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const user = await verifyJwt(token)
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}