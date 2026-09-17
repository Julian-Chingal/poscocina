import React from 'react';
import { UserInfo } from '@/stores/auth.store';

interface UserAvatarSelectorProps {
  users: UserInfo[];
  selectedUser: UserInfo | null;
  onSelectUser: (user: UserInfo) => void;
}

export const UserAvatarSelector: React.FC<UserAvatarSelectorProps> = ({
  users,
  selectedUser,
  onSelectUser,
}) => {
  return (
    <div className="mb-4">
      <label className="text-[11px] font-semibold text-slate-400 mb-2 block">
        Selecciona tu usuario:
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {users.map((u) => {
          const isSelected = selectedUser?.id === u.id;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelectUser(u)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold uppercase ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {u.name.slice(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight truncate max-w-[100px]">
                  {u.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {u.roleLabel || u.roleName}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
