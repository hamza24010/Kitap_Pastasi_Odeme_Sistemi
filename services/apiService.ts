import { Table, Product, CartItem, Debt } from '../types';

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
  async endOfDay(tables: Table[], products: Product[], total_revenue: number, total_items: number) {
    const response = await fetch(`${API_BASE}/end-of-day`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tables,
        products,
        total_revenue,
        total_items
      }),
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
  },

  async getDebts(): Promise<Debt[]> {
    const response = await fetch(`${API_BASE}/debts`);
    if (!response.ok) throw new Error('Borç listesi alınamadı.');
    return response.json();
  },

  async createDebt(name: string, total_amount: number, items: CartItem[]) {
    const response = await fetch(`${API_BASE}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, total_amount, items })
    });
    if (!response.ok) throw new Error('Borç kaydı oluşturulamadı.');
    return response.json();
  },

  async payDebt(id: number, amount: number) {
    const response = await fetch(`${API_BASE}/debts/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    if (!response.ok) throw new Error('Ödeme kaydedilemedi.');
    return response.json();
  }
};
