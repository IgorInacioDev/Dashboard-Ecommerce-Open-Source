import { OrdersResponseType, NocoOrderDataType } from "@/types";

/**
 * Busca pedidos recentes da API
 * @returns Promise<NocoOrderDataType[]> Lista de pedidos recentes
 */
export async function getRecentOrders(): Promise<NocoOrderDataType[]> {
  try {
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
    const orders: NocoOrderDataType[] = data.list || [];

    // Ordena por data de criação (mais recentes primeiro)
    const sortedOrders = orders.sort((a, b) => {
      const dateA = new Date(a.CreatedAt).getTime();
      const dateB = new Date(b.CreatedAt).getTime();
      return dateB - dateA;
    });

    return sortedOrders;
  } catch (error) {
    console.error('Erro ao buscar pedidos recentes:', error);
    return [];
  }
}