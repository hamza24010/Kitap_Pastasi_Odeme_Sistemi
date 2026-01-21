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
  isStocked?: boolean;
  stockQuantity?: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export type TableSection = 'indoor' | 'outdoor';
export type TableType = 'table' | 'person';

export interface Table {
  id: number;
  name: string;
  isOccupied: boolean;
  orders: CartItem[];
  openedAt?: string; // ISO Date string
  section?: TableSection;
  type?: TableType;
  paidAmount?: number;
}

export interface Debt {
  id: number;
  name: string;
  total_amount: number;
  remaining_amount: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export type Page = 'dashboard' | 'pos' | 'menu' | 'settings' | 'admin' | 'debt';
