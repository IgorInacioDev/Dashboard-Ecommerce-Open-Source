import { NextRequest, NextResponse } from 'next/server';
import { CreateProductType } from '@/types';

interface CSVProduct {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  'Variant Price': string;
  'Variant Compare At Price': string;
  'Image Src': string;
  'Option1 Value': string;
  'Cor (product.metafields.shopify.color-pattern)': string;
  'Tonalidade da maquiagem (product.metafields.shopify.makeup-color-shade)': string;
  'Variant Inventory Qty': string;
  Status: string;
}

interface ImportResult {
  success: boolean;
  created: number;
  errors: string[];
  details: {
    productName: string;
    status: 'success' | 'error';
    error?: string;
  }[];
}

// Função para converter preço de string para centavos
function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr.trim() === '') return 0;
  const price = parseFloat(priceStr.replace(',', '.'));
  return Math.round(price * 100); // Converter para centavos
}

// Função para extrair cores do CSV
function extractColors(colorStr: string, shadeStr: string): { title: string; hex: string }[] {
  const colors: { title: string; hex: string }[] = [];
  
  if (colorStr && colorStr.trim() !== '') {
    const colorNames = colorStr.split(';').map(c => c.trim()).filter(c => c !== '');
    colorNames.forEach(colorName => {
      colors.push({
        title: colorName,
        hex: '#000000' // Cor padrão, pode ser ajustada
      });
    });
  }
  
  if (shadeStr && shadeStr.trim() !== '') {
    const shadeNames = shadeStr.split(';').map(s => s.trim()).filter(s => s !== '');
    shadeNames.forEach(shadeName => {
      if (!colors.find(c => c.title === shadeName)) {
        colors.push({
          title: shadeName,
          hex: '#000000' // Cor padrão
        });
      }
    });
  }
  
  return colors;
}

// Função para processar imagens
function processImages(imageSrc: string): { path: string; title: string; mimetype: string; size: number; width: number; height: number; id: string; thumbnails: { tiny: { signedPath: string }; small: { signedPath: string }; card_cover: { signedPath: string } }; signedPath: string }[] {
  if (!imageSrc || imageSrc.trim() === '') return [];
  
  return [{
    path: imageSrc,
    title: 'Product Image',
    mimetype: 'image/jpeg',
    size: 0,
    width: 0,
    height: 0,
    id: Math.random().toString(36).substr(2, 9),
    thumbnails: {
      tiny: { signedPath: imageSrc },
      small: { signedPath: imageSrc },
      card_cover: { signedPath: imageSrc }
    },
    signedPath: imageSrc
  }];
}

// Função para criar produto via API do NocoDB
async function createProductInDB(productData: CreateProductType): Promise<boolean> {
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
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return false;
  }
}

// Função para processar CSV e agrupar variantes por produto
function processCSVData(csvData: CSVProduct[]): Map<string, CSVProduct[]> {
  const productGroups = new Map<string, CSVProduct[]>();
  
  csvData.forEach(row => {
    const handle = row.Handle;
    if (!handle || handle.trim() === '') return;
    
    if (!productGroups.has(handle)) {
      productGroups.set(handle, []);
    }
    productGroups.get(handle)!.push(row);
  });
  
  return productGroups;
}

export async function POST(request: NextRequest) {
  try {
    const { csvData } = await request.json();
    
    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { error: 'Dados CSV inválidos' },
        { status: 400 }
      );
    }
    
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      details: []
    };
    
    // Agrupar dados por produto (Handle)
    const productGroups = processCSVData(csvData);
    
    // Processar cada produto
    for (const [handle, variants] of productGroups) {
      try {
        const mainVariant = variants[0]; // Primeira variante contém dados principais
        
        // Pular se não tiver título ou estiver inativo
        if (!mainVariant.Title || mainVariant.Status !== 'active') {
          continue;
        }
        
        // Extrair cores de todas as variantes
        const allColors: { title: string; hex: string }[] = [];
        variants.forEach(variant => {
          if (variant['Option1 Value'] && variant['Option1 Value'].trim() !== '') {
            const colorName = variant['Option1 Value'];
            if (!allColors.find(c => c.title === colorName)) {
              allColors.push({
                title: colorName,
                hex: '#000000' // Cor padrão
              });
            }
          }
        });
        
        // Adicionar cores dos metafields
        const metafieldColors = extractColors(
          mainVariant['Cor (product.metafields.shopify.color-pattern)'] || '',
          mainVariant['Tonalidade da maquiagem (product.metafields.shopify.makeup-color-shade)'] || ''
        );
        
        metafieldColors.forEach(color => {
          if (!allColors.find(c => c.title === color.title)) {
            allColors.push(color);
          }
        });
        
        const productData: CreateProductType = {
          name: mainVariant.Title,
          description: mainVariant['Body (HTML)'] || '',
          original_price: parsePrice(mainVariant['Variant Compare At Price'] || mainVariant['Variant Price']),
          sale_price: parsePrice(mainVariant['Variant Price']),
          colors: allColors.length > 0 ? allColors : null,
          info_sections: [],
          Images: processImages(mainVariant['Image Src']),
          video_reviews: null
        };
        
        const success = await createProductInDB(productData);
        
        if (success) {
          result.created++;
          result.details.push({
            productName: mainVariant.Title,
            status: 'success'
          });
        } else {
          result.errors.push(`Erro ao criar produto: ${mainVariant.Title}`);
          result.details.push({
            productName: mainVariant.Title,
            status: 'error',
            error: 'Falha na criação do produto'
          });
        }
        
      } catch (error) {
        const errorMsg = `Erro ao processar produto ${handle}: ${error}`;
        result.errors.push(errorMsg);
        result.details.push({
          productName: handle,
          status: 'error',
          error: errorMsg
        });
      }
    }
    
    result.success = result.errors.length === 0;
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}