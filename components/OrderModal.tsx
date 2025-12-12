import React, { useState, useMemo } from 'react';
import { Table, Product, Category } from '../types';
import { TransferModal } from './TransferModal';
import { X, Plus, Minus, Trash2, CreditCard, Search, BookOpen, ArrowRightLeft } from 'lucide-react';

interface OrderModalProps {
  table: Table;
  tables?: Table[];
  products: Product[];
  onClose: () => void;
  onUpdateTable: (updatedTable: Table) => void;
  onPayment?: (revenue: number, items: number) => void;
  onTransfer?: (sourceId: number, targetId: number) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ table, tables, products, onClose, onUpdateTable, onPayment, onTransfer }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Calculate cart total
  const totalAmount = useMemo(() => {
    return table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [table.orders]);

  const totalItems = useMemo(() => {
    return table.orders.reduce((sum, item) => sum + item.quantity, 0);
  }, [table.orders]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddItem = (product: Product) => {
    const existingItemIndex = table.orders.findIndex(item => item.productId === product.id);
    let newOrders = [...table.orders];

    if (existingItemIndex > -1) {
      newOrders[existingItemIndex].quantity += 1;
    } else {
      newOrders.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1
      });
    }

    onUpdateTable({
      ...table,
      isOccupied: true,
      openedAt: table.isOccupied ? table.openedAt : new Date().toISOString(),
      orders: newOrders
    });
  };

  const handleRemoveItem = (productId: string, completely: boolean = false) => {
    const existingItemIndex = table.orders.findIndex(item => item.productId === productId);
    if (existingItemIndex === -1) return;

    let newOrders = [...table.orders];
    if (completely || newOrders[existingItemIndex].quantity === 1) {
      newOrders.splice(existingItemIndex, 1);
    } else {
      newOrders[existingItemIndex].quantity -= 1;
    }
    
    onUpdateTable({
      ...table,
      orders: newOrders
    });
  };

  const handlePayment = () => {
    if (!window.confirm(`Toplam ₺${totalAmount.toFixed(2)} ödeme alınarak masa kapatılacak. Onaylıyor musunuz?`)) return;
    
    if (onPayment) {
      onPayment(totalAmount, totalItems);
    }

    onUpdateTable({
      ...table,
      isOccupied: false,
      orders: [],
      openedAt: undefined
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-200">

          {/* LEFT SIDE: MENU */}
          <div className="flex-1 flex flex-col bg-stone-50 h-full overflow-hidden">
            {/* Header & Search */}
            <div className="p-4 bg-white border-b border-stone-200 shadow-sm z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  />
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-stone-500">
                  <X />
                </button>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Tümü
                </button>
                {Object.values(Category).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddItem(product)}
                    className="bg-white rounded-xl p-3 border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-left flex flex-col h-full group"
                  >
                    <div className="aspect-square w-full bg-stone-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={product.image || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-bold text-stone-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-2 flex-1">{product.description}</p>
                    <div className="font-bold text-amber-700 mt-auto">₺{product.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: CART */}
          <div className="w-full md:w-96 bg-white border-l border-stone-200 flex flex-col h-full shadow-2xl z-20">
            <div className="p-5 bg-stone-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold serif">{table.name}</h2>
                <p className="text-xs text-stone-400">Sipariş Detayı</p>
              </div>
              <div className="flex items-center gap-2">
                {onTransfer && tables && (
                    <button 
                        onClick={() => setIsTransferModalOpen(true)}
                        className="bg-stone-700 hover:bg-stone-600 p-2 rounded-lg transition-colors"
                        title="Hesabı Taşı / Birleştir"
                    >
                        <ArrowRightLeft size={20} />
                    </button>
                )}
                <button onClick={onClose} className="hover:bg-stone-700 p-2 rounded-lg transition-colors">
                    <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {table.orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
                  <BookOpen size={48} className="mb-3" />
                  <p>Henüz sipariş yok</p>
                </div>
              ) : (
                table.orders.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">{item.productName}</p>
                      <p className="text-sm text-amber-600 font-semibold">₺{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-sm">
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleAddItem(products.find(p => p.id === item.productId)!)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.productId, true)}
                      className="ml-3 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-stone-500 font-medium">Toplam Tutar</span>
                <span className="text-3xl font-bold text-stone-800 serif">₺{totalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={totalAmount === 0}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                  totalAmount === 0
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'
                }`}
              >
                <CreditCard size={20} />
                Ödeme Al & Kapat
              </button>
            </div>
          </div>
        </div>
      </div>

      {isTransferModalOpen && tables && onTransfer && (
        <TransferModal
            tables={tables}
            sourceTable={table}
            onClose={() => setIsTransferModalOpen(false)}
            onConfirm={(targetId) => {
                onTransfer(table.id, targetId);
                setIsTransferModalOpen(false);
            }}
        />
      )}
    </>
  );
};
