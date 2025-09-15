'use client'

import { Copy, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ValueModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  value: string | number | null | undefined
}

export default function ValueModal({ isOpen, onClose, title, value }: ValueModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const textToCopy = typeof value === 'string' ? value : String(value)
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const formatValue = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val, (key, value) => {
          // Handle circular references and DOM elements
          if (value && typeof value === 'object') {
            // Check for DOM elements
            if (value instanceof Element || value instanceof Node) {
              return '[DOM Element]'
            }
            // Check for circular references by looking for common React Fiber properties
            if (value.hasOwnProperty('__reactFiber$') || 
                value.hasOwnProperty('_owner') || 
                value.hasOwnProperty('stateNode')) {
              return '[Circular Reference]'
            }
          }
          return value
        }, 2)
      } catch (error) {
        // Fallback for any other circular reference errors
        return '[Object - Cannot stringify due to circular reference]'
      }
    }
    return String(val)
  }

  const formattedValue = formatValue(value)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Visualização completa do valor
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap break-words font-mono">
              {formattedValue}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCopy}
            disabled={!formattedValue}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}