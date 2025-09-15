import { SessionResponseType } from "@/types";

/**
 * Busca todos os produtos da API
 * @returns Promise<ProductsType> Lista de produtos
 */


export async function getSessions(): Promise<SessionResponseType> {
  const response = await fetch(
    "https://white-nocodb.5zd9ii.easypanel.host/api/v2/tables/mqkij0gcrubxslp/records?limit=1000&shuffle=0&offset=0",
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'xc-token': process.env.NEXT_PUBLIC_DB_TOKEN || ''
      },
    }
  );

  const { list, pageInfo } = await response.json() as SessionResponseType;

  return {
    list,
    pageInfo
  };
}