'use client'

import { useQuery } from "@tanstack/react-query";
import { ordersColumns } from "./columns";
import { DataTable } from "./data-table";
import { OrdersResponseType } from "@/types";
import { getOrders } from "@/api/orders/getOrders";

export default function AppOrdersDataTable() {
  const { data, isLoading, error } = useQuery<OrdersResponseType>({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#FDF9EF]">Carregando pedidos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Erro ao carregar pedidos</div>
      </div>
    )
  }

  const orders = data?.list ? 
    [...data.list].sort((a, b) => {
      // Considera tanto CreatedAt quanto UpdatedAt, priorizando o mais recente
      const createdA = new Date(a.CreatedAt || 0);
      const createdB = new Date(b.CreatedAt || 0);
      
      // Se UpdatedAt existe e é válido, usa ele, senão usa CreatedAt
      const updatedA = a.UpdatedAt && a.UpdatedAt !== null ? new Date(a.UpdatedAt) : createdA;
      const updatedB = b.UpdatedAt && b.UpdatedAt !== null ? new Date(b.UpdatedAt) : createdB;
      
      // Pega a data mais recente entre criação e atualização para cada pedido
      const mostRecentA = Math.max(createdA.getTime(), updatedA.getTime());
      const mostRecentB = Math.max(createdB.getTime(), updatedB.getTime());
      
      return mostRecentB - mostRecentA; // Mais recente primeiro
    }) : [];

  return (
    <div>
      <DataTable columns={ordersColumns} data={orders} />
    </div>
  );
}