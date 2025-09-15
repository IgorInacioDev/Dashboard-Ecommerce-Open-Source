import { OrdersResponseType } from "@/types";

export interface WeeklyRevenueData {
  day: string;
  paid: number;
  pending: number;
}

/**
 * Busca dados de receita semanal dos pedidos
 * @returns Promise<WeeklyRevenueData[]> Dados de receita por dia da semana
 */
export async function getWeeklyRevenue(): Promise<WeeklyRevenueData[]> {
  const response = await fetch('/api/orders?limit=1000&offset=0');

  const data: OrdersResponseType = await response.json();
  const orders = data.list || [];

  // Inicializa dados dos últimos 7 dias
  const result: WeeklyRevenueData[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    result.push({
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      paid: 0,
      pending: 0
    });
  }

  // Processa pedidos para calcular receita por dia
  for (const order of orders) {
    // Converte valor de centavos para reais
    const orderValue = (Number(order.amount) || 0) / 100;
    const orderDate = new Date(order.CreatedAt);
    const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff < 7) {
      const index = 6 - daysDiff;
      if (index >= 0 && index < result.length) {
        if (order.status === "paid") {
          result[index].paid += orderValue;
        } else if (order.status === "waiting_payment") {
          result[index].pending += orderValue;
        }
      }
    }
  }

  return result;
}