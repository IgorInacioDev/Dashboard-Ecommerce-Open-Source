'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

interface UserData {
  username: string;
  loginTime: number;
  sessionTimeout: number;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Páginas que não precisam de autenticação
  const publicRoutes = ['/login'];

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Se a rota atual é pública, não precisa verificar autenticação
        if (publicRoutes.includes(pathname)) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const authToken = sessionStorage.getItem('authToken');
        const userDataStr = sessionStorage.getItem('userData');

        if (!authToken || !userDataStr) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const userData: UserData = JSON.parse(userDataStr);
        const currentTime = Date.now();
        const timeElapsed = currentTime - userData.loginTime;

        // Verificar se a sessão ainda é válida
        if (timeElapsed >= userData.sessionTimeout) {
          // Sessão expirada, limpar dados
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('userData');
          sessionStorage.setItem('logoutMessage', 'Sessão expirada. Faça login novamente');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Dados corrompidos, considerar como não autenticado
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();

    // Verificar periodicamente se a sessão ainda é válida
    const interval = setInterval(checkAuth, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    // Se é uma rota pública e o usuário está autenticado, redirecionar para dashboard
    if (publicRoutes.includes(pathname) && isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    // Se não é uma rota pública e o usuário não está autenticado, redirecionar para login
    if (!publicRoutes.includes(pathname) && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se é uma rota pública, sempre renderizar
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Se não é uma rota pública e não está autenticado, não renderizar (redirecionamento em andamento)
  if (!publicRoutes.includes(pathname) && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;