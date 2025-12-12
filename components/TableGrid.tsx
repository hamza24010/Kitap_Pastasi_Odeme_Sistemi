import React, { useState } from 'react';
import { Table, TableType } from '../types';
import { Users, Coffee, Plus, User } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  onSelectTable: (tableId: number) => void;
  onAddPerson?: (name: string) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({ tables, onSelectTable, onAddPerson }) => {
  const [activeTab, setActiveTab] = useState<'indoor' | 'outdoor' | 'person'>('indoor');

  const filteredTables = tables.filter(t => {
    if (activeTab === 'person') return t.type === 'person';
    return t.type === 'table' && t.section === activeTab;
  });

  const handleAddPerson = () => {
    const name = prompt("Kişi/Adisyon Adı Giriniz:");
    if (name && onAddPerson) {
      onAddPerson(name);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-100 flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
        <h2 className="text-3xl font-bold text-stone-800 serif">
          Salon Görünümü
        </h2>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-stone-200">
          <button
            onClick={() => setActiveTab('indoor')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'indoor' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            İç Mekan
          </button>
          <button
            onClick={() => setActiveTab('outdoor')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'outdoor' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Dış Mekan
          </button>
          <button
            onClick={() => setActiveTab('person')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'person' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Kişiler / Adisyonlar
          </button>
        </div>
      </div>
      
      {activeTab === 'person' && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleAddPerson}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            Yeni Kişi Ekle
          </button>
        </div>
      )}

      {filteredTables.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center text-stone-400 min-h-[400px]">
           <p className="text-xl">Bu bölümde henüz kayıt yok.</p>
           {activeTab === 'person' && <p className="text-sm mt-2">Sağ üstteki butondan yeni kişi ekleyebilirsiniz.</p>}
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
          {filteredTables.map((table) => {
            const totalAmount = table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className={`relative h-48 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 ${
                  table.isOccupied
                    ? 'bg-white border-amber-500 shadow-md'
                    : 'bg-stone-50 border-dashed border-stone-300 text-stone-400 hover:bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`text-xl font-bold serif truncate pr-2 ${table.isOccupied ? 'text-stone-800' : 'text-stone-400'}`}>
                    {table.name}
                  </span>
                  {table.isOccupied && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Açık
                    </span>
                  )}
                </div>

                <div className="space-y-1 w-full">
                  {table.isOccupied ? (
                    <>
                      <div className="flex items-center gap-2 text-stone-600">
                        <Coffee size={16} />
                        <span className="text-sm">{table.orders.reduce((acc, i) => acc + i.quantity, 0)} Ürün</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600 mt-2">
                        ₺{totalAmount.toFixed(2)}
                      </div>
                      {table.openedAt && (
                        <p className="text-xs text-stone-400 mt-1">
                          Açılış: {new Date(table.openedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full pb-6 opacity-50">
                      {table.type === 'person' ? <User size={32} className="mb-2" /> : <Users size={32} className="mb-2" />}
                      <span className="text-sm font-medium">
                        {table.type === 'person' ? 'Boş Adisyon' : 'Boş Masa'}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
