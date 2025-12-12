import React, { useEffect, useState } from 'react';
import { Product, Table } from '../types';
import { ApiService } from '../services/apiService';
import { DailyStats } from '../services/storageService';
import { TrendingUp, Users, DollarSign, Sparkles, Save, Wallet, Quote } from 'lucide-react';

interface DashboardProps {
  tables: Table[];
  products: Product[];
  dailyStats: DailyStats;
  onEndDay: () => void;
}

const PROVERBS = [
  "Aklın varsa kendine sakla.",
  "Akıllı düşman, akılsız dosttan iyidir.",
  "Atına bakan, ardına bakmaz.",
  "Bilen söylemez, söyleyen bilmez.",
  "Bir elin nesi var, iki elin sesi var.",
  "Canı yanan eşek, attan hızlı koşar.",
  "Çok söz yalansız, çok mal haramsız olmaz.",
  "Danışan dağları aşmış, danışmayan düz yolda şaşmış.",
  "El elden üstündür.",
  "Gönül kimi severse güzel odur.",
  "Misafir kısmetiyle gelir.",
  "Ne ekersen onu biçersin.",
  "Rüzgar eken fırtına biçer.",
  "Sabır acıdır, meyvesi tatlıdır.",
  "Su akar yatağını bulur.",
  "Tatlı dil yılanı deliğinden çıkarır.",
  "Vakit nakittir.",
  "Yalnız taş duvar olmaz.",
  "Zararın neresinden dönülse kârdır.",
  "İyi dost kara günde belli olur."
];

export const Dashboard: React.FC<DashboardProps> = ({ tables, products, dailyStats, onEndDay }) => {
  const [currentProverb, setCurrentProverb] = useState<string>(PROVERBS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const occupiedTables = tables.filter(t => t.isOccupied).length;
  // Calculate active revenue from currently open tables
  const activeRevenue = tables.reduce((total, table) => {
    return total + table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, 0);

  const totalRevenue = activeRevenue + dailyStats.revenue;
  const totalItems = tables.reduce((acc, t) => acc + t.orders.length, 0) + dailyStats.items;

  useEffect(() => {
    // Initial random proverb
    setCurrentProverb(PROVERBS[Math.floor(Math.random() * PROVERBS.length)]);

    const interval = setInterval(() => {
        setCurrentProverb(PROVERBS[Math.floor(Math.random() * PROVERBS.length)]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleEndDay = async () => {
    if (!confirm("Gün sonu işlemi yapmak üzeresiniz. Bu işlem tüm masaları sıfırlayacak ve güncel ciroyu veritabanına kaydedecektir. Emin misiniz?")) {
        return;
    }

    setIsProcessing(true);
    try {
        await ApiService.endOfDay(tables, products, totalRevenue, totalItems);
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
            <p className="text-stone-500">Günlük işletme istatistikleri</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Anlık Ciro (Açık)</p>
            <p className="text-2xl font-bold text-stone-800">₺{activeRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-violet-100 p-4 rounded-full text-violet-600">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Kasadaki Para</p>
            <p className="text-2xl font-bold text-stone-800">₺{dailyStats.revenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Doluluk Oranı</p>
            <p className="text-2xl font-bold text-stone-800">{occupiedTables} / {tables.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Toplam Ürün</p>
            <p className="text-2xl font-bold text-stone-800">
              {totalItems}
            </p>
          </div>
        </div>
      </div>

      {/* Circassian Proverbs Section */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Quote size={200} />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <Quote size={20} />
            <span className="font-bold tracking-wider uppercase text-sm">Günün Çerkes Atasözü</span>
          </div>
          
          <div className="animate-fade-in">
            <p className="text-2xl md:text-3xl font-bold serif mb-4 leading-tight italic">
              "{currentProverb}"
            </p>
            <p className="text-stone-400 text-sm border-t border-stone-700 pt-4 mt-4 inline-block">
              Değişen Atasözleri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
