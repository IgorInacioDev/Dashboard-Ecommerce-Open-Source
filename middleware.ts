import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth';

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/products', '/orders', '/sessions'];

// Rotas públicas (não requerem autenticação)
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Lê o token do cookie httpOnly `session`
  const token = request.cookies.get('session')?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await verifyJwt(token);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Se estiver em rota pública e já autenticado, redireciona para a home
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Tratar a raiz como rota protegida
  if (pathname === '/') {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Para rotas protegidas, exigir autenticação
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Garantir que o middleware rode apenas nas rotas do app e não em assets estáticos ou APIs
export const config = {
  matcher: [
    // Excluir Next assets, imagens otimizadas, favicon e logo
    '/((?!_next/static|_next/image|favicon.ico|logo.*|api/).*)',
  ],
};