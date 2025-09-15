"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProductType } from "@/types"
import Image from "next/image"
import { useState } from "react"
import { EditProductDialog } from "@/components/EditProductDialog"

// Função para obter tempo relativo
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mês atrás`;
  return `${Math.floor(diffInSeconds / 31536000)}a atrás`;
};

// Função para formatar preço
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return 'N/A';
  // Converte de centavos para reais dividindo por 100
  const priceInReais = price / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(priceInReais);
};

// Função para obter URL da imagem
const getImageUrl = (product: ProductType): string => {
  if (!product.Images || product.Images.length === 0) {
    return '/logo.svg'; // imagem padrão
  }
  
  const firstImage = product.Images[0];
  const basePath = firstImage.signedPath || firstImage.path;
  
  if (!basePath) {
    return '/logo.svg';
  }
  
  // Se já é uma URL completa, retorna como está
  if (basePath.startsWith('http://') || basePath.startsWith('https://')) {
    return basePath;
  }
  
  // Se é um caminho relativo, constrói a URL completa
  const baseUrl = 'https://white-nocodb.5zd9ii.easypanel.host';
  return `${baseUrl}/${basePath}`;
};

export const createProductsColumns = (onEditProduct: (product: ProductType) => void): ColumnDef<ProductType>[] => [
  {
    accessorKey: "Id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("Id") as number;
      return <span className="font-mono text-sm">#{id}</span>;
    },
  },
  {
    accessorKey: "Images",
    header: "Imagem",
    cell: ({ row }) => {
      const product = row.original;
      const imageUrl = getImageUrl(product);
      return (
        <div className="w-12 h-12 relative rounded-md overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nome do Produto",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="max-w-[200px]">
          <span className="font-medium truncate block" title={name}>
            {name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "original_price",
    header: "Preço Original",
    cell: ({ row }) => {
      const price = row.getValue("original_price") as number;
      return (
        <span className={price ? "line-through text-gray-500" : "text-gray-400"}>
          {formatPrice(price)}
        </span>
      );
    },
  },
  {
    accessorKey: "sale_price",
    header: "Preço de Venda",
    cell: ({ row }) => {
      const price = row.getValue("sale_price") as number;
      return (
        <span className="font-semibold text-green-600">
          {formatPrice(price)}
        </span>
      );
    },
  },
  {
    id: "discount",
    header: "Desconto",
    cell: ({ row }) => {
      const originalPrice = row.getValue("original_price") as number;
      const salePrice = row.getValue("sale_price") as number;
      const product = row.original;
      
      const handleClick = () => {
        onEditProduct(product);
      };
      
      if (!originalPrice || !salePrice || originalPrice <= salePrice) {
        return (
          <span 
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleClick}
          >
            0%
          </span>
        );
      }
      
      const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      
      return (
        <span 
          className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium cursor-pointer hover:bg-red-200 transition-colors"
          onClick={handleClick}
        >
          {discountPercent}%
        </span>
      );
    },
  },
  {
    accessorKey: "orders",
    header: "Pedidos",
    cell: ({ row }) => {
      const orders = row.getValue("orders") as number;
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {orders || 0}
        </span>
      );
    },
  },
  {
    accessorKey: "colors",
    header: "Cores",
    cell: ({ row }) => {
      let colors = row.getValue("colors") as ProductType['colors'];
      
      // Se colors é uma string JSON, fazer parse
      if (typeof colors === 'string') {
        try {
          colors = JSON.parse(colors);
        } catch (e) {
          return <span className="text-gray-400">Sem cores</span>;
        }
      }
      
      // Verificar se colors é válido e é um array
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        return <span className="text-gray-400">Sem cores</span>;
      }
      
      return (
        <div className="flex gap-1">
          {colors.slice(0, 3).map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color.hex }}
              title={color.title}
            />
          ))}
          {colors.length > 3 && (
            <span className="text-xs text-gray-500 ml-1">+{colors.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "CreatedAt",
    header: "Criado em",
    cell: ({ row }) => {
      const dateValue = row.getValue("CreatedAt") as string;
      return getTimeAgo(dateValue);
    },
  },
];