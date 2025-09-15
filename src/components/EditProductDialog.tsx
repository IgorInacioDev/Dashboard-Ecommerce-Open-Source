"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProductType } from "@/types"
import { Loader2 } from "lucide-react"

interface UpdatedProductData {
  Id: string;
  [key: string]: string | number | boolean;
}

interface EditProductDialogProps {
  product: ProductType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated?: () => void
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onProductUpdated
}: EditProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_price: "",
    sale_price: "",
    colors: "",
    images: ""
  })

  // Preenche o formulário quando o produto muda
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        original_price: product.original_price ? (product.original_price / 100).toString() : "",
        sale_price: product.sale_price ? (product.sale_price / 100).toString() : "",
        colors: product.colors ? JSON.stringify(product.colors, null, 2) : "",
        images: product.Images ? product.Images.map(img => img.path || img.signedPath).join('\n') : ""
      })
    }
  }, [product])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsLoading(true)

    try {
      // Preparar dados modificados
      const updatedData: UpdatedProductData = {
        Id: product.Id.toString()
      }

      // Verificar quais campos foram modificados
      if (formData.name !== (product.name || "")) {
        updatedData.name = formData.name
      }
      
      if (formData.description !== (product.description || "")) {
        updatedData.description = formData.description
      }
      
      const originalPriceInCents = product.original_price || 0
      const newOriginalPriceInCents = Math.round(parseFloat(formData.original_price || "0") * 100)
      if (newOriginalPriceInCents !== originalPriceInCents) {
        updatedData.original_price = newOriginalPriceInCents
      }
      
      const salePriceInCents = product.sale_price || 0
      const newSalePriceInCents = Math.round(parseFloat(formData.sale_price || "0") * 100)
      if (newSalePriceInCents !== salePriceInCents) {
        updatedData.sale_price = newSalePriceInCents
      }

      // Verificar se colors foi modificado
      const currentColors = product.colors ? JSON.stringify(product.colors, null, 2) : ""
      if (formData.colors !== currentColors) {
        try {
          updatedData.colors = JSON.parse(formData.colors || "[]")
        } catch (e) {
          alert("Formato JSON inválido para cores")
          return
        }
      }

      // Verificar se images foi modificado
      const currentImages = product.Images ? product.Images.map(img => img.path || img.signedPath).join('\n') : ""
      if (formData.images !== currentImages) {
        const imageUrls = formData.images.split('\n').filter(url => url.trim())
        updatedData['Images' as keyof UpdatedProductData] = JSON.stringify(imageUrls.map(url => ({ path: url.trim() })))
      }

      // Se não há modificações, não fazer requisição
      if (Object.keys(updatedData).length === 1) {
        alert("Nenhuma modificação detectada")
        return
      }

      // Fazer requisição PATCH
      const response = await fetch(
        `https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/m6bx9e2675jbfye/records`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
          },
          body: JSON.stringify(updatedData)
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto')
      }

      alert('Produto atualizado com sucesso!')
      onOpenChange(false)
      onProductUpdated?.()
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      alert('Erro ao atualizar produto')
    } finally {
      setIsLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Edite as informações do produto #{product.Id}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do produto"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição do produto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="original_price">Preço Original (R$)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => handleInputChange('sale_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="colors">Cores (JSON)</Label>
              <Textarea
                id="colors"
                value={formData.colors}
                onChange={(e) => handleInputChange('colors', e.target.value)}
                placeholder='[{"title": "Azul", "hex": "#0000FF"}]'
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="images">URLs das Imagens (uma por linha)</Label>
              <Textarea
                id="images"
                value={formData.images}
                onChange={(e) => handleInputChange('images', e.target.value)}
                placeholder="https://exemplo.com/imagem1.jpg"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}