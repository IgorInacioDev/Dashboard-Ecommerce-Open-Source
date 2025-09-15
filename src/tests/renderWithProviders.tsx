import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import CoreProvider from '@/components/core-provider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SidebarProvider } from '@/components/ui/sidebar'

interface ProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CoreProvider>
        <SidebarProvider defaultOpen>{children}</SidebarProvider>
      </CoreProvider>
    </ThemeProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }