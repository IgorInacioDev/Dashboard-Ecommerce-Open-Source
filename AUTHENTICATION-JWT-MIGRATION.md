# Migração de Autenticação para JWT (HS256) com `jose`

Guia objetivo para substituir a validação frágil (Base64) por JWT assinado no Middleware/Servidor, mantendo o cliente simples e seguro.

## Objetivo
- Assinar e validar tokens com HS256 (biblioteca `jose`).
- Centralizar a verificação no servidor (Middleware + rotas /api/auth/*).
- Usar cookie httpOnly para sessão (sem localStorage/sessionStorage).

## Visão Geral
- Login: emite JWT curto (ex.: 1h) e grava em cookie httpOnly `session`.
- Middleware: lê cookie, valida JWT e decide acesso/redirecionamento.
- Cliente: apenas consome estado; sem manipular token.

## 1) Dependências e Ambiente
- Instalar `jose`:
  - pnpm add jose
- Adicionar no `.env`:
  - JWT_SECRET="chave-com-32+caracteres-aleatorios"

> Nunca exponha `JWT_SECRET` no cliente; use apenas no servidor.

## 2) Utilitário de Autenticação (src/lib/auth.ts)
Implemente funções de assinatura e verificação centralizadas com `jose`.

Exemplo (resumo):

```ts
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
```

## 3) Endpoints de Autenticação (App Router)
Crie rotas em `src/app/api/auth`:

- `POST /api/auth/login`
  - Valida credenciais (stub/banco).
  - Emite JWT (ex.: `{ sub: userId, email, role }`).
  - Seta cookie httpOnly `session` (secure em produção, sameSite=lax, path=/, maxAge compatível com exp):

```ts
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
```

- `GET /api/auth/verify`
  - Lê cookie `session`, chama `verifyJwt` e retorna 200 ou 401.

```ts
import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export async function GET(req: Request) {
  const cookie = (req as any).headers.get('cookie') || ''
  const token = /(?:^|; )session=([^;]+)/.exec(cookie)?.[1]
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const user = await verifyJwt(token)
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}
```

- `POST /api/auth/logout`
  - Limpa cookie `session` (expirado):

```ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
```

## 4) Middleware Unificado (raiz do projeto)
- Mantenha apenas `middleware.ts` na raiz. Remova `src/middleware.ts` duplicado.
- Nova lógica (resumo):
  - Permitir rotas públicas: `/login`, `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`.
  - Excluir estáticos no matcher: `_next/static`, `_next/image`, `favicon.ico`, `logo.*`.
  - Se rota protegida e sem JWT válido, redirecionar para `/login?redirect=<pathname>`.
  - Se `/login` e autenticado, redirecionar para `/`.

Dica: use `verifyJwt(token)` em bloco try/catch. Não use `Buffer` e remova validação Base64.

## 5) Simplificar o AuthWrapper
- Não renderize a página de login dentro do wrapper.
- Não redirecione (`router.push`) no wrapper — isso é do Middleware.
- Opção simples: remover a verificação via fetch e deixar apenas providers/children.

## 6) Página de Login
- Ao enviar o formulário: `POST /api/auth/login`.
- Em sucesso: redirecionar para `searchParams.redirect ?? '/'`.
- Não manipular token no `localStorage`/`sessionStorage`.

## 7) Segurança de Cookies
- `httpOnly: true`, `secure: NODE_ENV==='production'`, `sameSite: 'lax'`, `path: '/'`.
- `maxAge` alinhado ao `exp` do JWT.

## 8) Testes
- Unit: `signJwt/verifyJwt` (claims, expirada, assinatura inválida).
- Ajustar testes do AuthWrapper para o novo fluxo (sem push/sem login interno).
- E2E: login, acesso a rota protegida com cookie, logout.

## 9) Checklist Rápido
- [x ] `jose` instalado e `JWT_SECRET` no `.env`
- [x ] `src/lib/auth.ts` (sign/verify) criado
- [x ] Rotas `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`
- [ ] `middleware.ts` unificado e sem Base64/Buffer
- [x ] `src/middleware.ts` removido
- [ ] AuthWrapper simplificado
- [ ] Página de login usando o endpoint e `redirect`
- [ ] Testes unitários + E2E ajustados

---

### Passo a passo das tarefas pendentes

1) Unificar `middleware.ts` (raiz) e eliminar Base64/Buffer
- Abrir: `middleware.ts` (na raiz do projeto).
- Remover qualquer lógica de decodificação Base64/Buffer.
- Importar o verificador do servidor: `import { verifyJwt } from '@/lib/auth'`.
- Ler o cookie com a API do Next: `const token = request.cookies.get('session')?.value`.
- Regras:
  - Rotas públicas: `/login`, `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`.
  - Excluir estáticos no matcher: `/_next/static`, `/_next/image`, `/favicon.ico`, `/logo.*`.
  - Se rota protegida e sem JWT válido, redirecionar para `/login?redirect=<pathname>`.
  - Se acessar `/login` com sessão válida, redirecionar para `/`.
- Validação (manual):
  - Não autenticado em `/` -> redireciona para `/login?redirect=/`.
  - Login bem-sucedido -> vai para `/`.
  - Autenticado abrindo `/login` -> redireciona para `/`.
  - Acesso a rotas públicas e assets não deve ser bloqueado.

2) Simplificar `AuthWrapper`
- Abrir: `src/components/AuthWrapper.tsx`.
- Remover chamadas `fetch('/api/auth/verify')`, estados de loading/erro e `router.push`.
- Deixar o wrapper apenas renderizar `children` (e providers, se necessários), sem lógica de auth client-side.
- Conferir uso em `src/app/layout.tsx`: se o middleware já protege rotas, o wrapper não precisa redirecionar nem esconder layout.
- Validação (manual):
  - Com usuário logado, páginas renderizam normalmente.
  - Deslogado, o middleware faz o redirecionamento (não o wrapper).

3) Página de Login usando endpoint e `redirect`
- Abrir: `src/app/login/page.tsx`.
- Obter `redirect` dos `searchParams` (ex.: `const redirect = searchParams.get('redirect') ?? '/'`).
- No submit:
  - `await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })`.
  - Em sucesso: `router.replace(redirect)`; não salvar token no storage.
  - Exibir mensagens de erro amigáveis em caso de falha (401/400).
- Validação (manual):
  - Acessar `/login?redirect=/orders`; após login, cair em `/orders`.
  - Sem `redirect`, cair em `/`.

4) Testes unitários + E2E ajustados
- Unitários (Vitais):
  - `src/lib/auth.ts`: testes para `signJwt/verifyJwt` (claims válidas, expirada, assinatura inválida).
  - `AuthWrapper`: garantir que apenas renderiza `children` e não redireciona.
- E2E (Cypress):
  - Login: preencher credenciais -> sucesso -> redireciono para rota alvo.
  - Rota protegida sem cookie: redireciona para `/login`.
  - Logout: `POST /api/auth/logout` limpa cookie e volta a bloquear rotas protegidas.
- Rodar localmente:
  - `pnpm test` (unitários devem passar).
  - `pnpm cy:open` ou `pnpm cy:run` para E2E.

Dica: após cada etapa, sempre validar com o servidor de desenvolvimento (`pnpm dev`) e navegar para confirmar os fluxos descritos.

## 10) Considerações
- Em produção, implemente verificação real de credenciais, rate limiting e auditoria.
- Se preferir sessões server-side, considere `iron-session` (alternativa a JWT), mas `jose` é ideal no Middleware.