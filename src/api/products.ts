import { CreateProductType, NocoOrderDataType, OrdersResponseType, ProductsType, ProductType } from "@/types";

export async function getProducts(): Promise<ProductsType> {
  const response = await fetch("https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/m6bx9e2675jbfye/records?limit=1000&shuffle=0&offset=0", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
    },
  });

  const data = await response.json();
  const products: ProductsType = data.list || [];

  return products;
}

export async function createProduct(prodcy: CreateProductType): Promise<ProductType> {
  const response = await fetch(`https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/m6bx9e2675jbfye/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
    },
    body: JSON.stringify(prodcy)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erro ${response.status}: ${errorData.message || 'Falha ao criar produto'}`);
  }

  const data = await response.json();
  const product: ProductType = data || {};

  return product;
}

// Interface para estatísticas de vendas por meio de pagamento
interface SalesStatsByPaymentMethod {
  [paymentMethod: string]: number;
}

// Funcionalidade de métricas de pagamento removida
// Será implementada no futuro

export async function getRecentOrders(): Promise<OrdersResponseType> {
  const response = await fetch("https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/mrbykjyi8cgcwng/records?sort=-Id&limit=100&shuffle=0&offset=0", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
    },
  });

  const { list, pageInfo } = await response.json() as OrdersResponseType;
  return {
    list,
    pageInfo,
  };
}

// Interface para métricas de vendas
export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  weeklySales: number;
  retentionRate: number;
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
  const response = await fetch("https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/mrbykjyi8cgcwng/records?sort=-Id&limit=1000&shuffle=0&offset=0", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
    },
  });

  const { list } = await response.json() as OrdersResponseType;
  
  // Calcular métricas
  let totalSales = 0;
  const totalOrders = list.length;
  let weeklySales = 0;
  let completedOrders = 0;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  list.forEach(order => {
    // Converter de centavos para reais
    const orderAmount = (Number(order.amount) || 0) / 100;
    const orderDate = new Date(order.CreatedAt || order.paid_at || '');
    
    // Somar ao total de vendas (todos os pedidos)
    totalSales += orderAmount;
    
    // Vendas totais (apenas pedidos pagos conforme requisitos)
    if (order.status === 'paid') {
      completedOrders++;
    }
    
    // Vendas da semana (apenas pedidos pagos)
    if (orderDate >= oneWeekAgo && order.status === 'paid') {
      weeklySales += orderAmount;
    }
  });
  
  console.log('Total de vendas (getSalesMetrics):', totalSales);
  console.log('Pedidos pagos:', completedOrders);
  console.log('Vendas semanais:', weeklySales);
  
  // Taxa de retenção (pedidos completados / total de pedidos)
  const retentionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  
  return {
    totalSales: Math.round(totalSales),
    totalOrders,
    weeklySales: Math.round(weeklySales),
    retentionRate
  };
}

// Interface para dados de receita mensal
export interface WeeklyRevenueData {
  day: string;
  paid: number;
  pending: number;
}

export interface MonthlyRevenueData {
  month: string;
  paid: number;
  pending: number;
}

// Nova função para dados dos últimos 7 dias
export async function getWeeklyRevenue(): Promise<WeeklyRevenueData[]> {
  const response = await fetch("https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/mrbykjyi8cgcwng/records?sort=-Id&limit=1000&shuffle=0&offset=0", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
    },
  });

  const { list } = await response.json() as OrdersResponseType;

  // Filtrar pedidos dos últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Agrupar pedidos por dia dos últimos 7 dias
  const dailyData: { [key: string]: { paid: number; pending: number } } = {};
  
  // Inicializar todos os dias dos últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    dailyData[dayKey] = { paid: 0, pending: 0 };
  }
  
  let totalSales = 0;
  
  list.forEach(order => {
    const orderDate = new Date(order.CreatedAt || order.paid_at || '');
    
    // Verificar se o pedido está nos últimos 7 dias
    if (orderDate >= sevenDaysAgo) {
      const dayKey = orderDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      // Converter de centavos para reais
      const orderValue = (Number(order.amount) || 0) / 100;
      
      // Somar ao total de vendas
      totalSales += orderValue;
      
      if (dailyData[dayKey]) {
        // Classificar por status conforme requisitos
        if (order.status === 'paid') {
          dailyData[dayKey].paid += orderValue;
        } else if (order.status === 'waiting_payment') {
          dailyData[dayKey].pending += orderValue;
        }
      }
    }
  });

  console.log('Total de vendas (últimos 7 dias):', totalSales);
  console.log('Dados diários processados:', dailyData);

  // Converter para array e manter ordem cronológica
  const result: WeeklyRevenueData[] = Object.entries(dailyData)
    .map(([day, data]) => ({
      day,
      paid: Math.round(data.paid),
      pending: Math.round(data.pending)
    }));

  return result;
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  const response = await fetch("https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/mrbykjyi8cgcwng/records?sort=-Id&limit=1000&shuffle=0&offset=0", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
    },
  });

  const { list } = await response.json() as OrdersResponseType;

  // Group orders by month
  const monthlyData: { [key: string]: { paid: number; pending: number } } = {};
  
  let totalSales = 0;
  
  list.forEach(order => {
    const orderDate = new Date(order.CreatedAt || order.paid_at || '');
    const monthKey = orderDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    // Converter de centavos para reais
    const orderValue = (Number(order.amount) || 0) / 100;
    
    // Somar ao total de vendas
    totalSales += orderValue;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { paid: 0, pending: 0 };
    }
    
    // Classificar por status conforme requisitos
    if (order.status === 'paid') {
      monthlyData[monthKey].paid += orderValue;
    } else if (order.status === 'waiting_payment') {
      monthlyData[monthKey].pending += orderValue;
    }
  });

  console.log('Total de vendas (mensal):', totalSales);

  // Convert to array and sort by date
  const result: MonthlyRevenueData[] = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: month.split(' ')[0], // Get only month name
      paid: Math.round(data.paid),
      pending: Math.round(data.pending)
    }))
    .sort((a, b) => {
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

  return result;
}
