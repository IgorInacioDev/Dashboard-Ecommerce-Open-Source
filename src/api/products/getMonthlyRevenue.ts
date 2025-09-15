import { OrdersResponseType } from "@/types";

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

/**
 * Busca dados de receita mensal dos pedidos
 * @returns Promise<MonthlyRevenueData[]> Dados de receita por mês
 */
export async function getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  const response = await fetch(
    "https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/m6bx9e2675jbfye/records?limit=1000&shuffle=0&offset=0",
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
      },
    }
  );

  const data: OrdersResponseType = await response.json();
  const orders = data.list || [];

  // Inicializa dados dos últimos 12 meses
  const result: MonthlyRevenueData[] = [];
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      revenue: 0
    });
  }

  // Processa pedidos para calcular receita por mês
  for (const order of orders) {
    // Converte valor de centavos para reais
    const orderValue = (Number(order.amount) || 0) / 100;
    
    if (order.status === "paid" || order.status === "waiting_payment") {
      const orderDate = new Date(order.CreatedAt);
      const monthsDiff = (today.getFullYear() - orderDate.getFullYear()) * 12 + (today.getMonth() - orderDate.getMonth());
      
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const index = 11 - monthsDiff;
        if (index >= 0 && index < result.length) {
          result[index].revenue += orderValue;
        }
      }
    }
  }

  return result;
}