import { NextRequest, NextResponse } from 'next/server';
import { CreateProductType } from '@/types';
import { 
  mapAmazonToProduct, 
  validateAmazonJson, 
  AmazonProductData 
} from '@/lib/amazonJsonMapper';

// Função para criar produto via API do NocoDB
async function createProductInDB(productData: CreateProductType): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      'https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/m6bx9e2675jbfye/records',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
        },
        body: JSON.stringify(productData)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Erro ${response.status}: ${errorText}` };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amazonData } = body;
    
    if (!amazonData || !Array.isArray(amazonData)) {
      return NextResponse.json(
        { error: 'Dados do Amazon JSON são obrigatórios e devem ser um array' },
        { status: 400 }
      );
    }
    
    // Valida estrutura do JSON
    if (!validateAmazonJson(amazonData)) {
      return NextResponse.json(
        { error: 'Formato do Amazon JSON inválido. Verifique se o arquivo contém dados de produtos do Amazon.' },
        { status: 400 }
      );
    }
    
    const results = {
      total: amazonData.length,
      processed: 0,
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };
    
    console.log(`Processando ${amazonData.length} itens do Amazon JSON...`);
    
    for (let i = 0; i < amazonData.length; i++) {
      const item = amazonData[i];
      results.processed++;
      
      try {
        // Mapeia dados do Amazon para formato de produto
        const productData = mapAmazonToProduct(item);
        
        if (!productData) {
          results.skipped++;
          console.log(`Item ${i + 1} pulado: dados insuficientes`);
          continue;
        }
        
        // Cria produto no banco
        const createResult = await createProductInDB(productData);
        
        if (createResult.success) {
          results.created++;
          console.log(`Produto criado: ${productData.name}`);
        } else {
          results.errors.push(`Erro ao criar "${productData.name}": ${createResult.error}`);
        }
        
      } catch (error) {
        const errorMsg = `Erro no item ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    console.log('Importação concluída:', results);
    
    return NextResponse.json({
      message: 'Importação concluída',
      results
    });
    
  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}