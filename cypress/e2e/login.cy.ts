/// <reference types="cypress" />

describe('Login flow', () => {
  it('redirects to login, authenticates and lands on dashboard', () => {
    cy.viewport(1280, 800)

    // Limpeza robusta da sessão (servidor) — não afeta o cookie do browser diretamente
    cy.request({ method: 'DELETE', url: '/api/auth/login', failOnStatusCode: false })

    // Visitar qualquer rota do domínio para obter o contexto correto e limpar cookie httpOnly no browser
    cy.visit('/')
    cy.clearCookie('session')
    cy.getCookie('session').should('not.exist')

    // Agora visitar rota PROTEGIDA para forçar redirecionamento do middleware
    cy.visit('/orders')

    // Deve ser redirecionado para /login com redirect=/orders
    cy.location('pathname', { timeout: 15000 }).should('include', '/login')
    cy.location('search').should('include', 'redirect=%2Forders')

    cy.intercept('POST', '/api/auth/login').as('login')

    // Preencher credenciais válidas
    cy.get('#email').type('admin@teste.com')
    cy.get('#password').type('Linkedin34$')

    cy.contains('button', /entrar/i).click()

    // Verificar resposta do login
    cy.wait('@login', { timeout: 20000 })
      .its('response.statusCode')
      .should('eq', 200)

    // Cookie de sessão deve existir após o login
    cy.getCookie('session', { timeout: 15000 }).should('exist')

    // Intercepta carregamento de dados da página de pedidos para sincronizar navegação
    cy.intercept('GET', '/api/orders*').as('orders')

    // Deve redirecionar automaticamente para a rota alvo (/orders)
    cy.location('pathname', { timeout: 15000 }).should('eq', '/orders')

    // Aguarda a tabela de pedidos carregar (confirma que a página realmente montou)
    cy.wait('@orders', { timeout: 20000 })

    // Verificar elemento do layout (Navbar) presente após login
    cy.contains(/sair/i, { timeout: 15000 }).should('be.visible')
  })
})