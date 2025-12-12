import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TableGrid } from './components/TableGrid';
import { OrderModal } from './components/OrderModal';
import { MenuManagement } from './components/MenuManagement';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { StorageService } from './services/storageService';
import { Page, Table, Product } from './types';
import { INITIAL_TABLES } from './constants';

function App() {
  const [activePage, setActivePage] = useState<Page>('pos');
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    let loadedTables = StorageService.getTables();

    // Migration logic: Ensure all tables have a section and type if loaded from old storage
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
  }, []);

  // Sync with storage whenever data changes
  useEffect(() => {
    if (tables.length > 0) StorageService.saveTables(tables);
  }, [tables]);

  useEffect(() => {
    if (products.length > 0) StorageService.saveProducts(products);
  }, [products]);

  const handleUpdateTable = (updatedTable: Table) => {
    // If a 'person' table is closed (paid/empty), remove it from the list
    if (updatedTable.type === 'person' && !updatedTable.isOccupied) {
      setTables(prev => prev.filter(t => t.id !== updatedTable.id));
      // Also close modal if it was open (though modal calls this, so it closes itself usually)
    } else {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    }
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleClearTables = () => {
    // Reset tables for next day
    // For regular tables: reset status
    // For person tables: remove them entirely
    const resetTables = tables
      .filter(t => t.type === 'table')
      .map(t => ({
        ...t,
        isOccupied: false,
        orders: [],
        openedAt: undefined
      }));

    setTables(resetTables);
    StorageService.saveTables(resetTables);
  };

  const handleAddPerson = (name: string) => {
    const newId = Math.max(...tables.map(t => t.id), 0) + 1;
    const newPersonTable: Table = {
      id: newId,
      name: name,
      isOccupied: true, // Auto-occupy to start ordering immediately? Or false. Let's say true so it's "active".
      orders: [],
      type: 'person',
      openedAt: new Date().toISOString() // Mark as opened
    };
    setTables(prev => [...prev, newPersonTable]);
    setSelectedTableId(newId); // Auto-open the modal
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
          <TableGrid
            tables={tables}
            onSelectTable={setSelectedTableId}
            onAddPerson={handleAddPerson}
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
        />
      )}
    </div>
  );
}

export default App;