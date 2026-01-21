import React, { useState } from 'react';
import { Product, Category } from '../types';
import { GeminiService } from '../services/geminiService';
import { Plus, Edit2, Trash2, Wand2, Save, X } from 'lucide-react';

interface MenuManagementProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ products, onUpdateProducts }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    category: Category.COFFEE,
    description: '',
    image: '',
    isStocked: false,
    stockQuantity: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: Category.COFFEE,
      description: '',
      image: '',
      isStocked: false,
      stockQuantity: 0
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      isStocked: product.isStocked || false,
      stockQuantity: product.stockQuantity || 0
    });
    setEditingId(product.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update
      const updated = products.map(p => p.id === editingId ? { ...formData, id: editingId } : p);
      onUpdateProducts(updated);
    } else {
      // Create
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        image: formData.image || `https://picsum.photos/200/200?random=${Date.now()}`
      };
      onUpdateProducts([...products, newProduct]);
    }
    resetForm();
  };

  const generateDescription = async () => {
    if (!formData.name) return alert('Lütfen önce ürün adını giriniz.');
    
    setLoadingAI(true);
    const desc = await GeminiService.generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  return (
    <div className="flex h-full bg-stone-100">
      {/* Product List */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-stone-800 serif">Menü Yönetimi</h2>
          <button 
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition-colors shadow-lg"
          >
            <Plus size={20} /> Yeni Ürün Ekle
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
              <tr>
                <th className="p-4">Ürün Adı</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Fiyat</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Açıklama</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-medium text-stone-800">{product.name}</td>
                  <td className="p-4">
                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-amber-700 font-bold">₺{product.price.toFixed(2)}</td>
                  <td className="p-4">
                    {product.isStocked ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        (product.stockQuantity || 0) < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {product.stockQuantity} Adet
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-stone-500 max-w-xs truncate">{product.description}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-amber-600 hover:text-amber-800 p-1">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Form Sidebar */}
      {isEditing && (
        <div className="w-96 bg-white border-l border-stone-200 shadow-2xl p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold serif text-stone-800">
              {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün'}
            </h3>
            <button onClick={resetForm} className="text-stone-400 hover:text-stone-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Ürün Adı</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
                className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {Object.values(Category).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fiyat (₺)</label>
              <input
                required
                type="number"
                min="0"
                step="0.5"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="isStocked"
                  checked={formData.isStocked}
                  onChange={e => setFormData({...formData, isStocked: e.target.checked})}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="isStocked" className="text-sm font-medium text-stone-700 select-none">Stok Takibi Yap</label>
              </div>

              {formData.isStocked && (
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Stok Adedi</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Açıklama
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={loadingAI}
                  className="float-right text-xs text-amber-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <Wand2 size={12} /> {loadingAI ? 'Yazılıyor...' : 'AI ile Yaz'}
                </button>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Görsel URL (Opsiyonel)</label>
              <input
                type="text"
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
                className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 mt-4"
            >
              <Save size={20} /> Kaydet
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
