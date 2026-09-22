import React from 'react';
import { Search, Building2, Plus } from 'lucide-react';
import { Supplier } from '../types/inventory.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Props {
  suppliers: Supplier[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewSupplier: () => void;
}

export const SuppliersTab: React.FC<Props> = ({
  suppliers,
  searchQuery,
  onSearchChange,
  onOpenNewSupplier,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Buscar por nombre, documento o contacto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 h-9 text-xs"
          />
        </div>

        <Button
          type="button"
          onClick={onOpenNewSupplier}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 h-auto rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón Social / Proveedor</TableHead>
              <TableHead>Documento / NIT</TableHead>
              <TableHead>Contacto Directo</TableHead>
              <TableHead>Teléfono & Correo</TableHead>
              <TableHead>Dirección</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((sup) => (
              <TableRow key={sup.id}>
                <TableCell className="font-bold text-foreground text-sm flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{sup.name}</span>
                </TableCell>
                <TableCell className="font-mono font-medium text-foreground">
                  <span className="text-muted-foreground text-[10px] mr-1">{sup.documentType}</span>
                  <span>{sup.documentNumber}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{sup.contactName || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  <div>{sup.phone || '-'}</div>
                  <div className="text-[11px] text-muted-foreground/80">{sup.email || ''}</div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{sup.address || '-'}</TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                  No se encontraron proveedores registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
