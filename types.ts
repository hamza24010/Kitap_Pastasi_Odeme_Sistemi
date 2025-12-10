export enum Category {
  COFFEE = 'Kahve',
  TEA = 'Çay',
  DESSERT = 'Tatlı',
  BOOK = 'Kitap & Dergi',
  SNACK = 'Atıştırmalık'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description?: string;
  image?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Table {
  id: number;
  name: string;
  isOccupied: boolean;
  orders: CartItem[];
  openedAt?: string; // ISO Date string
}

export type Page = 'dashboard' | 'pos' | 'menu' | 'settings';
