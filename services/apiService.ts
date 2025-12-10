import { Table, Product } from '../types';

const API_BASE = '/api'; // In production (Flask serving), this works. In Dev, Vite proxies it.

export interface DailySales {
  id: number;
  date: string;
  total_revenue: number;
  total_items: number;
  created_at: string;
  details?: {
    tables: Table[];
    products: Product[];
  };
}

export const ApiService = {
  async endOfDay(tables: Table[], products: Product[]) {
    const response = await fetch(`${API_BASE}/end-of-day`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tables, products }),
    });
    if (!response.ok) throw new Error('Gün sonu işlemi başarısız oldu.');
    return response.json();
  },

  async getHistory(): Promise<DailySales[]> {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) throw new Error('Geçmiş veriler alınamadı.');
    return response.json();
  },

  async getHistoryDetail(id: number): Promise<DailySales> {
    const response = await fetch(`${API_BASE}/history/${id}`);
    if (!response.ok) throw new Error('Detay verisi alınamadı.');
    return response.json();
  }
};
