import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  FolderPlus,
  AlertCircle,
  Tag,
  UtensilsCrossed,
  Pencil,
} from 'lucide-react';
import { catalogApi } from '../api/catalog.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  isOpen: boolean;
  venueId: string;
  allProducts: Array<{
    id: string;
    name: string;
    price: string | number;
    categoryId?: string;
    isAvailable?: boolean;
  }>;
  onClose: () => void;
  onCatalogUpdated: () => void;
}

export const ModifiersManagerModal: React.FC<Props> = ({
  isOpen,
  venueId,
  allProducts,
  onClose,
  onCatalogUpdated,
}) => {
  const [groups, setGroups] = useState<ModifierGroupEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // New group form state
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSelectionType, setNewGroupSelectionType] = useState<'single' | 'multiple'>('single');
  const [newGroupIsRequired, setNewGroupIsRequired] = useState(false);

  // Edit group state
  const [editingGroup, setEditingGroup] = useState<ModifierGroupEntity | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupSelectionType, setEditGroupSelectionType] = useState<'single' | 'multiple'>('single');
  const [editGroupIsRequired, setEditGroupIsRequired] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // New modifier form state
  const [newModName, setNewModName] = useState('');
  const [newModPrice, setNewModPrice] = useState('');
  const [submittingMod, setSubmittingMod] = useState(false);

  // Edit modifier state
  const [editingModifier, setEditingModifier] = useState<ModifierItem | null>(null);
  const [editModName, setEditModName] = useState('');
  const [editModPrice, setEditModPrice] = useState('');
  const [editModIsAvailable, setEditModIsAvailable] = useState(true);
  const [isSavingModifier, setIsSavingModifier] = useState(false);

  // Deletion targets for shadcn AlertDialog
  const [groupToDelete, setGroupToDelete] = useState<ModifierGroupEntity | null>(null);
  const [modToDelete, setModToDelete] = useState<ModifierItem | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const data = await catalogApi.getModifierGroups(venueId);
      setGroups(data || []);
      if (data && data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    } catch {
      toast.error('Error al cargar grupos de modificadores');
    } finally {
      setLoading(false);
    }
  }, [venueId, selectedGroupId]);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen, fetchGroups]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || null;

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

  // CONFIRM DELETE GROUP (via shadcn AlertDialog)
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

  // CONFIRM DELETE MODIFIER (via shadcn AlertDialog)
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
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="size-5 text-primary" />
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Configuración de Toppings, Extras y Modificadores
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Crea y edita grupos de adiciones, modifica nombres, tipo de selección (única/múltiple), precios de toppings y vincula tus platos.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Content Layout */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Column: Groups List */}
            <div className="p-4 flex flex-col h-[65vh] bg-muted/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Grupos ({groups.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewGroupForm(!showNewGroupForm)}
                  className="h-7 px-2 text-[11px] rounded-lg gap-1"
                >
                  <FolderPlus className="size-3.5" />
                  <span>Nuevo</span>
                </Button>
              </div>

              {/* New Group Mini-Form */}
              {showNewGroupForm && (
                <form onSubmit={handleCreateGroup} className="p-3 mb-3 bg-card border rounded-xl space-y-2.5 shadow-sm">
                  <div>
                    <Label className="text-[11px] font-semibold">Nombre del Grupo</Label>
                    <Input
                      placeholder="Ej. Salsas, Toppings Hamburguesa..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="h-8 text-xs mt-1"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">Tipo de selección</span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={newGroupSelectionType === 'single' ? 'default' : 'ghost'}
                        className="h-6 text-[10px] px-2 rounded-md"
                        onClick={() => setNewGroupSelectionType('single')}
                      >
                        Única
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={newGroupSelectionType === 'multiple' ? 'default' : 'ghost'}
                        className="h-6 text-[10px] px-2 rounded-md"
                        onClick={() => setNewGroupSelectionType('multiple')}
                      >
                        Múltiple
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">¿Es Obligatorio?</span>
                    <Switch
                      checked={newGroupIsRequired}
                      onCheckedChange={setNewGroupIsRequired}
                    />
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowNewGroupForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" className="h-7 text-xs font-semibold">
                      Crear Grupo
                    </Button>
                  </div>
                </form>
              )}

              {/* Groups Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {groups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  const modsCount = group.modifiers?.length || 0;

                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-2xs font-semibold'
                          : 'border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs text-foreground truncate">{group.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {group.selectionType === 'single' ? '1 opción' : 'Múltiple'}
                          </span>
                          {group.isRequired && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                              Req
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            • {modsCount} topping(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          title="Editar grupo"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditGroup(group);
                          }}
                          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          title="Eliminar grupo"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGroupToDelete(group);
                          }}
                          className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {groups.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground text-xs border border-dashed rounded-xl p-3">
                    No hay grupos creados aún. Haz clic en "Nuevo" para crear uno.
                  </div>
                )}
              </div>
            </div>

            {/* Right 2 Columns: Active Group Details (Modifiers + Linked Products) */}
            <div className="md:col-span-2 p-5 flex flex-col h-[65vh] overflow-y-auto space-y-6">
              {activeGroup ? (
                <>
                  {/* Active Group Header with Edit Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground">
                          {activeGroup.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {activeGroup.selectionType === 'single' ? 'Selección Única' : 'Selección Múltiple'}
                        </Badge>
                        {activeGroup.isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Obligatorio
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Configura los ingredientes o extras que pertenecen a este grupo y sus precios adicionales.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditGroup(activeGroup)}
                      className="h-8 text-xs font-semibold gap-1.5 shrink-0 rounded-xl"
                    >
                      <Pencil className="size-3.5 text-primary" />
                      <span>Editar Grupo</span>
                    </Button>
                  </div>

                  <Separator />

                  {/* Section 1: Modifiers (Toppings) List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Tag className="size-3.5" />
                        <span>Toppings y Opciones del Grupo</span>
                      </h4>
                    </div>

                    {/* Add modifier inline form */}
                    <form
                      onSubmit={handleCreateModifier}
                      className="flex flex-col sm:flex-row items-center gap-2 bg-muted/20 p-2.5 rounded-xl border border-border"
                    >
                      <Input
                        placeholder="Nombre del topping (ej. Extra Tocineta, Salsa Tártara)..."
                        value={newModName}
                        onChange={(e) => setNewModName(e.target.value)}
                        className="h-8 text-xs flex-1 rounded-lg"
                      />
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="Precio Extra (ej. 3000)"
                          value={newModPrice}
                          onChange={(e) => setNewModPrice(e.target.value)}
                          className="h-8 text-xs w-32 rounded-lg font-mono"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submittingMod}
                          className="h-8 text-xs rounded-lg px-3 font-semibold gap-1 whitespace-nowrap"
                        >
                          <Plus className="size-3.5" />
                          <span>Añadir</span>
                        </Button>
                      </div>
                    </form>

                    {/* Modifiers List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(activeGroup.modifiers || []).map((mod) => {
                        const deltaNum =
                          typeof mod.priceDelta === 'string'
                            ? parseFloat(mod.priceDelta)
                            : mod.priceDelta;

                        return (
                          <Card
                            key={mod.id}
                            className={`p-2.5 rounded-xl border border-border flex items-center justify-between ${
                              !mod.isAvailable ? 'opacity-50 bg-muted/30' : 'bg-card'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-medium text-foreground block truncate">
                                {mod.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-mono text-primary font-bold">
                                  {deltaNum > 0 ? `+$${deltaNum.toLocaleString()}` : 'Gratis ($0)'}
                                </span>
                                {!mod.isAvailable && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                title="Editar topping y precio"
                                onClick={() => handleOpenEditModifier(mod)}
                                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                title="Eliminar topping"
                                onClick={() => setModToDelete(mod)}
                                className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}

                      {(!activeGroup.modifiers || activeGroup.modifiers.length === 0) && (
                        <div className="sm:col-span-2 text-center py-6 text-muted-foreground text-xs border border-dashed rounded-xl p-3">
                          Aún no has agregado toppings a este grupo. Usa el formulario de arriba para añadirlos.
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Products Linked to this Group */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <UtensilsCrossed className="size-3.5" />
                        <span>Platos / Productos que tienen este grupo</span>
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono">
                        {linkedProductIds.size} plato(s) vinculados
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Marca las casillas de los platos a los cuales los meseros y cajeros podrán agregarles estos toppings al registrar pedidos:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {allProducts.map((p) => {
                        const isLinked = linkedProductIds.has(p.id);

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProductLink(p.id, isLinked)}
                            className={`p-2 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                              isLinked
                                ? 'border-primary bg-primary/10 shadow-2xs'
                                : 'border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-medium text-foreground block truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ${Number(p.price || 0).toLocaleString()}
                              </span>
                            </div>

                            <div
                              className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isLinked
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground/40 bg-background'
                              }`}
                            >
                              {isLinked && <Check className="size-3" strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-8 space-y-2">
                  <AlertCircle className="size-8 opacity-40" />
                  <span>Selecciona un grupo a la izquierda o crea uno nuevo para empezar a configurar toppings.</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG: EDITAR GRUPO DE TOPPINGS */}
      {editingGroup && (
        <Dialog open={Boolean(editingGroup)} onOpenChange={(open) => !open && setEditingGroup(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Pencil className="size-4 text-primary" />
                <span>Editar Grupo de Toppings</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Modifica el nombre, reglas de selección y obligatoriedad de este grupo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEditGroup} className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="font-semibold">Nombre del Grupo</Label>
                <Input
                  type="text"
                  placeholder="ej. Salsas, Toppings Pizza"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold block">Tipo de Selección</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={editGroupSelectionType === 'single' ? 'default' : 'outline'}
                    onClick={() => setEditGroupSelectionType('single')}
                    className="h-8 text-xs rounded-xl justify-center font-semibold"
                  >
                    Selección Única
                  </Button>
                  <Button
                    type="button"
                    variant={editGroupSelectionType === 'multiple' ? 'default' : 'outline'}
                    onClick={() => setEditGroupSelectionType('multiple')}
                    className="h-8 text-xs rounded-xl justify-center font-semibold"
                  >
                    Selección Múltiple
                  </Button>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  {editGroupSelectionType === 'single'
                    ? 'El comensal solo puede escoger 1 opción (radio button).'
                    : 'El comensal puede escoger varios toppings (checkboxes).'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <span className="font-semibold block">¿Es Obligatorio?</span>
                  <span className="text-[11px] text-muted-foreground block">
                    El mesero/cajero deberá seleccionar al menos 1 opción para añadir el plato.
                  </span>
                </div>
                <Switch
                  checked={editGroupIsRequired}
                  onCheckedChange={setEditGroupIsRequired}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGroup(null)}
                  className="text-xs rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingGroup}
                  className="text-xs font-bold rounded-xl bg-primary text-primary-foreground"
                >
                  {isSavingGroup ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG: EDITAR TOPPING INDIVIDUAL (Nombre, Precio Delta, Disponibilidad) */}
      {editingModifier && (
        <Dialog open={Boolean(editingModifier)} onOpenChange={(open) => !open && setEditingModifier(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <span>Editar Topping / Adición</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Modifica el nombre del ingrediente, el precio adicional a cobrar y su disponibilidad.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEditModifier} className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="font-semibold">Nombre del Topping</Label>
                <Input
                  type="text"
                  placeholder="ej. Extra Tocineta, Salsa Tártara"
                  value={editModName}
                  onChange={(e) => setEditModName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Precio Adicional / Recargo ($)</Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={editModPrice}
                  onChange={(e) => setEditModPrice(e.target.value)}
                  className="h-9 text-xs font-mono rounded-xl"
                />
                <span className="text-[11px] text-muted-foreground">
                  Ingresa 0 para opciones incluidas sin costo adicional.
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <span className="font-semibold block">Disponible para la Venta</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Desactívalo si el insumo se agotó (86'd) para no ofrecerlo en el POS.
                  </span>
                </div>
                <Switch
                  checked={editModIsAvailable}
                  onCheckedChange={setEditModIsAvailable}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingModifier(null)}
                  className="text-xs rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingModifier}
                  className="text-xs font-bold rounded-xl bg-primary text-primary-foreground"
                >
                  {isSavingModifier ? 'Guardando...' : 'Actualizar Topping'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* SHADCN ALERT DIALOG: ELIMINAR GRUPO DE TOPPINGS */}
      <AlertDialog open={Boolean(groupToDelete)} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="size-4" />
              <span>¿Eliminar grupo de toppings?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Esta acción eliminará permanentemente el grupo <strong>"{groupToDelete?.name}"</strong> y todos sus toppings asociados. Los platos vinculados ya no tendrán disponibles estas adiciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteGroup}
              className="text-xs font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SHADCN ALERT DIALOG: ELIMINAR TOPPING INDIVIDUAL */}
      <AlertDialog open={Boolean(modToDelete)} onOpenChange={(open) => !open && setModToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="size-4" />
              <span>¿Eliminar topping?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              ¿Estás seguro de que deseas eliminar la adición <strong>"{modToDelete?.name}"</strong>? Ya no aparecerá en las opciones de comanda del POS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteModifier}
              className="text-xs font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Topping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ModifiersManagerModal;
