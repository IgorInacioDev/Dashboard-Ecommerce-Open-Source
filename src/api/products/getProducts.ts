import { ProductsType } from "@/types";

/**
 * Busca todos os produtos da API
 * @returns Promise<ProductsType> Lista de produtos
 */
export async function getProducts(): Promise<ProductsType> {
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

  const data = await response.json();
  const products: ProductsType = data.list || [];

  return products;
}