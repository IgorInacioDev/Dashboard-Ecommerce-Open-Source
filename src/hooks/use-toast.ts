import { useState } from 'react'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastQueue: ToastProps[] = []
let setToasts: ((toasts: ToastProps[]) => void) | null = null

export function toast({ title, description, variant = 'default' }: ToastProps) {
  const newToast = { title, description, variant }
  toastQueue = [...toastQueue, newToast]
  
  if (setToasts) {
    setToasts([...toastQueue])
  }
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t !== newToast)
    if (setToasts) {
      setToasts([...toastQueue])
    }
  }, 3000)
}

export function useToast() {
  const [toasts, setToastsState] = useState<ToastProps[]>([])
  
  if (!setToasts) {
    setToasts = setToastsState
  }
  
  return {
    toasts,
    toast
  }
}