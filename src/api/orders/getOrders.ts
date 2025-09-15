import { OrdersResponseType } from "@/types";

/**
 * Busca todos os pedidos da API
 * @returns Promise<OrdersResponseType> Lista de pedidos
 */
export async function getOrders(): Promise<OrdersResponseType> {
  const response = await fetch('/api/orders?limit=1000&offset=0', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: OrdersResponseType = await response.json();
  return data;
}