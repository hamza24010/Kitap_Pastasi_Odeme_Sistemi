import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { Debt } from '../types';
import { Lock, Search, Wallet, CheckCircle } from 'lucide-react';

interface DebtListProps {
  onPayment: (revenue: number, items: number) => void;
}

export const DebtList: React.FC<DebtListProps> = ({ onPayment }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadDebts();
    }
  }, [isAuthenticated]);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDebts();
      setDebts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kingtolga') {
      setIsAuthenticated(true);
    } else {
      alert('Hatalı şifre!');
    }
  };

  const handlePay = async (debt: Debt) => {
    const amountStr = prompt(`Ödenecek Tutar (Kalan: ${debt.remaining_amount.toFixed(2)} ₺):`, debt.remaining_amount.toString());
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || amount > debt.remaining_amount) {
      alert('Geçersiz tutar.');
      return;
    }

    try {
      await ApiService.payDebt(debt.id, amount);
      // Add to daily stats
      onPayment(amount, 0); // Assuming 0 items because items were accounted for when order was created? Or should we count them now? Revenue is key.
      loadDebts();
      alert('Ödeme başarıyla alındı.');
    } catch (err) {
      alert('Ödeme işlemi başarısız.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
          <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Güvenli Giriş</h2>
          <p className="text-stone-500 mb-6 text-sm">Borç listesini görüntülemek için şifre giriniz.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold hover:bg-stone-900 transition-colors"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredDebts = debts.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 h-full bg-stone-100 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 serif">Borç Listesi</h2>
          <p className="text-stone-500">Açık hesaplar ve veresiyeler</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="İsim ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium sticky top-0">
              <tr>
                <th className="p-4">Müşteri / İsim</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Toplam Borç</th>
                <th className="p-4">Kalan Tutar</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-stone-400">Yükleniyor...</td></tr>
              ) : filteredDebts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-stone-400">Kayıt bulunamadı.</td></tr>
              ) : (
                filteredDebts.map(debt => (
                  <tr key={debt.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-stone-800">{debt.name}</td>
                    <td className="p-4 text-stone-500 text-sm">
                        {new Date(debt.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-stone-500">₺{debt.total_amount.toFixed(2)}</td>
                    <td className="p-4 text-red-600 font-bold">₺{debt.remaining_amount.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handlePay(debt)}
                        className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-200 transition-colors inline-flex items-center gap-2"
                      >
                        <Wallet size={16} /> Ödeme Al
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
