import React from "react";
import { Search } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { APPS } from "../constants/launcher.constants";
import { AppTile } from "./AppTile";

interface AppsGridProps {
  searchQuery: string;
  onSelectApp: (appId: string) => void;
}

export const AppsGrid: React.FC<AppsGridProps> = ({
  searchQuery,
  onSelectApp,
}) => {
  const { canAccessModule } = usePermissions();

  const filteredApps = APPS.filter(
    (app) =>
      canAccessModule(app.id) &&
      (app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.subtitle.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (filteredApps.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground z-10">
        <Search className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
        <p>No se encontraron módulos con el término "{searchQuery}".</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto z-10 auto-rows-fr">
      {filteredApps.map((app) => (
        <AppTile key={app.id} app={app} onSelect={onSelectApp} />
      ))}
    </div>
  );
};
