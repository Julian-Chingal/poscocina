import React from 'react';
import { AppLauncherViewProps } from './types/launcher.types';
import { LauncherHeader } from './components/LauncherHeader';
import { AppsGrid } from './components/AppsGrid';

export const AppLauncherView: React.FC<AppLauncherViewProps> = ({
  onSelectApp,
  searchQuery,
}) => {
  return (
    <div className="min-h-[calc(100vh-48px)] w-full min-w-0 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-background text-foreground transition-colors">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <LauncherHeader />

      <AppsGrid searchQuery={searchQuery} onSelectApp={onSelectApp} />
    </div>
  );
};

export default AppLauncherView;
