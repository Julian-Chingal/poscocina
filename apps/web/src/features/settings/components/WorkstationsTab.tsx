import React, { useEffect, useState, useCallback } from 'react';
import { Plus, ChefHat, Printer, Edit2, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sileo';
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
import { StationModal, StationData, ICON_OPTIONS } from './StationModal';

interface StationItem extends StationData {
  id: string;
  printer?: { id: string; name: string } | null;
}

export const WorkstationsTab: React.FC = () => {
  const venueId = useAuthStore((s) => s.venueId);
  const [stations, setStations] = useState<StationItem[]>([]);
  const [printers, setPrinters] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<StationItem | null>(null);
  const [deletingStation, setDeletingStation] = useState<StationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stationsRes, printersRes] = await Promise.all([
        api.get<StationItem[]>('/api/stations', { params: { all: 'true' } }),
        api.get<Array<{ id: string; name: string }>>('/api/hardware/printers').catch(() => []),
      ]);
      setStations(stationsRes || []);
      setPrinters(printersRes || []);
    } catch (err: any) {
      toast.error('Error al cargar estaciones de trabajo: ' + (err.message || 'Error de red'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, venueId]);

  const handleOpenCreate = () => {
    setEditingStation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (station: StationItem) => {
    setEditingStation(station);
    setIsModalOpen(true);
  };

  const handleSave = async (data: StationData) => {
    try {
      setIsSaving(true);
      if (editingStation?.id) {
        await api.put(`/api/stations/${editingStation.id}`, data);
        toast.success('Estación actualizada correctamente');
      } else {
        await api.post('/api/stations', data);
        toast.success('Estación creada exitosamente');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error('Error al guardar estación: ' + (err.message || 'Datos inválidos'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStation) return;
    try {
      setIsDeleting(true);
      await api.delete(`/api/stations/${deletingStation.id}`);
      toast.success('Estación desactivada exitosamente');
      setDeletingStation(null);
      await loadData();
    } catch (err: any) {
      toast.error('No se pudo desactivar la estación: ' + (err.message || 'Error del servidor'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span>Estaciones de Trabajo y KDS</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define las áreas de preparación (Parrilla, Bar, Cocina Fría, etc.) y enruta los productos para preparación paralela en KDS.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-9">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="h-9">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Estación
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Cargando estaciones de trabajo...</span>
        </div>
      ) : stations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ChefHat className="w-6 h-6" />
            </div>
            <CardTitle className="text-base font-bold">No hay estaciones configuradas</CardTitle>
            <CardDescription className="text-xs max-w-sm mt-1 mb-4">
              Crea tu primera estación de trabajo para organizar la pantalla de cocina (KDS) y despachar comandas eficientemente.
            </CardDescription>
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Crear Estación Inicial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => {
            const IconComponent = ICON_OPTIONS[st.icon] || ChefHat;
            return (
              <Card
                key={st.id}
                className={`relative overflow-hidden transition-all duration-200 border ${
                  st.isActive ? 'hover:border-primary/50 hover:shadow-md' : 'opacity-60 bg-muted/20'
                }`}
              >
                <div
                  className="h-1.5 w-full absolute top-0 left-0 right-0"
                  style={{ backgroundColor: st.color || '#ea580c' }}
                />
                <CardHeader className="pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                        style={{ backgroundColor: st.color || '#ea580c' }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {!st.isActive && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Inactiva
                            </Badge>
                          )}
                        </CardTitle>
                        <span className="text-[11px] font-mono text-muted-foreground block">
                          code: {st.code}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4 text-xs">
                  {st.description && (
                    <p className="text-muted-foreground line-clamp-2">{st.description}</p>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <Printer className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span className="truncate max-w-[130px]">
                        {st.printer?.name || 'Sin impresora'}
                      </span>
                    </div>
                    <span className="font-mono text-[11px]">Orden: {st.sortOrder}</span>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(st)}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingStation(st)}
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Desactivar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar */}
      <StationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        station={editingStation}
        printers={printers}
        isSaving={isSaving}
      />

      {/* Confirmación Desactivación */}
      <AlertDialog open={!!deletingStation} onOpenChange={(open) => !open && setDeletingStation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <AlertDialogTitle>¿Desactivar estación de trabajo?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs">
              La estación <strong>{deletingStation?.name}</strong> dejará de recibir nuevos ítems de comanda en el KDS. Si tiene órdenes actualmente en preparación, el sistema no permitirá su desactivación hasta concluirlas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Desactivando...' : 'Sí, desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkstationsTab;
