"use client"

import { NocoOrderDataType } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

// Função para calcular tempo relativo
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const createdAt = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s atrás`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  }
};

// Função para formatar valor monetário
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100); // Converte de centavos para reais
};

// Função para formatar status
const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'paid': 'Pago',
    'waiting_payment': 'Aguardando Pagamento',
    'refused': 'Recusado',
    'refunded': 'Reembolsado'
  };
  return statusMap[status] || status;
};

// Funcionalidade de métodos de pagamento removida - será implementada no futuro

export const ordersColumns: ColumnDef<NocoOrderDataType>[] = [
  {
    accessorKey: "Id",
    header: "ID",
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return formatCurrency(amount);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const formattedStatus = formatStatus(status);
      
      // Definir cores baseadas no status
      let bgColor = "bg-gray-100";
      let textColor = "text-gray-800";
      
      if (status === "paid") {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
      } else if (status === "waiting_payment") {
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
      } else if (status === "refused") {
        bgColor = "bg-red-100";
        textColor = "text-red-800";
      }
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
          {formattedStatus}
        </span>
      );
    },
  },
  {
    accessorKey: "installments",
    header: "Parcelas",
  },
  {
    accessorKey: "external_ref",
    header: "Referência Externa",
  },
  {
    accessorKey: "CreatedAt",
    header: "Criado em",
    cell: ({ row }) => {
      const dateValue = row.getValue("CreatedAt") as string;
      return getTimeAgo(dateValue);
    },
  },
]