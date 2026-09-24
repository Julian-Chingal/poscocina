import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
import { TableItem, FloorPlanItem } from '../types/salon.types';
import { TableSchema, TableFormValues } from '../schemas/salon.schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  editingTable: TableItem | null;
  floorPlans: FloorPlanItem[];
  defaultFloorPlanId: string;
  totalTables: number;
  submitting: boolean;
  formError?: string | null;
  onClose: () => void;
  onSubmit: (formData: TableFormValues) => Promise<void>;
}

export const TableModal: React.FC<Props> = ({
  isOpen,
  editingTable,
  floorPlans,
  defaultFloorPlanId,
  totalTables,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const defaultPlanId =
    defaultFloorPlanId !== 'all' ? defaultFloorPlanId : floorPlans[0]?.id || '';

  const form = useForm<TableFormValues>({
    resolver: zodResolver(TableSchema),
    defaultValues: {
      label: '',
      floorPlanId: defaultPlanId,
      capacity: 4,
      shape: 'rect',
      status: 'free',
    },
  });

  useEffect(() => {
    if (editingTable) {
      form.reset({
        label: editingTable.label,
        floorPlanId: editingTable.floorPlanId || floorPlans[0]?.id || '',
        capacity: editingTable.capacity || 4,
        shape: editingTable.shape || 'rect',
        status: editingTable.status || 'free',
      });
    } else {
      form.reset({
        label: `Mesa ${totalTables + 1}`,
        floorPlanId: defaultPlanId,
        capacity: 4,
        shape: 'rect',
        status: 'free',
      });
    }
  }, [editingTable, defaultPlanId, floorPlans, totalTables, isOpen, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>{editingTable ? 'Editar Mesa' : 'Nueva Mesa'}</span>
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre o Número de Mesa *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. Mesa 5, Barra 2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!editingTable && floorPlans.length > 0 && (
              <FormField
                control={form.control}
                name="floorPlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona o Salón *</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        {floorPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad Comensales</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma Visual</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="rect">Rectangular</option>
                        <option value="square">Cuadrada</option>
                        <option value="circle">Redonda</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {editingTable && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Operativo</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="free">Libre</option>
                        <option value="occupied">Ocupada</option>
                        <option value="check_requested">Pidiendo Cuenta</option>
                        <option value="paid_waiting_food">Pagada (En Cocina)</option>
                        <option value="reserved">Reservada</option>
                        <option value="blocked">Bloqueada</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {submitting ? 'Guardando...' : 'Guardar Mesa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TableModal;
