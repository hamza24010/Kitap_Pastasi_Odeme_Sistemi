import React, { useEffect, useState } from 'react';
import { Product, Table } from '../types';
import { GeminiService } from '../services/geminiService';
import { ApiService } from '../services/apiService';
import { TrendingUp, Users, DollarSign, Sparkles, Save } from 'lucide-react';

interface DashboardProps {
  tables: Table[];
  products: Product[];
  onEndDay: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tables, products, onEndDay }) => {
  const [dailyPairing, setDailyPairing] = useState<{title: string, text: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const occupiedTables = tables.filter(t => t.isOccupied).length;
  // Calculate active revenue from currently open tables
  const activeRevenue = tables.reduce((total, table) => {
    return total + table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, 0);

  useEffect(() => {
    const fetchPairing = async () => {
      const result = await GeminiService.generateDailyPairing(products);
      setDailyPairing(result);
    };
    if (products.length > 0) {
      fetchPairing();
    }
  }, []); // Only run once on mount

  const handleEndDay = async () => {
    if (!confirm("Gün sonu işlemi yapmak üzeresiniz. Bu işlem tüm masaları sıfırlayacak ve güncel ciroyu veritabanına kaydedecektir. Emin misiniz?")) {
        return;
    }

    setIsProcessing(true);
    try {
        await ApiService.endOfDay(tables, products);
        alert("Gün sonu başarıyla tamamlandı.");
        onEndDay();
    } catch (error) {
        console.error(error);
        alert("Gün sonu işlemi sırasında bir hata oluştu!");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-100">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-stone-800 mb-2 serif">Özet Rapor</h2>
            <p className="text-stone-500">Günlük işletme istatistikleri ve öneriler</p>
        </div>
        <button
            onClick={handleEndDay}
            disabled={isProcessing}
            className={`flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-stone-700 hover:shadow-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Save size={20} />
            {isProcessing ? 'İşleniyor...' : 'Gün Sonu Yap'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Anlık Ciro (Açık Masalar)</p>
            <p className="text-3xl font-bold text-stone-800">₺{activeRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Doluluk Oranı</p>
            <p className="text-3xl font-bold text-stone-800">{occupiedTables} / {tables.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Aktif Sipariş Kalemi</p>
            <p className="text-3xl font-bold text-stone-800">
              {tables.reduce((acc, t) => acc + t.orders.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* AI Content */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={200} />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <Sparkles size={20} />
            <span className="font-bold tracking-wider uppercase text-sm">Günün Yapay Zeka Önerisi</span>
          </div>
          
          {dailyPairing ? (
            <div className="animate-fade-in">
              <h3 className="text-3xl md:text-4xl font-bold serif mb-4 leading-tight">
                {dailyPairing.title}
              </h3>
              <p className="text-stone-300 text-lg leading-relaxed border-l-4 border-amber-500 pl-4 italic">
                "{dailyPairing.text}"
              </p>
            </div>
          ) : (
             <div className="flex items-center gap-3">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
               <p className="text-stone-400">Kitap kurdu yapay zeka düşünüyor...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
