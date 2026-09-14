import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { SalonView } from './views/SalonView';
import { PosView } from './views/PosView';
import { KdsView } from './views/KdsView';
import { useAuthStore } from './stores/auth.store';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'salon' | 'pos' | 'kds'>('salon');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const { venueId, setVenueId } = useAuthStore();

  useEffect(() => {
    fetch('/api/venues/first')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          setVenueId(data.id);
        }
      })
      .catch((err) => console.error('Error bootstrapping venue:', err));
  }, [setVenueId]);

  const handleSelectTable = (table: any) => {
    setSelectedTable(table);
    setCurrentView('pos');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-orange-500">
      <Navbar currentView={currentView} onSelectView={setCurrentView} />

      <main className="flex-1 overflow-auto">
        {currentView === 'salon' && (
          <SalonView venueId={venueId} onSelectTable={handleSelectTable} />
        )}

        {currentView === 'pos' && (
          <PosView venueId={venueId} selectedTable={selectedTable} />
        )}

        {currentView === 'kds' && (
          <KdsView venueId={venueId} />
        )}
      </main>
    </div>
  );
};
