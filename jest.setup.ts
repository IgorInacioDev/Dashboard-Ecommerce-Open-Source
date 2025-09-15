import '@testing-library/jest-dom'
import React from 'react'

// Ensure global.fetch exists so tests can spy/mockeresolve it
if (!(global as any).fetch) {
  ;(global as any).fetch = jest.fn()
}

// Provide a controllable window.location to prevent JSDOM navigation errors
// and allow tests/components to set window.location.href safely.
const mockLocation = {
  href: 'http://localhost/',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  origin: 'http://localhost',
  pathname: '/',
  search: '',
  hash: '',
} as any
Object.defineProperty(window, 'location', {
  configurable: true,
  writable: true,
  value: mockLocation,
})

// Mock next/image to avoid errors in Jest environment
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

// Basic mock for matchMedia used in hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }
  },
})