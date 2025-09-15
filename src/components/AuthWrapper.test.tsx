import React from 'react'
import { render, screen } from '@/tests/renderWithProviders'
import AuthWrapper from '@/components/AuthWrapper'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: pushMock, refresh: jest.fn() }),
}))

describe('AuthWrapper', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza os children imediatamente', () => {
    render(
      <AuthWrapper>
        <div>protected content</div>
      </AuthWrapper>
    )

    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('não tenta redirecionar', () => {
    render(
      <AuthWrapper>
        <div>protected content</div>
      </AuthWrapper>
    )

    expect(pushMock).not.toHaveBeenCalled()
  })
})