import React from 'react';
import { UserInfo } from '@/stores/auth.store';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      <Label className="text-[11px] font-semibold text-muted-foreground mb-2 block">
        Selecciona tu usuario:
      </Label>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {users.map((u) => {
          const isSelected = selectedUser?.id === u.id;
          return (
            <Button
              key={u.id}
              variant="ghost"
              type="button"
              onClick={() => onSelectUser(u)}
              className={`h-auto flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-primary/15 border-primary/50 text-foreground shadow-xs'
                  : 'bg-muted/60 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold uppercase ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-black'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {u.name.slice(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight truncate max-w-[100px]">
                  {u.name}
                </div>
                <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  {u.roleLabel || u.roleName}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
