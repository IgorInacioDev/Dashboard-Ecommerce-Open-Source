import { CreateProductType, ProductType } from "@/types";

/**
 * Cria um novo produto na API
 * @param product Dados do produto a ser criado
 * @returns Promise<ProductType> Produto criado
 */
export async function createProduct(product: CreateProductType): Promise<ProductType> {
  console.log('Dados enviados para API:', JSON.stringify(product, null, 2));
  
  const response = await fetch(
    `https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/m6bx9e2675jbfye/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
      },
      body: JSON.stringify(product)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro da API:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(`Erro ${response.status}: ${errorData.message || errorData.msg || 'Falha ao criar produto'}`);
  }

  const data = await response.json();
  const createdProduct: ProductType = data || {};

  return createdProduct;
}