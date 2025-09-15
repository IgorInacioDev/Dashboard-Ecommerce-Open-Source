'use client'

import { Copy, Check, Eye, EyeClosed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JSX, useState } from "react"
import { CellWithCopyProps } from "../interface/interfaces"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CellWithCopy({ value, columnId }: CellWithCopyProps) {
  const [copied, setCopied] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Agora recebemos o valor bruto diretamente
  const actualValue = value;

  // Função para converter valor para string de forma segura
  const getStringValue = (val: string | number | boolean | null | undefined | object): string => {
    if (val === null || val === undefined) {
      return 'N/A';
    }
    
    if (typeof val === 'string') {
      return val;
    }
    
    if (typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
    
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val, null, 2);
      } catch (error) {
        return 'Objeto complexo - não é possível exibir';
      }
    }
    
    return String(val);
  };

  // Função para formatar metadata de forma legível
  const formatMetadata = (val: string | number | boolean | null | undefined | object): JSX.Element => {
    if (val === null || val === undefined) {
      return <span>N/A</span>;
    }
    
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object' && parsed !== null) {
          return (
            <div className="space-y-2">
              {Object.entries(parsed).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[120px]">
                    {key}:
                  </span>
                  <span className="text-gray-600 break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          );
        }
      } catch (error) {
        // Se não conseguir fazer parse, exibir como string normal
      }
      return <span className="break-all">{val}</span>;
    }
    
    if (typeof val === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(val).map(([key, value]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[120px]">
                {key}:
              </span>
              <span className="text-gray-600 break-all">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span className="break-all">{String(val)}</span>;
  };

  // Verifica se o campo é 'Metadata' para aplicar cor vermelha
  const isLongField = columnId === 'Metadata' || columnId === 'metadata' || columnId === 'fingerPrint' || columnId === 'fingerPrint'
  const isStatusField = columnId === 'status' || columnId === 'createOrder' || columnId?.toLowerCase().includes('status')

  const handleCopy = async () => {
    try {
      const textToCopy = getStringValue(actualValue as string | number | boolean | object | null | undefined)
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const displayValue = typeof actualValue === 'string' && actualValue.length > 40 
    ? actualValue.substring(0, 20) + '...'
    : actualValue

  const shouldShowModal = typeof actualValue === 'string' && actualValue.length > 40

  // Para outros valores, mantém o comportamento original
  return (
    <>
      <div>
        {isStatusField ? (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  (actualValue === true || actualValue === 'true' || actualValue === 1 || actualValue === '1' || actualValue === "true" || actualValue === "1" || String(actualValue).toLowerCase() === 'true')
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        ) : isLongField ? (
          <div className="flex items-center justify-between group">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes da Sessão</DialogTitle>
                  <DialogDescription>
                    Visualização completa do campo {columnId}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg text-sm text-gray-800 max-h-96 overflow-y-auto">
                    {columnId === 'metadata' || columnId === 'Metadata' ? 
                      formatMetadata(actualValue as string | number | boolean | object | null | undefined) :
                      <pre className="font-mono whitespace-pre-wrap break-all">
                        {getStringValue(actualValue as string | number | boolean | object | null | undefined)}
                      </pre>
                    }
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleCopy}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <button
              className={`flex-1 text-left ${isLongField ? 'text-red-500' : ''} ${shouldShowModal ? 'cursor-pointer hover:underline' : ''}`}
              onClick={() => shouldShowModal && setModalOpen(true)}
            >
              {String(displayValue)}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>


    </>
  )
}