import React from 'react';
import { Table } from '../types';
import { Users, Coffee } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  onSelectTable: (tableId: number) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({ tables, onSelectTable }) => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-100">
      <h2 className="text-3xl font-bold text-stone-800 mb-8 serif border-b pb-4 border-stone-200">
        Salon Görünümü
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => {
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
                <span className={`text-xl font-bold serif ${table.isOccupied ? 'text-stone-800' : 'text-stone-400'}`}>
                  {table.name}
                </span>
                {table.isOccupied && (
                   <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                     Dolu
                   </span>
                )}
              </div>

              <div className="space-y-1">
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
                    <Users size={32} className="mb-2" />
                    <span className="text-sm font-medium">Boş Masa</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
