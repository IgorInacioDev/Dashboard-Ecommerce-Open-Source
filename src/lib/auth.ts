import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function signJwt(payload: Record<string, unknown>, expiresInSeconds = 3600) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  return await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret)
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
  return payload
}