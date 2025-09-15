'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Clock, Shield } from 'lucide-react';
import AnimatedContent from '@/blocks/Animations/AnimatedContent/AnimatedContent';

interface UserData {
  username: string;
  loginTime: number;
  sessionTimeout: number;
}

const DashboardPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
    const authToken = sessionStorage.getItem('authToken');
    const userDataStr = sessionStorage.getItem('userData');

    if (!authToken || !userDataStr) {
      // Não autenticado, redirecionar para login
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userDataStr) as UserData;
      const currentTime = Date.now();
      const timeElapsed = currentTime - user.loginTime;
      
      // Verificar se a sessão ainda é válida
      if (timeElapsed >= user.sessionTimeout) {
        // Sessão expirada
        handleLogout('Sessão expirada. Faça login novamente');
        return;
      }

      setUserData(user);
      setSessionTimeLeft(user.sessionTimeout - timeElapsed);
      setIsLoading(false);
    } catch (error) {
      // Dados corrompidos, redirecionar para login
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!userData) return;

    // Timer para atualizar o tempo restante da sessão
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - userData.loginTime;
      const timeLeft = userData.sessionTimeout - timeElapsed;

      if (timeLeft <= 0) {
        // Sessão expirou
        handleLogout('Sessão expirada. Faça login novamente');
        return;
      }

      setSessionTimeLeft(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [userData]);

  const handleLogout = (message?: string) => {
    // Limpar dados da sessão
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    
    // Redirecionar para login com mensagem se fornecida
    if (message) {
      sessionStorage.setItem('logoutMessage', message);
    }
    
    router.push('/login');
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSessionStatus = (): { color: string; text: string } => {
    const percentageLeft = (sessionTimeLeft / (userData?.sessionTimeout || 1)) * 100;
    
    if (percentageLeft > 50) {
      return { color: 'bg-green-500', text: 'Ativa' };
    } else if (percentageLeft > 25) {
      return { color: 'bg-yellow-500', text: 'Atenção' };
    } else {
      return { color: 'bg-red-500', text: 'Expirando' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return null; // Será redirecionado
  }

  const sessionStatus = getSessionStatus();

  return (
    <div className="min-h-screen bg-background p-4">
      <AnimatedContent
        distance={200}
        direction="vertical"
        reverse={false}
        duration={1}
        initialOpacity={0}
        animateOpacity
        scale={1}
        threshold={0.1}
        delay={0}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo ao sistema de administração
              </p>
            </div>
            <Button 
              onClick={() => handleLogout()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* Cards de Informação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card do Usuário */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuário Logado</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.username}</div>
                <p className="text-xs text-muted-foreground">
                  Login realizado em {new Date(userData.loginTime).toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>

            {/* Card da Sessão */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status da Sessão</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className={`${sessionStatus.color} text-white`}>
                    {sessionStatus.text}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sessão segura ativa
                </p>
              </CardContent>
            </Card>

            {/* Card do Tempo */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Restante</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {formatTime(sessionTimeLeft)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Logout automático em caso de inatividade
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Segurança</CardTitle>
                <CardDescription>
                  Detalhes sobre a sessão atual e medidas de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tipo de Autenticação:</span>
                  <Badge variant="value">Credenciais Locais</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Timeout da Sessão:</span>
                  <span className="text-sm">60 minutos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tentativas Máximas:</span>
                  <span className="text-sm">3 tentativas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bloqueio por:</span>
                  <span className="text-sm">15 minutos</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  Gerenciar Produtos
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Visualizar Pedidos
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Relatórios
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Configurações
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Aviso de Segurança */}
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Aviso de Segurança
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Esta é uma implementação de demonstração. Em produção, utilize HTTPS, 
                    hash de senhas, proteção CSRF e outras medidas de segurança adequadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </AnimatedContent>
      </div>
  );
};

export default DashboardPage;