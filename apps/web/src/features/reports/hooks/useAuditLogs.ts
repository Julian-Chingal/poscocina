import { useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../api/reports.api';
import { AuditLogItem } from '../types/reports.types';

export const useAuditLogs = (venueId?: string | null, activeTab?: 'metrics' | 'audit') => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditFilterAction, setAuditFilterAction] = useState<string>('all');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  const loadAuditLogs = useCallback(async () => {
    if (!venueId) return;
    setAuditLoading(true);
    try {
      const data = await reportsApi.getAuditLogs(venueId, auditFilterAction);
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [venueId, auditFilterAction]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, loadAuditLogs]);

  return {
    auditLogs,
    auditFilterAction,
    setAuditFilterAction,
    auditLoading,
    loadAuditLogs,
  };
};
