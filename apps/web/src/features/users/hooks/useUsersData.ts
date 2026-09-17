import { useState, useEffect, useCallback, useMemo } from 'react';
import { usersApi } from '../api/users.api';
import { UserItem, RoleItem, UserFilterStatus } from '../types/users.types';

export const useUsersData = (venueId: string) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<UserFilterStatus>('active');

  const loadData = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        usersApi.getUsers(venueId),
        usersApi.getRoles(),
      ]);

      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        u.roleLabel.toLowerCase().includes(query);

      if (filterStatus === 'active') return matchesSearch && u.isActive;
      if (filterStatus === 'inactive') return matchesSearch && !u.isActive;
      return matchesSearch;
    });
  }, [users, searchQuery, filterStatus]);

  return {
    users,
    roles,
    loading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    loadData,
  };
};
