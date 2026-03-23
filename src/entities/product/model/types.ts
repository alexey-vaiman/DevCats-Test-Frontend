export interface Price {
  amount: number;
  currency: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  description?: string;
}

export interface Offer {
  id: string;
  price: Price;
  delivery_date: string;
  seller: Seller;
  product_id?: string;
  product?: ProductListItem;
}

export interface ProductListItem {
  id: string;
  name: string;
  thumbnail_url: string;
  price: Price;
  stock: number;
  nearest_delivery_date: string | null;
}

export interface ProductDetails {
  id: string;
  name: string;
  image_url: string;
  thumbnail_url: string;
  price: Price;
  stock: number;
  attributes: ProductAttribute[];
}
