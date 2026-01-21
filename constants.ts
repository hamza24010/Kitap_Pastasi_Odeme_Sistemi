import { Category, Product, Table } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Türk Kahvesi',
    price: 60,
    category: Category.COFFEE,
    description: 'Geleneksel lezzet, lokum ile servis edilir.',
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: '2',
    name: 'Latte',
    price: 85,
    category: Category.COFFEE,
    description: 'Yumuşak içim, bol sütlü.',
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: '3',
    name: 'Demleme Çay',
    price: 25,
    category: Category.TEA,
    description: 'Rize turist çayı, ince belli bardakta.',
    image: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: '4',
    name: 'Sebastian Cheesecake',
    price: 140,
    category: Category.DESSERT,
    description: 'Akışkan kıvamlı, yanında çikolata sosu ile.',
    image: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: '5',
    name: 'Çikolatalı Kruvasan',
    price: 90,
    category: Category.SNACK,
    description: 'Tereyağlı, taze fırından.',
    image: 'https://picsum.photos/200/200?random=5'
  },
  {
    id: '6',
    name: 'Dünya Klasikleri Seti',
    price: 250,
    category: Category.BOOK,
    description: 'Kahve yanında okumalık seçilmiş klasikler.',
    image: 'https://picsum.photos/200/200?random=6'
  }
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Masa ${i + 1}`,
  isOccupied: false,
  orders: [],
  type: 'table',
  section: i < 6 ? 'indoor' : 'outdoor'
}));
