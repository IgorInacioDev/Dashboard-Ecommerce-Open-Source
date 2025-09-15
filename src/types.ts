export type InfoSection = {
  title: string;
  content: string;
}

export type Thumbnail = {
  signedPath: string;
}

export type Thumbnails = {
  tiny: Thumbnail;
  small: Thumbnail;
  card_cover: Thumbnail;
}

export type Image = {
  path: string;
  title: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  id: string;
  thumbnails: Thumbnails;
  signedPath: string;
}

export type VideoReview = {
  id: string;
  path: string;
  title: string;
  mimetype: string;
  size: number;
  signedPath: string;
}

export type ProductType = {
  Id: number;
  name: string;
  CreatedAt: string;
  UpdatedAt: string;
  reviews: object;
  original_price: number | null | undefined;
  sale_price: number;
  colors: ProductColor[] | null;
  description: string;
  info_sections: InfoSection[];
  Images: Image[];
  video_reviews: VideoReview[] | null;
  orders: number;
  _nc_m2m_orders_products: {
    products_id: number;
    orders_id: number;
    products: ProductType;
  }[];
}

export type CreateProductType = {
  name: string;
  original_price: number;
  sale_price: number;
  colors: ProductColor[] | null;
  description: string;
  info_sections: InfoSection[];
  Images: Image[];
  video_reviews: string[] | null;
}

export type ProductListResponse = {
  list: ProductType[];
  pageInfo: {
    totalRows: number;
    page: number; 
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  }
}

export type ProductsType = ProductType[];


// Tipos para thumbnails de imagens
export type ImageThumbnail = {
  signedPath: string;
};

export type ImageThumbnails = {
  tiny: ImageThumbnail;
  small: ImageThumbnail;
  card_cover: ImageThumbnail;
};

// Tipo para imagens de produtos
export type ProductImage = {
  id: string;
  path: string;
  title: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  thumbnails: ImageThumbnails;
  signedPath: string;
};

// Tipo para seções de informações do produto
export type ProductInfoSection = {
  title: string;
  content: string;
};

// Tipo para cores/variações do produto
export type ProductColor = {
  title: string; // nome da cor (ex: "Amora", "Rosa Malva", "Coral")
  hex: string; // código hexadecimal da cor (ex: "#8B4A6B", "#C67B8A")
};

// Tipo para produto
export type Product = {
  orders: number;
  Id: number;
  name: string;
  CreatedAt: string;
  UpdatedAt: string;
  reviews: unknown | null;
  original_price: number;
  sale_price: number | null;
  colors: ProductColor[] | null;
  description: string;
  info_sections: ProductInfoSection[];
  Images: ProductImage[];
  video_reviews: unknown | null;
};

// Tipo para usuário
export type User = {
  orders: number;
  Id: number;
  name: string;
  CreatedAt: string;
  UpdatedAt: string;
  email: string;
  password_hash: string;
  phone: string | null;
};

export type NocoOrderMetadataCustomerFormData = {
  email: string;
  name: string;
  phone: string;
  saveInfo: boolean;
}

export type NocoOrderMetadataCustomer = {
  formData: NocoOrderMetadataCustomerFormData;
}

export type NocoOrderMetadataOrder = {
  timestamp: string;
  source: string;
  version: string;
}

export type NocoOrderMetadata = {
  order: NocoOrderMetadataOrder;
  customer: NocoOrderMetadataCustomer;
}

export type NocoOrderDataType = {
  Id: number,
  tenant_id: string;
  company_id: number;
  amount: number;
  currency: string;
  authorization_code: string | null;
  base_price: number | null;
  external_ref: string;
  installments: number;
  interest_rate: number | null;
  ip: string;
  paid_amount: number;
  paid_at: string | null;
  payment_method: string;
  postback_url: string | null;
  redirect_url: string | null;
  refunded_amount: number;
  refunded_at: string | null;
  refused_reason: string | null;
  return_url: string | null;
  secure_id: string;
  CreatedAt: string;
  UpdatedAt: string | null;
  secure_url: string;
  status: string;
  traceable: boolean;
  metadata: string | NocoOrderMetadata;
  customer_id: number;
  billing_address_id: number;
  shipping_address_id: number;
}

// Tipo para o retorno da API de todas as ordens
export type OrdersResponseType = {
  list: NocoOrderDataType[];
  pageInfo: {
    totalRows: number,
    page: number,
    pageSize: number,
    isFirstPage: boolean,
    isLastPage: boolean
  }
}

// Tipos relacionados a cartões de crédito foram removidos
// Funcionalidade será implementada no futuro

export type SessionDataType = {
  status: boolean,
  ip: string,
  utm_source: string,
  utm_campaign: string,
  utm_medium: string,
  utm_content: string,
  utm_term: string,
  lastPage: string,
  createOrder: boolean,
  deviceType: 'Desktop' | 'Iphone' | 'Android',
  fingerPrint: string,
  metadata: string,
  CreatedAt?: Date,
  UpdatedAt?: Date
}

// Tipo para o retorno da API de todas as ordens
export type SessionResponseType = {
  list: SessionDataType[];
  pageInfo: {
    totalRows: number,
    page: number,
    pageSize: number,
    isFirstPage: boolean,
    isLastPage: boolean
  }
}