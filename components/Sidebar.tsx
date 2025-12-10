import React from 'react';
import { LayoutDashboard, Coffee, BookOpen, Settings } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Özet', icon: <LayoutDashboard size={22} /> },
    { id: 'pos', label: 'Masalar & Sipariş', icon: <Coffee size={22} /> },
    { id: 'menu', label: 'Menü Yönetimi', icon: <BookOpen size={22} /> },
    // { id: 'settings', label: 'Ayarlar', icon: <Settings size={22} /> },
  ] as const;

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col h-full border-r border-stone-800 shadow-xl">
      <div className="p-6 border-b border-stone-800 flex items-center gap-3">
        <div className="bg-amber-600 p-2 rounded-lg text-white">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg serif leading-tight">Kitap Pastası</h1>
          <p className="text-xs text-stone-500">Kafe Yönetim v1.0</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as Page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activePage === item.id 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <div className="bg-stone-800 rounded-lg p-4 text-xs text-stone-400">
          <p className="mb-2">Sistem Durumu: <span className="text-emerald-500">Çevrimiçi</span></p>
          <p>Kullanıcı: Kasa 1</p>
        </div>
      </div>
    </aside>
  );
};
