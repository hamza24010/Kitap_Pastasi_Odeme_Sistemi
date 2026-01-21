import React, { useState, useMemo } from 'react';
import { Table, Product, Category, CartItem } from '../types';
import { TransferModal } from './TransferModal';
import { X, Plus, Minus, Trash2, CreditCard, Search, BookOpen, ArrowRightLeft, UserMinus, Package, CheckSquare, Square } from 'lucide-react';

interface OrderModalProps {
  table: Table;
  tables?: Table[];
  products: Product[];
  onClose: () => void;
  onUpdateTable: (updatedTable: Table) => void;
  onPayment?: (revenue: number, items: number) => void;
  onTransfer?: (sourceId: number, targetId: number) => void;
  onStockUpdate?: (productId: string, qtyChange: number) => void;
  onDebt?: (table: Table) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ table, tables, products, onClose, onUpdateTable, onPayment, onTransfer, onStockUpdate, onDebt }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>('');

  // Selection state for partial item payment
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Calculate cart total
  const totalAmount = useMemo(() => {
    return table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [table.orders]);

  const remainingAmount = useMemo(() => {
    return totalAmount - (table.paidAmount || 0);
  }, [totalAmount, table.paidAmount]);

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

  // Calculate total of selected items
  const selectedItemsTotal = useMemo(() => {
    let total = 0;
    selectedItemIds.forEach(id => {
      const item = table.orders.find(i => i.productId === id);
      if (item) total += item.price * item.quantity;
    });
    return total;
  }, [selectedItemIds, table.orders]);

  const handleAddItem = (product: Product) => {
    if (product.isStocked && (product.stockQuantity || 0) <= 0) {
        alert("Stok tükendi!");
        return;
    }

    if (onStockUpdate && product.isStocked) {
        onStockUpdate(product.id, -1);
    }

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
    let removedQty = 0;

    if (completely || newOrders[existingItemIndex].quantity === 1) {
      removedQty = newOrders[existingItemIndex].quantity;
      newOrders.splice(existingItemIndex, 1);
      // Remove from selection if exists
      if (selectedItemIds.has(productId)) {
        const newSet = new Set(selectedItemIds);
        newSet.delete(productId);
        setSelectedItemIds(newSet);
      }
    } else {
      removedQty = 1;
      newOrders[existingItemIndex].quantity -= 1;
    }
    
    // Restore stock
    const product = products.find(p => p.id === productId);
    if (onStockUpdate && product?.isStocked) {
        onStockUpdate(productId, removedQty);
    }

    onUpdateTable({
      ...table,
      orders: newOrders
    });
  };

  const toggleItemSelection = (productId: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedItemIds(newSet);
    // Clear partial amount manual input if selecting items
    setPartialAmount('');
  };

  const handlePayment = () => {
    let payAmt = 0;
    let itemsToPayCount = 0;

    // Determine payment mode: Selected Items vs Manual Amount vs Full Remaining
    if (selectedItemIds.size > 0) {
      payAmt = selectedItemsTotal;
      // Count items logic approximation
      selectedItemIds.forEach(id => {
          const item = table.orders.find(i => i.productId === id);
          if (item) itemsToPayCount += item.quantity;
      });
    } else if (partialAmount) {
      payAmt = parseFloat(partialAmount);
    } else {
      payAmt = remainingAmount;
      itemsToPayCount = totalItems;
    }
    
    if (payAmt <= 0 || payAmt > remainingAmount + 0.01) {
        alert("Geçersiz tutar.");
        return;
    }

    const isFullPayment = payAmt >= remainingAmount - 0.01;

    if (!window.confirm(`${payAmt.toFixed(2)} ₺ ödeme alınacak. Onaylıyor musunuz?`)) return;

    if (onPayment) {
      onPayment(payAmt, itemsToPayCount || 0); // items count is 0 if manual amount entered, acceptable trade-off
    }

    if (isFullPayment) {
        onUpdateTable({
            ...table,
            isOccupied: false,
            orders: [],
            openedAt: undefined,
            paidAmount: 0
        });
        onClose();
    } else {
        // If paid by selected items, remove those items from the order list?
        // OR just keep them and increase paidAmount?
        // Usually, if I pay for specific items, those items are "closed".
        // Removing them is better UX for "splitting items".
        let updatedOrders = [...table.orders];
        if (selectedItemIds.size > 0) {
           updatedOrders = updatedOrders.filter(item => !selectedItemIds.has(item.productId));
           // Reset paidAmount if we remove items, because paidAmount tracks *remaining* debt usually?
           // No, `paidAmount` tracks money put on the table against the *total* order.
           // If we remove items, total order value drops.
           // Strategy: Reduce paidAmount? No.
           // Strategy: Treat "Pay Selected" as removing items from the bill entirely (they are paid and gone).
           // So we don't increase `paidAmount`, we just remove the items.
           onUpdateTable({
               ...table,
               orders: updatedOrders
           });
           setSelectedItemIds(new Set());
        } else {
           // Manual amount payment -> Increase paidAmount
           onUpdateTable({
               ...table,
               paidAmount: (table.paidAmount || 0) + payAmt
           });
        }
        setPartialAmount('');
    }
  };

  const handleDebt = () => {
      if (onDebt) onDebt(table);
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
                    className="bg-white rounded-xl p-3 border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-left flex flex-col h-full group relative"
                  >
                    {product.isStocked && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold shadow-sm z-10 ${
                            (product.stockQuantity || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {product.stockQuantity} Stok
                        </div>
                    )}
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
                  <div
                    key={item.productId}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                        selectedItemIds.has(item.productId)
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-stone-50 border-stone-100'
                    }`}
                    onClick={() => toggleItemSelection(item.productId)}
                  >
                    <div className="mr-3">
                        {selectedItemIds.has(item.productId) ? (
                            <CheckSquare size={20} className="text-amber-600" />
                        ) : (
                            <Square size={20} className="text-stone-300" />
                        )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">{item.productName}</p>
                      <p className="text-sm text-amber-600 font-semibold">₺{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-sm" onClick={e => e.stopPropagation()}>
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
                      onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.productId, true); }}
                      className="ml-3 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-stone-500">
                    <span className="text-sm">Toplam</span>
                    <span className="font-bold">₺{totalAmount.toFixed(2)}</span>
                  </div>
                  {(table.paidAmount || 0) > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span className="text-sm">Ödenen</span>
                        <span className="font-bold">- ₺{table.paidAmount?.toFixed(2)}</span>
                      </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                    <span className="text-stone-800 font-bold">Kalan</span>
                    <span className="text-2xl font-bold text-amber-600 serif">₺{remainingAmount.toFixed(2)}</span>
                  </div>
              </div>

              {/* Partial Pay Input */}
              <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Tutar girin"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
                    value={selectedItemIds.size > 0 ? selectedItemsTotal.toFixed(2) : partialAmount}
                    onChange={e => {
                        if(selectedItemIds.size === 0) setPartialAmount(e.target.value);
                    }}
                    disabled={selectedItemIds.size > 0}
                  />
                  <button
                    onClick={handlePayment}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                  >
                    {selectedItemIds.size > 0 ? 'Seçileni Öde' : (partialAmount ? 'Tutarı Öde' : 'Hepsini Öde')}
                  </button>
              </div>

              <div className="flex gap-2">
                  {onDebt && table.type === 'person' && (
                      <button
                        onClick={handleDebt}
                        className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
                      >
                        <UserMinus size={18} />
                        Veresiye
                      </button>
                  )}
              </div>
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
