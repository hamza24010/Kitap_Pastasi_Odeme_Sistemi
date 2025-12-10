import React, { useEffect, useState } from 'react';
import { ApiService, DailySales } from '../services/apiService';
import { Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [history, setHistory] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailySales | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await ApiService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDay = async (id: number) => {
    try {
      const detail = await ApiService.getHistoryDetail(id);
      setSelectedDay(detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-100">
      <h2 className="text-3xl font-bold text-stone-800 mb-2 serif">Yönetim Paneli</h2>
      <p className="text-stone-500 mb-8">Geçmiş satış verileri ve raporlar</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h3 className="font-bold text-stone-700 flex items-center gap-2">
              <Calendar size={18} /> Geçmiş Günler
            </h3>
            <span className="text-xs text-stone-400">{history.length} kayıt</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-stone-400">Yükleniyor...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-stone-400">Henüz kayıt yok.</div>
            ) : (
              history.map((day) => (
                <button
                  key={day.id}
                  onClick={() => handleSelectDay(day.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-stone-50 flex justify-between items-center group ${
                    selectedDay?.id === day.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div>
                    <p className="font-bold text-stone-800">{day.date}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                       <DollarSign size={10} /> {day.total_revenue.toFixed(2)} ₺
                    </p>
                  </div>
                  <div className="text-right">
                     <span className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full group-hover:bg-white">
                        {day.total_items} Ürün
                     </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedDay ? (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold serif text-stone-800">{selectedDay.date} Raporu</h3>
                  <p className="text-stone-500 text-sm">Oluşturulma: {new Date(selectedDay.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-sm text-stone-400">Toplam Ciro</p>
                        <p className="text-2xl font-bold text-emerald-600">₺{selectedDay.total_revenue.toFixed(2)}</p>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3 mb-2 text-stone-500">
                        <Package size={20} />
                        <span className="font-medium">Satılan Ürün</span>
                    </div>
                    <p className="text-2xl font-bold text-stone-800">{selectedDay.total_items}</p>
                 </div>
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3 mb-2 text-stone-500">
                        <TrendingUp size={20} />
                        <span className="font-medium">Ortalama Sepet</span>
                    </div>
                    <p className="text-2xl font-bold text-stone-800">
                        ₺{(selectedDay.total_revenue / (selectedDay.total_items || 1)).toFixed(2)}
                    </p>
                 </div>
              </div>

              {/* Assuming we might want to show category breakdown if we processed it,
                  but for now let's just show a raw JSON view or something simple if details exist */}
               {selectedDay.details && (
                   <div>
                       <h4 className="font-bold text-stone-700 mb-4 border-b border-stone-100 pb-2">Detaylar</h4>
                       <div className="bg-stone-900 text-stone-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                           {/* For this MVP, just dumping the structure,
                               in a real app we would parse 'details' (which has tables/products) to show table-wise breakdown */}
                           <p>Kasa verileri sistemde kayıtlı.</p>
                           <p className="mt-2 text-stone-500">// {JSON.stringify(selectedDay.details).length} bytes of data</p>
                       </div>
                   </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Bir tarih seçin</p>
              <p className="text-sm">Detayları görmek için soldaki listeden bir güne tıklayın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
