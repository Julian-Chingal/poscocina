import React from 'react';
import { AppLauncherViewProps } from './types/launcher.types';
import { LauncherHeader } from './components/LauncherHeader';
import { AppsGrid } from './components/AppsGrid';

export const AppLauncherView: React.FC<AppLauncherViewProps> = ({
  onSelectApp,
  searchQuery,
}) => {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <LauncherHeader />

      <AppsGrid searchQuery={searchQuery} onSelectApp={onSelectApp} />
    </div>
  );
};

export default AppLauncherView;
