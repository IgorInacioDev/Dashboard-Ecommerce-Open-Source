import { NextRequest, NextResponse } from 'next/server';

interface Order {
  Id: string;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
  paid_at: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('API Orders: Iniciando requisição');
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    
    console.log('API Orders: Fazendo fetch para NocoDB');
    const response = await fetch(
      `https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/mrbykjyi8cgcwng/records?sort=-UpdatedAt,-CreatedAt&limit=${limit}&shuffle=0&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
        },
      }
    );

    console.log('API Orders: Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Orders: Dados obtidos:', data?.list?.length || 0, 'registros');
    
    // Debug: log dos primeiros registros para verificar UpdatedAt
    if (data?.list?.length > 0) {
      console.log('API Orders: Primeiros 3 registros:');
      data.list.slice(0, 3).forEach((order: Order, index: number) => {
        console.log(`Registro ${index + 1}:`, {
          Id: order.Id,
          status: order.status,
          CreatedAt: order.CreatedAt,
          UpdatedAt: order.UpdatedAt,
          paid_at: order.paid_at
        });
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de pedidos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}