import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TableGrid } from './components/TableGrid';
import { OrderModal } from './components/OrderModal';
import { MenuManagement } from './components/MenuManagement';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { StorageService } from './services/storageService';
import { Page, Table, Product } from './types';

function App() {
  const [activePage, setActivePage] = useState<Page>('pos');
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    setTables(StorageService.getTables());
    setProducts(StorageService.getProducts());
  }, []);

  // Sync with storage whenever data changes
  useEffect(() => {
    if (tables.length > 0) StorageService.saveTables(tables);
  }, [tables]);

  useEffect(() => {
    if (products.length > 0) StorageService.saveProducts(products);
  }, [products]);

  const handleUpdateTable = (updatedTable: Table) => {
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleClearTables = () => {
    // Reset tables for next day, but keep IDs/Names
    const resetTables = tables.map(t => ({
      ...t,
      isOccupied: false,
      orders: [],
      openedAt: undefined
    }));
    setTables(resetTables);
    StorageService.saveTables(resetTables);
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
            onEndDay={handleClearTables}
          />
        )}

        {activePage === 'pos' && (
          <TableGrid tables={tables} onSelectTable={setSelectedTableId} />
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
        />
      )}
    </div>
  );
}

export default App;