import React, { useEffect, useState, useMemo } from 'react';
import { ApiService, DailySales } from '../services/apiService';
import { Calendar, TrendingUp, DollarSign, Package, BarChart3 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [history, setHistory] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailySales | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'stats'>('daily');

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

  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const weekly = history.filter(d => new Date(d.date) >= oneWeekAgo);
    const monthly = history.filter(d => new Date(d.date) >= oneMonthAgo);

    const sumRevenue = (items: DailySales[]) => items.reduce((acc, curr) => acc + curr.total_revenue, 0);
    const sumItems = (items: DailySales[]) => items.reduce((acc, curr) => acc + curr.total_items, 0);

    return {
      weekly: {
        revenue: sumRevenue(weekly),
        items: sumItems(weekly),
        count: weekly.length
      },
      monthly: {
        revenue: sumRevenue(monthly),
        items: sumItems(monthly),
        count: monthly.length
      },
      total: {
        revenue: sumRevenue(history),
        items: sumItems(history),
        count: history.length
      }
    };
  }, [history]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-100">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-stone-800 serif">Yönetim Paneli</h2>
            <p className="text-stone-500">Geçmiş satış verileri ve raporlar</p>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-stone-200 flex">
            <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'daily' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
            >
                <Calendar size={18} /> Günlük Raporlar
            </button>
            <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'stats' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
            >
                <BarChart3 size={18} /> Ciro Analizi
            </button>
        </div>
      </div>

      {viewMode === 'stats' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="text-stone-500 font-medium mb-4 flex items-center gap-2"><Calendar size={20} /> Haftalık Özet</h3>
                  <div className="space-y-4">
                      <div>
                          <p className="text-sm text-stone-400">Toplam Ciro</p>
                          <p className="text-3xl font-bold text-emerald-600">₺{stats.weekly.revenue.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between border-t border-stone-100 pt-4">
                          <div>
                              <p className="text-sm text-stone-400">Satılan Ürün</p>
                              <p className="text-xl font-bold text-stone-700">{stats.weekly.items}</p>
                          </div>
                          <div>
                              <p className="text-sm text-stone-400">İş Günü</p>
                              <p className="text-xl font-bold text-stone-700">{stats.weekly.count}</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="text-stone-500 font-medium mb-4 flex items-center gap-2"><Calendar size={20} /> Aylık Özet</h3>
                  <div className="space-y-4">
                      <div>
                          <p className="text-sm text-stone-400">Toplam Ciro</p>
                          <p className="text-3xl font-bold text-blue-600">₺{stats.monthly.revenue.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between border-t border-stone-100 pt-4">
                          <div>
                              <p className="text-sm text-stone-400">Satılan Ürün</p>
                              <p className="text-xl font-bold text-stone-700">{stats.monthly.items}</p>
                          </div>
                          <div>
                              <p className="text-sm text-stone-400">İş Günü</p>
                              <p className="text-xl font-bold text-stone-700">{stats.monthly.count}</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="text-stone-500 font-medium mb-4 flex items-center gap-2"><TrendingUp size={20} /> Genel Toplam</h3>
                  <div className="space-y-4">
                      <div>
                          <p className="text-sm text-stone-400">Toplam Ciro</p>
                          <p className="text-3xl font-bold text-amber-600">₺{stats.total.revenue.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between border-t border-stone-100 pt-4">
                          <div>
                              <p className="text-sm text-stone-400">Satılan Ürün</p>
                              <p className="text-xl font-bold text-stone-700">{stats.total.items}</p>
                          </div>
                          <div>
                              <p className="text-sm text-stone-400">Kayıt Sayısı</p>
                              <p className="text-xl font-bold text-stone-700">{stats.total.count}</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* History List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
                <h3 className="font-bold text-stone-700 flex items-center gap-2">
                <Calendar size={18} /> Geçmiş Günler
                </h3>
                <span className="text-xs text-stone-400">{history.length} kayıt</span>
            </div>

            <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
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

                {selectedDay.details && (
                    <div>
                        <h4 className="font-bold text-stone-700 mb-4 border-b border-stone-100 pb-2">Detaylar</h4>
                        <div className="bg-stone-900 text-stone-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
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
      )}
    </div>
  );
};
