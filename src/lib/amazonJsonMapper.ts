import { CreateProductType } from '@/types';

// Interface para os dados do Amazon JSON
export interface AmazonProductData {
  'a-size-base'?: string;
  'a-size-base-plus'?: string;
  's-image src'?: string;
  'a-offscreen'?: string;
  'a-price-whole'?: string;
  'a-price-fraction'?: string;
  'a-link-normal href'?: string;
  'a-size-small'?: string;
  'a-icon-alt'?: string;
  'a-size-small (2)'?: string;
  'a-badge-text'?: string;
  'a-size-base (2)'?: string;
  [key: string]: string | undefined;
}

/**
 * Extrai preço do formato brasileiro e converte para centavos
 * @param priceStr String do preço (ex: "R$ 181,01")
 * @returns Preço em centavos
 */
export function extractPrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove "R$" e outros caracteres, mantém apenas números, vírgula e ponto
  const cleanPrice = priceStr.replace(/[^\d,\.]/g, '');
  
  // Converte vírgula para ponto (formato brasileiro para americano)
  const normalizedPrice = cleanPrice.replace(',', '.');
  
  const price = parseFloat(normalizedPrice);
  
  // Converte para centavos
  return isNaN(price) ? 0 : Math.round(price * 100);
}

/**
 * Extrai rating das estrelas
 * @param ratingStr String do rating (ex: "4,6 de 5 estrelas")
 * @returns Rating numérico
 */
export function extractRating(ratingStr: string): number {
  if (!ratingStr) return 0;
  
  const match = ratingStr.match(/([\d,]+)/);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  
  return 0;
}

/**
 * Extrai número de avaliações
 * @param reviewStr String das avaliações (ex: "(279)" ou "(14,5 mil)")
 * @returns Número de avaliações
 */
export function extractReviewCount(reviewStr: string): number {
  if (!reviewStr) return 0;
  
  // Remove parênteses
  const clean = reviewStr.replace(/[()]/g, '');
  
  // Verifica se tem "mil"
  if (clean.includes('mil')) {
    const num = parseFloat(clean.replace(/[^\d,]/g, '').replace(',', '.'));
    return Math.round(num * 1000);
  }
  
  // Número normal
  const num = parseInt(clean.replace(/[^\d]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Gera slug a partir do nome do produto
 * @param name Nome do produto
 * @returns Slug formatado
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

/**
 * Detecta categoria do produto baseado no nome
 * @param name Nome do produto
 * @returns Categoria detectada
 */
export function detectCategory(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('body splash') || nameLower.includes('perfume') || nameLower.includes('fragrance')) {
    return 'Perfumes e Fragrâncias';
  }
  
  if (nameLower.includes('victoria') && nameLower.includes('secret')) {
    return 'Victoria\'s Secret';
  }
  
  if (nameLower.includes('maquiagem') || nameLower.includes('makeup')) {
    return 'Maquiagem';
  }
  
  if (nameLower.includes('cuidados') || nameLower.includes('skincare')) {
    return 'Cuidados Pessoais';
  }
  
  return 'Geral';
}

/**
 * Mapeia dados do Amazon JSON para o formato CreateProductType
 * @param amazonData Dados do produto do Amazon JSON
 * @returns Produto formatado ou null se dados insuficientes
 */
export function mapAmazonToProduct(amazonData: AmazonProductData): CreateProductType | null {
  // Verifica se tem dados essenciais
  const name = amazonData['a-size-base-plus'] || amazonData['a-size-base'];
  const imageUrl = amazonData['s-image src'];
  
  if (!name || name.trim().length === 0) {
    return null; // Pula itens sem nome
  }
  
  // Pula itens que são apenas headers ou navegação
  if (name.includes('Resultados') || name.includes('Consulte as páginas')) {
    return null;
  }
  
  // Extrai preços
  const priceWhole = amazonData['a-price-whole'] || '';
  const priceFraction = amazonData['a-price-fraction'] || '00';
  const fullPriceStr = `${priceWhole}${priceFraction}`;
  
  const originalPrice = extractPrice(amazonData['a-offscreen'] || fullPriceStr);
  
  // Se não conseguir extrair preço, pula o item
  if (originalPrice === 0) {
    return null;
  }
  
  const salePrice = originalPrice; // Por padrão, mesmo preço
  
  // Extrai informações adicionais
  const rating = extractRating(amazonData['a-icon-alt'] || '');
  const reviewCount = extractReviewCount(amazonData['a-size-small (2)'] || '');
  const category = detectCategory(name);
  
  // Cria descrição rica baseada nos dados disponíveis
  let description = `${name}\n\n`;
  
  if (category !== 'Geral') {
    description += `**Categoria:** ${category}\n`;
  }
  
  if (rating > 0) {
    description += `**Avaliação:** ${rating} de 5 estrelas\n`;
  }
  
  if (reviewCount > 0) {
    description += `**Número de avaliações:** ${reviewCount.toLocaleString('pt-BR')}\n`;
  }
  
  if (amazonData['a-size-base (2)']) {
    description += `**Popularidade:** ${amazonData['a-size-base (2)']}\n`;
  }
  
  if (amazonData['a-badge-text']) {
    description += `**Status:** ${amazonData['a-badge-text']}\n`;
  }
  
  description += `\n**Produto importado do Amazon Brasil**`;
  
  // Cria imagem se disponível
  const images = imageUrl ? [{
    id: Math.random().toString(36).substr(2, 9),
    path: imageUrl,
    title: name,
    mimetype: 'image/jpeg',
    size: 0,
    width: 0,
    height: 0,
    thumbnails: {
      tiny: { signedPath: imageUrl },
      small: { signedPath: imageUrl },
      card_cover: { signedPath: imageUrl }
    },
    signedPath: imageUrl
  }] : [];
  
  // Cria seções de informação
  const infoSections = [
    {
      title: "Descrição do Produto",
      content: description
    }
  ];
  
  // Adiciona link do Amazon se disponível
  if (amazonData['a-link-normal href']) {
    infoSections.push({
      title: "Link Original",
      content: `Produto original: ${amazonData['a-link-normal href']}`
    });
  }
  
  return {
    name: name.trim(),
    description: description.trim(),
    original_price: originalPrice,
    sale_price: salePrice,
    colors: null, // Amazon JSON não tem informações de cor estruturadas
    info_sections: infoSections,
    Images: images,
    video_reviews: null
  };
}

/**
 * Valida se o JSON do Amazon tem a estrutura esperada
 * @param data Dados para validar
 * @returns true se válido
 */
export function validateAmazonJson(data: unknown): data is AmazonProductData[] {
  if (!Array.isArray(data)) {
    return false;
  }
  
  // Verifica se pelo menos alguns itens têm a estrutura esperada
  const validItems = data.filter(item => 
    typeof item === 'object' && 
    item !== null &&
    (item['a-size-base-plus'] || item['a-size-base'])
  );
  
  return validItems.length > 0;
}

/**
 * Processa array completo do Amazon JSON
 * @param amazonData Array de dados do Amazon
 * @returns Array de produtos válidos
 */
export function processAmazonJson(amazonData: AmazonProductData[]): CreateProductType[] {
  const products: CreateProductType[] = [];
  
  for (const item of amazonData) {
    const product = mapAmazonToProduct(item);
    if (product) {
      products.push(product);
    }
  }
  
  return products;
}