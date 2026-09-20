import React from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { AuthMode } from '../types/auth.types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthModeSwitcherProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export const AuthModeSwitcher: React.FC<AuthModeSwitcherProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <Tabs
      value={mode}
      onValueChange={(val) => onModeChange(val as AuthMode)}
      className="mb-5"
    >
      <TabsList className="w-full h-11 p-1 bg-muted border border-border rounded-xl grid grid-cols-2 gap-1">
        <TabsTrigger
          value="pin"
          className="h-9 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>PIN Rápido</span>
        </TabsTrigger>
        <TabsTrigger
          value="password"
          className="h-9 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Correo / Clave</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
