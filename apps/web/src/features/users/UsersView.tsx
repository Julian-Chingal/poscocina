import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { UsersViewProps, UserItem } from './types/users.types';
import { useUsersData } from './hooks/useUsersData';
import { useUserMutations } from './hooks/useUserMutations';
import { UsersHeader } from './components/UsersHeader';
import { UsersGrid } from './components/UsersGrid';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserModal } from './components/EditUserModal';
import { ResetPinModal } from './components/ResetPinModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const UsersView: React.FC<UsersViewProps> = ({ venueId }) => {
  const { currentUser } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resetPinUser, setResetPinUser] = useState<UserItem | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<UserItem | null>(null);

  const {
    users,
    roles,
    loading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    loadData,
  } = useUsersData(venueId);

  const {
    submitting,
    actionError,
    actionSuccess,
    setActionError,
    setActionSuccess,
    handleCreateUser,
    handleUpdateUser,
    handleResetPin,
    handleToggleActive,
  } = useUserMutations(venueId, loadData);

  const activeCount = users.filter((u) => u.isActive).length;
  const totalCount = users.length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  const handleToggleClick = (user: UserItem) => {
    if (user.isActive) {
      setUserToDeactivate(user);
    } else {
      handleToggleActive(user);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    await handleToggleActive(userToDeactivate);
    setUserToDeactivate(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <UsersHeader
        onOpenCreate={() => {
          setActionError(null);
          setShowCreateModal(true);
        }}
        actionSuccess={actionSuccess}
        onDismissSuccess={() => setActionSuccess(null)}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCount={activeCount}
        totalCount={totalCount}
        inactiveCount={inactiveCount}
      />

      <UsersGrid
        loading={loading}
        users={filteredUsers}
        currentUserId={currentUser?.id}
        onEdit={(user) => {
          setActionError(null);
          setEditingUser(user);
        }}
        onResetPin={(user) => {
          setActionError(null);
          setResetPinUser(user);
        }}
        onToggleActive={handleToggleClick}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        roles={roles}
        submitting={submitting}
        actionError={actionError}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        user={editingUser}
        roles={roles}
        submitting={submitting}
        actionError={actionError}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
      />

      <ResetPinModal
        user={resetPinUser}
        submitting={submitting}
        actionError={actionError}
        onClose={() => setResetPinUser(null)}
        onSubmit={handleResetPin}
      />

      <AlertDialog open={Boolean(userToDeactivate)} onOpenChange={(open) => !open && setUserToDeactivate(null)}>
        <AlertDialogContent className="max-w-sm text-center sm:text-center">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-base font-bold">
              ¿Desactivar Empleado?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de desactivar al empleado <span className="text-foreground font-semibold">"{userToDeactivate?.name}"</span>? No podrá ingresar al sistema mientras esté inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-4 gap-2">
            <AlertDialogCancel disabled={submitting} onClick={() => setUserToDeactivate(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeactivate();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            >
              {submitting ? 'Desactivando...' : 'Sí, desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersView;
