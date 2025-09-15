# 🛒 E-commerce Admin Dashboard

![coverage-badge](./coverage/badge.svg)

Um painel administrativo moderno e completo para gerenciamento de e-commerce, construído com Next.js 15, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

- 🔐 **Sistema de Autenticação Completo** - Login seguro com JWT
- 📊 **Dashboard Interativo** - Gráficos e métricas em tempo real
- 🛍️ **Gerenciamento de Produtos** - CRUD completo com upload de imagens
- 📦 **Controle de Pedidos** - Visualização e gerenciamento de orders
- 👥 **Gestão de Sessões** - Monitoramento de usuários ativos
- 📈 **Relatórios e Analytics** - Insights detalhados do negócio
- 🎨 **Interface Moderna** - Design responsivo com Shadcn/UI
- 🌙 **Tema Escuro/Claro** - Alternância de temas

## 🚀 Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Shadcn/UI + Radix UI
- **Autenticação:** JWT com cookies HTTP-only
- **Gráficos:** Recharts
- **Animações:** GSAP + Motion
- **Testes:** Jest + Testing Library + Cypress
- **Gerenciador:** pnpm

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (recomendado)

## ⚙️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ecom-admin
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais.

4. **Execute o projeto**
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔑 Credenciais de Acesso

**Email:** `admin@teste.com`  
**Senha:** `Linkedin34$`

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção
pnpm lint         # Verificação de código
pnpm test         # Testes unitários
pnpm test:watch   # Testes em modo watch
pnpm test:coverage # Cobertura de testes
pnpm cy:open      # Cypress interativo
pnpm cy:run       # Cypress headless
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 13+)
│   ├── api/            # API Routes
│   ├── dashboard/      # Dashboard pages
│   ├── login/          # Authentication
│   └── orders/         # Order management
├── components/         # React components
│   ├── ui/            # Shadcn/UI components
│   └── blocks/        # Custom blocks
├── hooks/             # Custom hooks
├── lib/               # Utilities and configs
└── types.ts           # TypeScript definitions
```

## 🧪 Testes

O projeto inclui testes unitários e E2E:

- **Unitários:** Jest + Testing Library
- **E2E:** Cypress
- **Cobertura:** Configurada para componentes críticos

## 🔒 Segurança

- ✅ Autenticação JWT com cookies HTTP-only
- ✅ Middleware de proteção de rotas
- ✅ Validação de dados com Zod
- ✅ Sanitização de inputs
- ⚠️ **Importante:** Altere as credenciais padrão em produção

## 📱 Responsividade

O dashboard é totalmente responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📟 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npx vercel
```

### Docker
```bash
docker build -t ecom-admin .
docker run -p 3000:3000 ecom-admin
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através do GitHub Issues.

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
