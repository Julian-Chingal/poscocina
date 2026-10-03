import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  Tag,
  UtensilsCrossed,
  Pencil,
  Search,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';

interface ModifierItem {
  id: string;
  groupId: string;
  name: string;
  priceDelta: string | number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

interface ModifierGroupEntity {
  id: string;
  venueId: string;
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number | null;
  sortOrder: number;
  modifiers?: ModifierItem[];
  products?: Array<{ product: any }>;
}

interface Props {
  venueId: string;
  allProducts: Array<{
    id: string;
    name: string;
    price: string | number;
    categoryId?: string;
    isAvailable?: boolean;
  }>;
  onCatalogUpdated: () => void;
}

export const ToppingsTab: React.FC<Props> = ({
  venueId,
  allProducts,
  onCatalogUpdated,
}) => {
  const [groups, setGroups] = useState<ModifierGroupEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchGroupQuery, setSearchGroupQuery] = useState('');
  const [searchProductQuery, setSearchProductQuery] = useState('');

  // New group form
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSelectionType, setNewGroupSelectionType] = useState<'single' | 'multiple'>('single');
  const [newGroupIsRequired, setNewGroupIsRequired] = useState(false);

  // Edit group dialog
  const [editingGroup, setEditingGroup] = useState<ModifierGroupEntity | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupSelectionType, setEditGroupSelectionType] = useState<'single' | 'multiple'>('single');
  const [editGroupIsRequired, setEditGroupIsRequired] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // New modifier form
  const [newModName, setNewModName] = useState('');
  const [newModPrice, setNewModPrice] = useState('');
  const [submittingMod, setSubmittingMod] = useState(false);

  // Edit modifier dialog
  const [editingModifier, setEditingModifier] = useState<ModifierItem | null>(null);
  const [editModName, setEditModName] = useState('');
  const [editModPrice, setEditModPrice] = useState('');
  const [editModIsAvailable, setEditModIsAvailable] = useState(true);
  const [isSavingModifier, setIsSavingModifier] = useState(false);

  // Deletion targets
  const [groupToDelete, setGroupToDelete] = useState<ModifierGroupEntity | null>(null);
  const [modToDelete, setModToDelete] = useState<ModifierItem | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const data = await catalogApi.getModifierGroups(venueId);
      const list = Array.isArray(data) ? data : [];
      setGroups(list);
      if (list.length > 0) {
        setSelectedGroupId((prev) => (prev && list.some((g) => g.id === prev) ? prev : list[0].id));
      } else {
        setSelectedGroupId(null);
      }
    } catch (err: any) {
      console.warn('Error loading modifier groups:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  // Overall KPIs
  const stats = useMemo(() => {
    let totalOptions = 0;
    let requiredGroups = 0;
    const linkedProductSet = new Set<string>();

    groups.forEach((g) => {
      totalOptions += (g.modifiers || []).length;
      if (g.isRequired) requiredGroups++;
      (g.products || []).forEach((p: any) => {
        const pId = p.product?.id || p.productId;
        if (pId) linkedProductSet.add(pId);
      });
    });

    return {
      totalGroups: groups.length,
      totalOptions,
      linkedProductsCount: linkedProductSet.size,
      requiredGroups,
    };
  }, [groups]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    if (!searchGroupQuery.trim()) return groups;
    const q = searchGroupQuery.toLowerCase().trim();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, searchGroupQuery]);

  // Filtered dishes for linking
  const filteredProducts = useMemo(() => {
    if (!searchProductQuery.trim()) return allProducts;
    const q = searchProductQuery.toLowerCase().trim();
    return allProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [allProducts, searchProductQuery]);

  // CREATE GROUP
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('El nombre del grupo es obligatorio');
      return;
    }

    try {
      const created = await catalogApi.createModifierGroup(venueId, {
        name: newGroupName.trim(),
        selectionType: newGroupSelectionType,
        isRequired: newGroupIsRequired,
        minSelections: newGroupIsRequired ? 1 : 0,
      });
      toast.success('Grupo de modificadores creado exitosamente');
      setNewGroupName('');
      setShowNewGroupForm(false);
      await fetchGroups();
      setSelectedGroupId(created.id);
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear grupo');
    }
  };

  // OPEN EDIT GROUP DIALOG
  const handleOpenEditGroup = (group: ModifierGroupEntity) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupSelectionType(group.selectionType);
    setEditGroupIsRequired(group.isRequired);
  };

  // SAVE EDITED GROUP
  const handleSaveEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editGroupName.trim()) {
      toast.error('El nombre del grupo es obligatorio');
      return;
    }

    setIsSavingGroup(true);
    try {
      await catalogApi.updateModifierGroup(venueId, editingGroup.id, {
        name: editGroupName.trim(),
        selectionType: editGroupSelectionType,
        isRequired: editGroupIsRequired,
        minSelections: editGroupIsRequired ? 1 : 0,
      });
      toast.success('Grupo de modificadores actualizado');
      setEditingGroup(null);
      await fetchGroups();
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar grupo');
    } finally {
      setIsSavingGroup(false);
    }
  };

  // CONFIRM DELETE GROUP
  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      await catalogApi.deleteModifierGroup(venueId, groupToDelete.id);
      toast.success(`Grupo "${groupToDelete.name}" eliminado correctamente`);
      if (selectedGroupId === groupToDelete.id) {
        setSelectedGroupId(null);
      }
      setGroupToDelete(null);
      await fetchGroups();
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar grupo');
    }
  };

  // CREATE MODIFIER
  const handleCreateModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !newModName.trim()) {
      toast.error('Nombre del modificador requerido');
      return;
    }

    setSubmittingMod(true);
    try {
      const delta = parseFloat(newModPrice) || 0;
      await catalogApi.createModifier(venueId, activeGroup.id, {
        name: newModName.trim(),
        priceDelta: delta,
        isAvailable: true,
        isDefault: false,
      });
      toast.success(`Topping "${newModName.trim()}" agregado`);
      setNewModName('');
      setNewModPrice('');
      await fetchGroups();
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar modificador');
    } finally {
      setSubmittingMod(false);
    }
  };

  // OPEN EDIT MODIFIER DIALOG
  const handleOpenEditModifier = (mod: ModifierItem) => {
    setEditingModifier(mod);
    setEditModName(mod.name);
    setEditModPrice(String(mod.priceDelta || 0));
    setEditModIsAvailable(mod.isAvailable);
  };

  // SAVE EDITED MODIFIER
  const handleSaveEditModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModifier || !editModName.trim()) {
      toast.error('Nombre del modificador requerido');
      return;
    }

    setIsSavingModifier(true);
    try {
      const delta = parseFloat(editModPrice) || 0;
      await catalogApi.updateModifier(venueId, editingModifier.id, {
        name: editModName.trim(),
        priceDelta: delta,
        isAvailable: editModIsAvailable,
      });
      toast.success(`Topping "${editModName.trim()}" actualizado`);
      setEditingModifier(null);
      await fetchGroups();
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar modificador');
    } finally {
      setIsSavingModifier(false);
    }
  };

  // CONFIRM DELETE MODIFIER
  const handleConfirmDeleteModifier = async () => {
    if (!modToDelete) return;
    try {
      await catalogApi.deleteModifier(venueId, modToDelete.id);
      toast.success(`Topping "${modToDelete.name}" eliminado`);
      setModToDelete(null);
      await fetchGroups();
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar modificador');
    }
  };

  // TOGGLE PRODUCT LINK
  const handleToggleProductLink = async (productId: string, isLinked: boolean) => {
    if (!activeGroup) return;
    try {
      if (isLinked) {
        await catalogApi.unlinkProductModifierGroup(productId, activeGroup.id);
        toast.info('Producto desvinculado del grupo');
      } else {
        await catalogApi.linkProductModifierGroup(productId, activeGroup.id);
        toast.success('Producto vinculado al grupo de toppings');
      }
      await fetchGroups();
      onCatalogUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar vinculación de plato');
    }
  };

  const linkedProductIds = new Set(
    activeGroup?.products?.map((p) => p.product?.id || (p as any).productId).filter(Boolean) || []
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Grupos de Modificadores
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.totalGroups} <span className="text-sm font-semibold text-muted-foreground font-sans">grupos</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Salsas, extras, términos y guarniciones
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Toppings & Opciones
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.totalOptions} <span className="text-sm font-semibold text-muted-foreground font-sans">opciones</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Disponibles para selección en comanda
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platos Vinculados
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.linkedProductsCount} <span className="text-sm font-semibold text-muted-foreground font-sans">platos</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
              Menú con personalización habilitada
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selección Obligatoria
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.requiredGroups} <span className="text-sm font-semibold text-muted-foreground font-sans">grupos</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
              Exigen elección antes de enviar orden
            </p>
          </div>
        </div>
      </div>

      {/* 2. Zero State when there are NO groups created yet */}
      {groups.length === 0 && !loading && !showNewGroupForm && (
        <Card className="w-full rounded-2xl border-border/80 shadow-sm p-8 sm:p-12 text-center bg-card">
          <div className="flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Personaliza tus platos con Toppings y Modificadores
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Permite a tus meseros y clientes elegir adiciones, salsas, términos de carne o ingredientes extra (ej. <em>"Término de la carne"</em>, <em>"Salsas de la casa"</em>, <em>"Queso extra"</em>) vinculándolos a los platos de tu menú.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowNewGroupForm(true)}
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-primary/25 inline-flex items-center space-x-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Grupo de Toppings</span>
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Main Content: List of Groups (Left) & Configuration Details (Right) */}
      {(groups.length > 0 || showNewGroupForm) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Groups List (4 cols) */}
          <Card className="lg:col-span-4 rounded-2xl shadow-sm border-border/80 overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span>Grupos ({groups.length})</span>
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowNewGroupForm(!showNewGroupForm)}
                  className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo</span>
                </Button>
              </div>

              {/* Search Groups */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar grupo..."
                  value={searchGroupQuery}
                  onChange={(e) => setSearchGroupQuery(e.target.value)}
                  className="h-9 text-xs pl-9 pr-8 rounded-xl bg-background border-border/80"
                />
                {searchGroupQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchGroupQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </CardHeader>

            {/* Inline New Group Form */}
            {showNewGroupForm && (
              <form onSubmit={handleCreateGroup} className="p-4 bg-muted/30 border-b border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Crear Nuevo Grupo</span>
                  <button
                    type="button"
                    onClick={() => setShowNewGroupForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Nombre del Grupo *</Label>
                  <Input
                    placeholder="Ej. Salsas, Toppings Hamburguesa..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="h-9 text-xs mt-1 rounded-xl bg-background"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground">Tipo de selección</span>
                  <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border/60">
                    <Button
                      type="button"
                      size="sm"
                      variant={newGroupSelectionType === 'single' ? 'default' : 'ghost'}
                      className="h-6 text-[10px] px-2 rounded-md font-bold"
                      onClick={() => setNewGroupSelectionType('single')}
                    >
                      Única
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={newGroupSelectionType === 'multiple' ? 'default' : 'ghost'}
                      className="h-6 text-[10px] px-2 rounded-md font-bold"
                      onClick={() => setNewGroupSelectionType('multiple')}
                    >
                      Múltiple
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <Label htmlFor="new-group-req" className="text-[11px] font-semibold text-muted-foreground cursor-pointer">
                    ¿Es selección obligatoria?
                  </Label>
                  <Switch
                    id="new-group-req"
                    checked={newGroupIsRequired}
                    onCheckedChange={setNewGroupIsRequired}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs rounded-xl"
                    onClick={() => setShowNewGroupForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="h-8 text-xs font-bold rounded-xl bg-primary text-primary-foreground">
                    Crear Grupo
                  </Button>
                </div>
              </form>
            )}

            {/* Groups Scrollable List */}
            <CardContent className="p-3">
              <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredGroups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  const modsCount = (group.modifiers || []).length;
                  const linkedCount = (group.products || []).length;

                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedGroupId(group.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary'
                          : 'bg-card hover:bg-muted/40 border-border/80 text-foreground'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-extrabold truncate leading-snug">
                          {group.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] px-1.5 py-0 h-4 font-mono font-bold shrink-0 ${
                            isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : ''
                          }`}
                        >
                          {modsCount} {modsCount === 1 ? 'opción' : 'opciones'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span
                          className={`font-semibold ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {group.selectionType === 'single' ? 'Selección única' : 'Selección múltiple'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {group.isRequired ? (
                            <Badge
                              variant="destructive"
                              className={`text-[9px] px-1 py-0 h-3.5 font-bold ${
                                isSelected ? 'bg-white text-destructive' : ''
                              }`}
                            >
                              Obligatorio
                            </Badge>
                          ) : (
                            <span
                              className={`text-[9px] font-medium ${
                                isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                              }`}
                            >
                              Opcional
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-medium ${
                              isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}
                          >
                            · {linkedCount} platos
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredGroups.length === 0 && groups.length > 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No se encontraron grupos con esa búsqueda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Active Group Details & Toppings (8 cols) */}
          <Card className="lg:col-span-8 rounded-2xl shadow-sm border-border/80 overflow-hidden">
            {activeGroup ? (
              <>
                {/* Active Group Header */}
                <div className="p-5 border-b border-border/70 bg-gradient-to-r from-muted/40 to-muted/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                          Grupo Activo
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {activeGroup.selectionType === 'single' ? 'Selección Única' : 'Selección Múltiple'}
                        </Badge>
                        {activeGroup.isRequired && (
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            Obligatorio
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-foreground tracking-tight mt-1.5">
                        {activeGroup.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditGroup(activeGroup)}
                        className="h-9 px-3 rounded-xl text-xs font-bold gap-1.5 border-border/80 hover:bg-muted"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar Grupo</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setGroupToDelete(activeGroup)}
                        className="h-9 px-3 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Form to Add New Topping/Option */}
                <div className="p-5 pb-4 border-b border-border/70 bg-muted/15">
                  <form onSubmit={handleCreateModifier} className="space-y-2">
                    <Label className="text-xs font-bold text-foreground block">
                      Añadir Nueva Opción / Topping a este Grupo
                    </Label>
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <div className="flex-1 w-full">
                        <Input
                          placeholder="Nombre del topping (ej. Queso azul, Sin cebolla, Salsa tártara)..."
                          value={newModName}
                          onChange={(e) => setNewModName(e.target.value)}
                          className="h-10 text-xs rounded-xl bg-background"
                        />
                      </div>
                      <div className="w-full sm:w-44">
                        <Input
                          type="number"
                          step="100"
                          min="0"
                          placeholder="Precio extra ($ COP)"
                          value={newModPrice}
                          onChange={(e) => setNewModPrice(e.target.value)}
                          className="h-10 text-xs font-mono rounded-xl bg-background"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submittingMod || !newModName.trim()}
                        className="w-full sm:w-auto h-10 px-5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs gap-1.5 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{submittingMod ? 'Guardando...' : 'Añadir Topping'}</span>
                      </Button>
                    </div>
                  </form>
                </div>

                {/* List of Toppings/Options in this Group */}
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Opciones Configuradas ({(activeGroup.modifiers || []).length})</span>
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Disponibles para selección al pedir este producto.
                    </span>
                  </div>

                  {(activeGroup.modifiers || []).length === 0 ? (
                    <div className="text-center py-10 px-4 text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl space-y-2">
                      <Tag className="w-8 h-8 mx-auto opacity-30 text-primary" />
                      <p className="font-extrabold text-sm text-foreground">Sin opciones registradas</p>
                      <p className="max-w-md mx-auto text-xs text-muted-foreground">
                        Este grupo aún no tiene opciones. Añade la primera opción en el campo de arriba (ej. "Término 3/4", "Salsa BBQ", "Doble tocineta").
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(activeGroup.modifiers || []).map((mod) => {
                        const price = parseFloat(String(mod.priceDelta || 0));

                        return (
                          <div
                            key={mod.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              mod.isAvailable
                                ? 'bg-card border-border/80 hover:border-border'
                                : 'bg-muted/40 border-border/40 opacity-70'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-extrabold text-xs text-foreground block truncate">
                                {mod.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`font-mono text-xs font-black ${
                                  price > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                                }`}>
                                  {price > 0 ? `+$${Math.round(price).toLocaleString('es-CO')}` : 'Gratis / Base'}
                                </span>
                                {!mod.isAvailable && (
                                  <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5 font-bold">
                                    Agotado
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => handleOpenEditModifier(mod)}
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                title="Editar opción"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => setModToDelete(mod)}
                                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Eliminar opción"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Product Linking Section */}
                  <div className="pt-6 border-t border-border/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
                          <span>Vincular Platos del Menú a este Grupo ({linkedProductIds.size})</span>
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Marca los platos donde se debe ofrecer este grupo de opciones al tomar la orden.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Filtrar platos..."
                          value={searchProductQuery}
                          onChange={(e) => setSearchProductQuery(e.target.value)}
                          className="h-8 text-xs pl-8 pr-7 rounded-lg bg-background"
                        />
                        {searchProductQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchProductQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                      {filteredProducts.map((prod) => {
                        const isLinked = linkedProductIds.has(prod.id);

                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleToggleProductLink(prod.id, isLinked)}
                            role="button"
                            tabIndex={0}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition select-none flex items-center justify-between gap-2 ${
                              isLinked
                                ? 'bg-primary/10 border-primary/40 font-bold'
                                : 'bg-muted/20 border-border/60 hover:bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            <span className="text-xs truncate text-foreground">{prod.name}</span>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isLinked ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background'
                            }`}>
                              {isLinked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="p-16 text-center text-muted-foreground text-xs space-y-3">
                <SlidersHorizontal className="w-12 h-12 mx-auto opacity-30 text-primary" />
                <div className="space-y-1">
                  <p className="text-base font-extrabold text-foreground">Ningún grupo seleccionado</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Selecciona un grupo en el panel izquierdo o crea uno nuevo para empezar a añadir toppings y vincular platos.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={Boolean(editingGroup)} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">Editar Grupo de Modificadores</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEditGroup} className="space-y-3.5 pt-2">
            <div>
              <Label className="text-xs font-semibold">Nombre del Grupo *</Label>
              <Input
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="h-10 text-xs rounded-xl mt-1"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-xs font-semibold text-muted-foreground">Tipo de selección</span>
              <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border/60">
                <Button
                  type="button"
                  size="sm"
                  variant={editGroupSelectionType === 'single' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5 rounded-md font-bold"
                  onClick={() => setEditGroupSelectionType('single')}
                >
                  Única
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={editGroupSelectionType === 'multiple' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5 rounded-md font-bold"
                  onClick={() => setEditGroupSelectionType('multiple')}
                >
                  Múltiple
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <Label htmlFor="edit-group-req" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                ¿Selección Obligatoria?
              </Label>
              <Switch
                id="edit-group-req"
                checked={editGroupIsRequired}
                onCheckedChange={setEditGroupIsRequired}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setEditingGroup(null)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingGroup} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                {isSavingGroup ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modifier Dialog */}
      <Dialog open={Boolean(editingModifier)} onOpenChange={(open) => !open && setEditingModifier(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">Editar Opción / Topping</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEditModifier} className="space-y-3.5 pt-2">
            <div>
              <Label className="text-xs font-semibold">Nombre de la Opción *</Label>
              <Input
                value={editModName}
                onChange={(e) => setEditModName(e.target.value)}
                className="h-10 text-xs rounded-xl mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Precio Adicional ($ COP)</Label>
              <Input
                type="number"
                step="100"
                min="0"
                value={editModPrice}
                onChange={(e) => setEditModPrice(e.target.value)}
                className="h-10 text-xs font-mono rounded-xl mt-1"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Label htmlFor="edit-mod-avail" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                ¿Disponible para venta?
              </Label>
              <Switch
                id="edit-mod-avail"
                checked={editModIsAvailable}
                onCheckedChange={setEditModIsAvailable}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setEditingModifier(null)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingModifier} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                {isSavingModifier ? 'Guardando...' : 'Guardar Opción'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Group */}
      <AlertDialog open={Boolean(groupToDelete)} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent className="max-w-md rounded-2xl text-center">
          <AlertDialogHeader className="text-center sm:text-center space-y-2">
            <AlertDialogTitle className="text-base font-extrabold text-foreground">
              ¿Eliminar Grupo de Modificadores?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              ¿Estás seguro de eliminar el grupo <strong className="text-foreground font-bold font-mono">"{groupToDelete?.name}"</strong>? Se eliminarán todas sus opciones y se desvinculará de los platos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-3 gap-2">
            <AlertDialogCancel onClick={() => setGroupToDelete(null)} className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeleteGroup();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl"
            >
              Sí, Eliminar Grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Modifier */}
      <AlertDialog open={Boolean(modToDelete)} onOpenChange={(open) => !open && setModToDelete(null)}>
        <AlertDialogContent className="max-w-md rounded-2xl text-center">
          <AlertDialogHeader className="text-center sm:text-center space-y-2">
            <AlertDialogTitle className="text-base font-extrabold text-foreground">
              ¿Eliminar Topping?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              ¿Deseas eliminar la opción <strong className="text-foreground font-bold">"{modToDelete?.name}"</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-3 gap-2">
            <AlertDialogCancel onClick={() => setModToDelete(null)} className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeleteModifier();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl"
            >
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ToppingsTab;
