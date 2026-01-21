import React, { useState } from 'react';
import { Table } from '../types';
import { X, ArrowRight, Users, Coffee, User } from 'lucide-react';

interface TransferModalProps {
  tables: Table[];
  sourceTable: Table;
  onClose: () => void;
  onConfirm: (targetTableId: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ tables, sourceTable, onClose, onConfirm }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'indoor' | 'outdoor' | 'person'>('indoor');

  const filteredTables = tables.filter(t => {
    // Exclude source table
    if (t.id === sourceTable.id) return false;

    // Filter by tab
    if (activeTab === 'person') return t.type === 'person';
    return t.type === 'table' && t.section === activeTab;
  });

  const handleConfirm = () => {
    if (selectedTargetId) {
      onConfirm(selectedTargetId);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold serif flex items-center gap-2">
              <ArrowRight size={20} className="text-amber-500" />
              Hesabı Aktar / Birleştir
            </h2>
            <p className="text-xs text-stone-400">
              <span className="text-white font-bold">{sourceTable.name}</span> masasındaki siparişleri başka bir yere taşıyın.
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-stone-700 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-2 gap-2">
          {['indoor', 'outdoor', 'person'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:bg-stone-200'
              }`}
            >
              {tab === 'indoor' ? 'İç Mekan' : tab === 'outdoor' ? 'Dış Mekan' : 'Kişiler'}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-100">
          {filteredTables.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-stone-400">
              <p>Bu bölümde uygun hedef yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTargetId(table.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTargetId === table.id
                      ? 'border-amber-500 bg-white shadow-md ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {table.type === 'person' ? (
                      <User size={16} className="text-stone-400" />
                    ) : (
                      <Users size={16} className="text-stone-400" />
                    )}
                    <span className="font-bold text-stone-800 truncate">{table.name}</span>
                  </div>

                  {table.isOccupied ? (
                    <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block font-medium">
                      Dolu ({table.orders.length} Ürün)
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400">Boş</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTargetId}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
              selectedTargetId
                ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-900/20'
                : 'bg-stone-300 cursor-not-allowed'
            }`}
          >
            Taşı / Birleştir
          </button>
        </div>

      </div>
    </div>
  );
};
