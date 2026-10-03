import React, { useMemo } from 'react';
import {
  Search,
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  User,
  X,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Supplier } from '../types/inventory.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  // KPI Metrics
  const stats = useMemo(() => {
    let formalDocs = 0;
    let withContact = 0;
    let withPhone = 0;

    suppliers.forEach((s) => {
      if (['NIT', 'RUT'].includes((s.documentType || '').toUpperCase())) {
        formalDocs++;
      }
      if (s.contactName && s.contactName.trim()) {
        withContact++;
      }
      if (s.phone && s.phone.trim()) {
        withPhone++;
      }
    });

    return {
      total: suppliers.length,
      formalDocs,
      withContact,
      withPhone,
    };
  }, [suppliers]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase().trim();
    return suppliers.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const doc = (s.documentNumber || '').toLowerCase();
      const contact = (s.contactName || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return (
        name.includes(q) ||
        doc.includes(q) ||
        contact.includes(q) ||
        phone.includes(q) ||
        email.includes(q)
      );
    });
  }, [suppliers, searchQuery]);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* 1. Supplier Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Proveedores */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Directorio de Proveedores
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.total}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                {stats.total === 1 ? 'proveedor' : 'proveedores'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Aliados comerciales activos
            </p>
          </div>
        </div>

        {/* Personería Jurídica / Formales */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Empresas con NIT / RUT
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.formalDocs}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                registrados
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
              Facturación comercial formal
            </p>
          </div>
        </div>

        {/* Contactos Directos */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contactos Comerciales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.withPhone}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                con teléfono
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stats.withContact} con asesor asignado
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Card with Search & Suppliers Table */}
      <Card className="w-full min-w-0 shadow-sm border-border/80 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/70">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por razón social, NIT, contacto o teléfono..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 h-10 rounded-xl text-xs bg-muted/30 border-border/80 focus:bg-background transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Primary Action Button */}
            <Button
              type="button"
              onClick={onOpenNewSupplier}
              className="h-10 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 inline-flex items-center space-x-2 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proveedor</span>
            </Button>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <Table className="table-fixed w-full min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[30%] text-xs font-bold text-muted-foreground">Razón Social / Proveedor</TableHead>
                  <TableHead className="w-[18%] text-xs font-bold text-muted-foreground">Documento / NIT</TableHead>
                  <TableHead className="w-[20%] text-xs font-bold text-muted-foreground">Contacto / Asesor</TableHead>
                  <TableHead className="w-[20%] text-xs font-bold text-muted-foreground">Teléfono & Correo</TableHead>
                  <TableHead className="w-[12%] text-xs font-bold text-muted-foreground">Ubicación</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSuppliers.map((sup) => (
                  <TableRow key={sup.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Proveedor */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-sm text-foreground block truncate group-hover:text-primary transition-colors">
                            {sup.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {sup.notes ? sup.notes : 'Proveedor habilitado'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Documento */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase bg-muted text-foreground/80 border border-border/60"
                        >
                          {sup.documentType}
                        </Badge>
                        <span className="font-mono font-bold text-xs text-foreground truncate">
                          {sup.documentNumber}
                        </span>
                      </div>
                    </TableCell>

                    {/* Contacto Directo */}
                    <TableCell className="py-3.5">
                      {sup.contactName ? (
                        <div className="flex items-center space-x-2 text-foreground">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-semibold truncate">{sup.contactName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">Sin asesor</span>
                      )}
                    </TableCell>

                    {/* Teléfono & Correo */}
                    <TableCell className="py-3.5">
                      <div className="space-y-0.5">
                        {sup.phone ? (
                          <a
                            href={`tel:${sup.phone}`}
                            className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-foreground hover:text-primary transition truncate"
                          >
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{sup.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 block">Sin teléfono</span>
                        )}
                        {sup.email && (
                          <a
                            href={`mailto:${sup.email}`}
                            className="flex items-center space-x-1.5 text-[11px] text-muted-foreground hover:text-primary transition truncate"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{sup.email}</span>
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* Ubicación / Dirección */}
                    <TableCell className="py-3.5">
                      {sup.address ? (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground truncate" title={sup.address}>
                          <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/80" />
                          <span className="truncate">{sup.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Filter Empty State */}
                {filteredSuppliers.length === 0 && suppliers.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                          <Search className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">No se encontraron proveedores</h4>
                        <p className="text-xs text-muted-foreground">
                          Ningún proveedor coincide con el término de búsqueda ingresado.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onSearchChange('')}
                          className="mt-2 text-xs font-semibold rounded-xl"
                        >
                          Limpiar búsqueda
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Completely Empty State */}
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Building2 className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-foreground tracking-tight">
                            Organiza tu libreta de proveedores
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Registra distribuidores de carnes, licores, bebidas, empaques y materias primas para asociar facturas de compra y llevar cuentas ordenadas.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={onOpenNewSupplier}
                          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-primary/25 inline-flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Registrar Primer Proveedor</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersTab;
