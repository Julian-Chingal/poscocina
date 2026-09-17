import React from 'react';
import { UserItem } from '../types/users.types';
import { UserCard } from './UserCard';

interface UsersGridProps {
  loading: boolean;
  users: UserItem[];
  currentUserId?: string;
  onEdit: (user: UserItem) => void;
  onResetPin: (user: UserItem) => void;
  onToggleActive: (user: UserItem) => void;
}

export const UsersGrid: React.FC<UsersGridProps> = ({
  loading,
  users,
  currentUserId,
  onEdit,
  onResetPin,
  onToggleActive,
}) => {
  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-sm">Cargando nómina de empleados...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-400 text-sm">
        No se encontraron empleados con los filtros actuales.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((u) => (
        <UserCard
          key={u.id}
          user={u}
          isSelf={currentUserId === u.id}
          onEdit={onEdit}
          onResetPin={onResetPin}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
