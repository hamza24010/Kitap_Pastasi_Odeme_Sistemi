import json
import os
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict

# Constants
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
TABLES_FILE = os.path.join(DATA_DIR, 'tables.json')

@dataclass
class Product:
    id: str
    name: str
    price: float
    category: str
    description: str = ""
    image: str = ""

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(data):
        return Product(**data)

@dataclass
class CartItem:
    productId: str
    productName: str
    price: float
    quantity: int

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(data):
        return CartItem(**data)

@dataclass
class Table:
    id: int
    name: str
    isOccupied: bool
    orders: List[CartItem]
    openedAt: Optional[str] = None

    def to_dict(self):
        data = asdict(self)
        data['orders'] = [item.to_dict() for item in self.orders]
        return data

    @staticmethod
    def from_dict(data):
        orders = [CartItem.from_dict(item) for item in data.get('orders', [])]
        return Table(
            id=data['id'],
            name=data['name'],
            isOccupied=data['isOccupied'],
            orders=orders,
            openedAt=data.get('openedAt')
        )

# Initial Data
INITIAL_PRODUCTS = [
    Product("1", "Türk Kahvesi", 50.0, "Kahve", "Geleneksel Türk Kahvesi"),
    Product("2", "Çay", 20.0, "Çay", "Taze Demleme Çay"),
    Product("3", "Cheesecake", 90.0, "Tatlı", "Limonlu Cheesecake"),
]

INITIAL_TABLES = [
    Table(i, f"Masa {i}", False, []) for i in range(1, 13)
]

class StorageService:
    @staticmethod
    def ensure_data_dir():
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)

    @staticmethod
    def load_products() -> List[Product]:
        StorageService.ensure_data_dir()
        if not os.path.exists(PRODUCTS_FILE):
            StorageService.save_products(INITIAL_PRODUCTS)
            return INITIAL_PRODUCTS

        try:
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return [Product.from_dict(item) for item in data]
        except Exception as e:
            print(f"Error loading products: {e}")
            return INITIAL_PRODUCTS

    @staticmethod
    def save_products(products: List[Product]):
        StorageService.ensure_data_dir()
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
            json.dump([p.to_dict() for p in products], f, ensure_ascii=False, indent=2)

    @staticmethod
    def load_tables() -> List[Table]:
        StorageService.ensure_data_dir()
        if not os.path.exists(TABLES_FILE):
            StorageService.save_tables(INITIAL_TABLES)
            return INITIAL_TABLES

        try:
            with open(TABLES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return [Table.from_dict(item) for item in data]
        except Exception as e:
            print(f"Error loading tables: {e}")
            return INITIAL_TABLES

    @staticmethod
    def save_tables(tables: List[Table]):
        StorageService.ensure_data_dir()
        with open(TABLES_FILE, 'w', encoding='utf-8') as f:
            json.dump([t.to_dict() for t in tables], f, ensure_ascii=False, indent=2)
