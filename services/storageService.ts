import { Product, Table } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TABLES } from '../constants';

const KEYS = {
  PRODUCTS: 'kitap_pastasi_products',
  TABLES: 'kitap_pastasi_tables',
  DAILY_STATS: 'kitap_pastasi_daily_stats',
};

export interface DailyStats {
  revenue: number;
  items: number;
}

const INITIAL_STATS: DailyStats = {
  revenue: 0,
  items: 0
};

export const StorageService = {
  getProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error("Failed to load products", e);
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  getTables: (): Table[] => {
    try {
      const stored = localStorage.getItem(KEYS.TABLES);
      return stored ? JSON.parse(stored) : INITIAL_TABLES;
    } catch (e) {
      console.error("Failed to load tables", e);
      return INITIAL_TABLES;
    }
  },

  saveTables: (tables: Table[]) => {
    localStorage.setItem(KEYS.TABLES, JSON.stringify(tables));
  },

  getDailyStats: (): DailyStats => {
    try {
      const stored = localStorage.getItem(KEYS.DAILY_STATS);
      return stored ? JSON.parse(stored) : INITIAL_STATS;
    } catch (e) {
      console.error("Failed to load daily stats", e);
      return INITIAL_STATS;
    }
  },

  saveDailyStats: (stats: DailyStats) => {
    localStorage.setItem(KEYS.DAILY_STATS, JSON.stringify(stats));
  }
};
