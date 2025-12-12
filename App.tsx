import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TableGrid } from './components/TableGrid';
import { OrderModal } from './components/OrderModal';
import { MenuManagement } from './components/MenuManagement';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { StorageService, DailyStats } from './services/storageService';
import { Page, Table, Product } from './types';
import { INITIAL_TABLES } from './constants';

function App() {
  const [activePage, setActivePage] = useState<Page>('pos');
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({ revenue: 0, items: 0 });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    let loadedTables = StorageService.getTables();

    // Migration logic
    if (loadedTables.length > 0) {
      const needsMigration = loadedTables.some(t => !t.type || !t.section);
      if (needsMigration) {
        loadedTables = loadedTables.map((t, i) => ({
          ...t,
          type: t.type || 'table',
          section: t.section || (i < 6 ? 'indoor' : 'outdoor')
        }));
      }
    } else {
        loadedTables = INITIAL_TABLES;
    }

    setTables(loadedTables);
    setProducts(StorageService.getProducts());
    setDailyStats(StorageService.getDailyStats());
  }, []);

  // Sync with storage
  useEffect(() => {
    if (tables.length > 0) StorageService.saveTables(tables);
  }, [tables]);

  useEffect(() => {
    if (products.length > 0) StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    StorageService.saveDailyStats(dailyStats);
  }, [dailyStats]);

  const handleUpdateTable = (updatedTable: Table) => {
    if (updatedTable.type === 'person' && !updatedTable.isOccupied) {
      setTables(prev => prev.filter(t => t.id !== updatedTable.id));
    } else {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    }
  };

  const handlePayment = (revenue: number, items: number) => {
    setDailyStats(prev => ({
      revenue: prev.revenue + revenue,
      items: prev.items + items
    }));
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleClearTables = () => {
    // Reset daily stats and tables
    const resetTables = tables
      .filter(t => t.type === 'table')
      .map(t => ({
        ...t,
        isOccupied: false,
        orders: [],
        openedAt: undefined
      }));

    setTables(resetTables);
    setDailyStats({ revenue: 0, items: 0 });

    StorageService.saveTables(resetTables);
    StorageService.saveDailyStats({ revenue: 0, items: 0 });
  };

  const handleAddPerson = (name: string) => {
    const newId = Math.max(...tables.map(t => t.id), 0) + 1;
    const newPersonTable: Table = {
      id: newId,
      name: name,
      isOccupied: true,
      orders: [],
      type: 'person',
      openedAt: new Date().toISOString()
    };
    setTables(prev => [...prev, newPersonTable]);
    setSelectedTableId(newId);
  };

  const handleAddTable = (name: string, section: 'indoor' | 'outdoor') => {
    const newId = Math.max(...tables.map(t => t.id), 0) + 1;
    const newTable: Table = {
      id: newId,
      name: name,
      isOccupied: false,
      orders: [],
      type: 'table',
      section: section
    };
    setTables(prev => [...prev, newTable]);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <div className="flex h-screen w-screen bg-stone-50 text-stone-900 font-sans">
      <Sidebar activePage={activePage} setPage={setActivePage} />
      
      <main className="flex-1 h-full overflow-hidden relative">
        {activePage === 'dashboard' && (
          <Dashboard
            tables={tables}
            products={products}
            dailyStats={dailyStats}
            onEndDay={handleClearTables}
          />
        )}

        {activePage === 'pos' && (
          <TableGrid
            tables={tables}
            onSelectTable={setSelectedTableId}
            onAddPerson={handleAddPerson}
            onAddTable={handleAddTable}
          />
        )}

        {activePage === 'menu' && (
          <MenuManagement products={products} onUpdateProducts={handleUpdateProducts} />
        )}

        {activePage === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Modals */}
      {selectedTable && (
        <OrderModal
          table={selectedTable}
          products={products}
          onClose={() => setSelectedTableId(null)}
          onUpdateTable={handleUpdateTable}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
}

export default App;