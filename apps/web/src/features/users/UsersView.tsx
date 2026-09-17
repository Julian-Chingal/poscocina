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

export const UsersView: React.FC<UsersViewProps> = ({ venueId }) => {
  const { currentUser } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resetPinUser, setResetPinUser] = useState<UserItem | null>(null);

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
        onToggleActive={handleToggleActive}
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
    </div>
  );
};

export default UsersView;
