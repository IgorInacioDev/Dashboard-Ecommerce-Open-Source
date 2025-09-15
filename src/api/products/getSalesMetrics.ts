import { OrdersResponseType } from "@/types";

export interface SalesMetrics {
  totalSales: number;
  paidOrders: number;
  totalPaidSales: number;
  totalOrders: number;
  weeklySales: number;
}

/**
 * Busca métricas de vendas dos pedidos
 * @returns Promise<SalesMetrics> Métricas de vendas
 */
export async function getSalesMetrics(): Promise<SalesMetrics> {
  const response = await fetch('/api/orders?limit=1000&offset=0');

  const data: OrdersResponseType = await response.json();
  const orders = data.list || [];

  let totalSales = 0;
  let paidOrders = 0;
  let totalPaidSales = 0;
  let totalOrders = 0;
  let weeklySales = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Processa cada pedido para calcular métricas
  for (const order of orders) {
    // Converte valor de centavos para reais
    const orderAmount = (Number(order.amount) || 0) / 100;
    
    // Conta total de pedidos
    totalOrders++;
    
    // Soma todas as vendas
    totalSales += orderAmount;

    // Conta pedidos pagos
    if (order.status === "paid") {
      paidOrders++;
      totalPaidSales += orderAmount;
      
      // Calcula vendas da semana
      const orderDate = new Date(order.CreatedAt);
      if (orderDate >= oneWeekAgo) {
        weeklySales += orderAmount;
      }
    }
  }

  console.log('Total sales:', totalSales);
  console.log('Paid orders:', paidOrders);
  console.log('Weekly sales:', weeklySales);

  return { totalSales, paidOrders, totalPaidSales, totalOrders, weeklySales };
}