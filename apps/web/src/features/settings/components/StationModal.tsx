import React, { useEffect, useState } from 'react';
import { ChefHat, Flame, Wine, Coffee, Cake, Utensils, Pizza, Beer, Check, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface StationData {
  id?: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
  icon: string;
  printerId?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StationData) => Promise<void>;
  station?: StationData | null;
  printers: Array<{ id: string; name: string }>;
  isSaving: boolean;
}

const COLOR_PRESETS = [
  '#ea580c', // Orange (Default)
  '#dc2626', // Red
  '#d97706', // Amber
  '#16a34a', // Green
  '#0284c7', // Sky Blue
  '#4f46e5', // Indigo
  '#9333ea', // Purple
  '#db2777', // Pink
  '#475569', // Slate
];

export const ICON_OPTIONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat,
  Flame,
  Wine,
  Coffee,
  Cake,
  Utensils,
  Pizza,
  Beer,
  Layers,
};

export const StationModal: React.FC<StationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  station,
  printers,
  isSaving,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#ea580c');
  const [icon, setIcon] = useState('ChefHat');
  const [printerId, setPrinterId] = useState<string>('none');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  useEffect(() => {
    if (station) {
      setName(station.name || '');
      setCode(station.code || '');
      setDescription(station.description || '');
      setColor(station.color || '#ea580c');
      setIcon(station.icon || 'ChefHat');
      setPrinterId(station.printerId || 'none');
      setIsActive(station.isActive ?? true);
      setSortOrder(station.sortOrder ?? 0);
      setCodeManuallyEdited(true);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setColor('#ea580c');
      setIcon('ChefHat');
      setPrinterId('none');
      setIsActive(true);
      setSortOrder(0);
      setCodeManuallyEdited(false);
    }
  }, [station, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!codeManuallyEdited && !station) {
      const slug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCode(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    await onSave({
      id: station?.id,
      name: name.trim(),
      code: code.trim().toLowerCase(),
      description: description.trim() || null,
      color,
      icon,
      printerId: printerId === 'none' ? null : printerId,
      isActive,
      sortOrder: Number(sortOrder) || 0,
    });
  };

  const SelectedIcon = ICON_OPTIONS[icon] || ChefHat;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <SelectedIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {station ? 'Editar Estación de Trabajo' : 'Nueva Estación de Trabajo'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configura un área de preparación para comandas de cocina y KDS.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="st-name" className="text-xs font-semibold">
                Nombre de la Estación *
              </Label>
              <Input
                id="st-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Parrilla, Bar, Cocina Fría"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="st-code" className="text-xs font-semibold">
                Código / Slug *
              </Label>
              <Input
                id="st-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeManuallyEdited(true);
                }}
                placeholder="parrilla"
                pattern="^[a-z0-9_-]+$"
                title="Solo minúsculas, números y guiones"
                required
                className="h-9 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="st-sort" className="text-xs font-semibold">
                Orden de Despliegue
              </Label>
              <Input
                id="st-sort"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="st-desc" className="text-xs font-semibold">
              Descripción (Opcional)
            </Label>
            <Textarea
              id="st-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas operativas para el equipo de cocina..."
              rows={2}
              className="resize-none text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Color Identificador</Label>
            <div className="flex items-center space-x-2">
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer relative"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border border-border"
                title="Color personalizado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Icono Representativo</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ICON_OPTIONS).map(([iconKey, IconComponent]) => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setIcon(iconKey)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    icon === iconKey
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                  title={iconKey}
                >
                  <IconComponent className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Impresora ESC/POS Asignada</Label>
            <Select value={printerId} onValueChange={setPrinterId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sin impresora asignada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin impresora vinculada</SelectItem>
                {printers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Las comandas que lleguen a esta estación podrán imprimirse en este dispositivo térmico.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div>
              <Label className="text-xs font-semibold block">Estación Activa</Label>
              <span className="text-[11px] text-muted-foreground">
                Visible en KDS y disponible para asignar a productos.
              </span>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim() || !code.trim()}>
              {isSaving ? 'Guardando...' : station ? 'Guardar Cambios' : 'Crear Estación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default StationModal;
