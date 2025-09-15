import { act, renderHook } from '@testing-library/react'
import { useToast, toast as toastFn } from './use-toast'

jest.useFakeTimers()

describe('useToast', () => {
  afterEach(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('enfileira, exibe toasts e remove após timeout', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toastFn({ title: 'Hello', description: 'World' })
      toastFn({ title: 'Error', variant: 'destructive' })
    })

    // Após enfileirar, o hook deve refletir os dois toasts
    expect(result.current.toasts).toHaveLength(2)
    expect(result.current.toasts[0]).toMatchObject({ title: 'Hello', description: 'World', variant: 'default' })
    expect(result.current.toasts[1]).toMatchObject({ title: 'Error', variant: 'destructive' })

    // Antes dos 3s, ambos ainda devem existir
    act(() => {
      jest.advanceTimersByTime(2999)
    })
    expect(result.current.toasts).toHaveLength(2)

    // Ao completar 3s, ambos expiram (mesmo delay)
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current.toasts).toHaveLength(0)
  })
})