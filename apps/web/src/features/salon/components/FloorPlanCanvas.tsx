import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Clock,
  Trash2,
  RotateCw,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Store,
  Grid,
  UtensilsCrossed,
  Wine,
  CreditCard,
  DoorOpen,
  Footprints,
  ArrowRightLeft,
  GitMerge,
  Copy,
  Check,
  Circle as CircleIcon,
  Square,
  RectangleHorizontal,
} from 'lucide-react';
import {
  TableItem,
  FloorPlanItem,
  FloorWall,
  FloorFixture,
  FloorPlanLayout,
  WallKind,
  FixtureKind,
} from '../types/salon.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';

interface Props {
  floorPlan: FloorPlanItem | null;
  tables: TableItem[];
  isEditMode: boolean;
  isManager: boolean;
  onSelectTable: (table: TableItem) => void;
  onEditTable: (table: TableItem, e: React.MouseEvent) => void;
  onDeleteTable: (table: TableItem) => void;
  onOpenCreateTable: () => void;
  onSaveLayout: (
    floorPlanId: string,
    layout: FloorPlanLayout,
    tableUpdates: Array<{ id: string; positionX: number; positionY: number; shape?: string; capacity?: number; label?: string }>
  ) => Promise<void>;
  onStartTransfer?: (table: TableItem) => void;
  onStartMerge?: (table: TableItem) => void;
}

type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 1100;

const snap = (val: number, step = GRID_SIZE) => Math.round(val / step) * step;

interface TablePosData {
  x: number;
  y: number;
  width?: number;
  height?: number;
  shape?: 'rect' | 'circle' | 'square';
  capacity?: number;
  label?: string;
}

export const FloorPlanCanvas: React.FC<Props> = ({
  floorPlan,
  tables,
  isEditMode,
  isManager,
  onSelectTable,
  onDeleteTable,
  onOpenCreateTable,
  onSaveLayout,
  onStartTransfer,
  onStartMerge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas visual state
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'walls' | 'fixtures' | 'tables'>('walls');

  // Interactive floor plan state
  const [walls, setWalls] = useState<FloorWall[]>([]);
  const [fixtures, setFixtures] = useState<FloorFixture[]>([]);
  const [tablePositions, setTablePositions] = useState<Map<string, TablePosData>>(new Map());

  // Persistent Selection
  const [selectedId, setSelectedId] = useState<{ type: 'wall' | 'fixture' | 'table'; id: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Interaction tracking refs
  const wasInteractingRef = useRef(false);

  const draggingRef = useRef<{
    type: 'wall' | 'fixture' | 'table';
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const resizingRef = useRef<{
    type: 'wall' | 'fixture' | 'table';
    id: string;
    handle: HandleType;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  // Helper to compute initial table dimensions
  const getDefaultTableDimensions = (shape: string = 'rect', capacity: number = 4) => {
    if (shape === 'rect') {
      return { width: capacity >= 6 ? 160 : 120, height: 80 };
    } else if (shape === 'circle') {
      const dim = capacity >= 6 ? 110 : 90;
      return { width: dim, height: dim };
    } else {
      const dim = capacity >= 6 ? 100 : 84;
      return { width: dim, height: dim };
    }
  };

  // Synchronize state when floorPlan or tables change
  useEffect(() => {
    if (floorPlan) {
      const layout = (floorPlan.layout || {}) as FloorPlanLayout;
      setWalls(layout.walls || []);
      setFixtures(layout.fixtures || []);
    } else {
      setWalls([]);
      setFixtures([]);
    }

    const meta = (floorPlan?.layout as FloorPlanLayout)?.tableMeta || {};
    const map = new Map<string, TablePosData>();

    tables.forEach((t, index) => {
      let posX = Number(t.positionX) || 0;
      let posY = Number(t.positionY) || 0;
      if (posX === 0 && posY === 0) {
        posX = 80 + (index % 5) * 160;
        posY = 100 + Math.floor(index / 5) * 140;
      }
      const tableMeta = meta[t.id] || {};
      const defDims = getDefaultTableDimensions(t.shape, t.capacity);

      map.set(t.id, {
        x: posX,
        y: posY,
        width: tableMeta.width || t.width || defDims.width,
        height: tableMeta.height || t.height || defDims.height,
        shape: t.shape,
        capacity: t.capacity,
        label: t.label,
      });
    });

    setTablePositions(map);
    setIsDirty(false);
  }, [floorPlan?.id, tables]);

  // Clean selection if edit mode toggles off
  useEffect(() => {
    if (!isEditMode) {
      setSelectedId(null);
    }
  }, [isEditMode]);

  // 1. Element Moving (Drag & Drop)
  const handleElementPointerDown = (
    e: React.PointerEvent,
    type: 'wall' | 'fixture' | 'table',
    id: string,
    currX: number,
    currY: number
  ) => {
    if (!isEditMode) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setSelectedId({ type, id });
    wasInteractingRef.current = true;

    draggingRef.current = {
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currX,
      initialY: currY,
    };
  };

  // 2. Vertex & Edge Resizing
  const handleResizePointerDown = (
    e: React.PointerEvent,
    type: 'wall' | 'fixture' | 'table',
    id: string,
    handle: HandleType,
    currX: number,
    currY: number,
    currW: number,
    currH: number
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    wasInteractingRef.current = true;
    resizingRef.current = {
      type,
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currX,
      initialY: currY,
      initialW: currW,
      initialH: currH,
    };
  };

  // Global Pointer Move for Dragging and Vertex Resizing
  const handlePointerMove = (e: React.PointerEvent) => {
    // A. Resizing via Handles
    if (resizingRef.current) {
      const { type, id, handle, startX, startY, initialX, initialY, initialW, initialH } = resizingRef.current;
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      const minW = type === 'wall' ? 16 : type === 'table' ? 60 : 40;
      const minH = type === 'wall' ? 16 : type === 'table' ? 60 : 40;

      let newX = initialX;
      let newY = initialY;
      let newW = initialW;
      let newH = initialH;

      if (handle === 'se') {
        newW = snap(Math.max(minW, initialW + deltaX));
        newH = snap(Math.max(minH, initialH + deltaY));
      } else if (handle === 'ne') {
        newW = snap(Math.max(minW, initialW + deltaX));
        newH = snap(Math.max(minH, initialH - deltaY));
        newY = initialY + (initialH - newH);
      } else if (handle === 'sw') {
        newW = snap(Math.max(minW, initialW - deltaX));
        newH = snap(Math.max(minH, initialH + deltaY));
        newX = initialX + (initialW - newW);
      } else if (handle === 'nw') {
        newW = snap(Math.max(minW, initialW - deltaX));
        newH = snap(Math.max(minH, initialH - deltaY));
        newX = initialX + (initialW - newW);
        newY = initialY + (initialH - newH);
      } else if (handle === 'e') {
        newW = snap(Math.max(minW, initialW + deltaX));
      } else if (handle === 'w') {
        newW = snap(Math.max(minW, initialW - deltaX));
        newX = initialX + (initialW - newW);
      } else if (handle === 's') {
        newH = snap(Math.max(minH, initialH + deltaY));
      } else if (handle === 'n') {
        newH = snap(Math.max(minH, initialH - deltaY));
        newY = initialY + (initialH - newH);
      }

      newX = Math.max(0, Math.min(CANVAS_WIDTH - newW, newX));
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - newH, newY));

      if (type === 'wall') {
        setWalls((prev) =>
          prev.map((w) => (w.id === id ? { ...w, x: newX, y: newY, width: newW, height: newH } : w))
        );
      } else if (type === 'fixture') {
        setFixtures((prev) =>
          prev.map((f) => (f.id === id ? { ...f, x: newX, y: newY, width: newW, height: newH } : f))
        );
      } else if (type === 'table') {
        setTablePositions((prev) => {
          const next = new Map(prev);
          const item = next.get(id);
          if (item) {
            next.set(id, { ...item, x: newX, y: newY, width: newW, height: newH });
          }
          return next;
        });
      }

      setIsDirty(true);
      return;
    }

    // B. Element Dragging
    if (draggingRef.current) {
      const { type, id, startX, startY, initialX, initialY } = draggingRef.current;
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      const newX = Math.max(0, Math.min(CANVAS_WIDTH - 60, snap(initialX + deltaX)));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - 60, snap(initialY + deltaY)));

      if (type === 'table') {
        setTablePositions((prev) => {
          const next = new Map(prev);
          const item = next.get(id);
          if (item) {
            next.set(id, { ...item, x: newX, y: newY });
          }
          return next;
        });
      } else if (type === 'wall') {
        setWalls((prev) => prev.map((w) => (w.id === id ? { ...w, x: newX, y: newY } : w)));
      } else if (type === 'fixture') {
        setFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, x: newX, y: newY } : f)));
      }

      setIsDirty(true);
    }
  };

  // Global Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (resizingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      resizingRef.current = null;
    }
    if (draggingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      draggingRef.current = null;
    }
    setTimeout(() => {
      wasInteractingRef.current = false;
    }, 120);
  };

  // Canvas background click (Deselect only if clicked pure canvas space)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    if (wasInteractingRef.current) return;
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  // Add Wall
  const handleAddWall = (kind: WallKind = 'wall', isVertical = false) => {
    const newWall: FloorWall = {
      id: `wall_${Date.now()}`,
      x: snap(200 + Math.random() * 200),
      y: snap(160 + Math.random() * 200),
      width: isVertical ? 16 : kind === 'divider' ? 140 : 180,
      height: isVertical ? (kind === 'divider' ? 140 : 180) : 16,
      kind,
      rotation: isVertical ? 90 : 0,
      label: kind === 'divider' ? 'Mampara' : kind === 'glass' ? 'Cristalera' : kind === 'door' ? 'Paso' : 'Muro',
    };
    setWalls((prev) => [...prev, newWall]);
    setSelectedId({ type: 'wall', id: newWall.id });
    setIsDirty(true);
    toast.info(`"${newWall.label}" añadido al plano.`);
  };

  // Add Fixture
  const handleAddFixture = (kind: FixtureKind, label: string) => {
    let width = 140;
    let height = 70;
    if (kind === 'bar') {
      width = 240;
      height = 64;
    } else if (kind === 'plant') {
      width = 56;
      height = 56;
    } else if (kind === 'pillar') {
      width = 44;
      height = 44;
    } else if (kind === 'cashier') {
      width = 110;
      height = 70;
    }

    const newFixture: FloorFixture = {
      id: `fix_${Date.now()}`,
      x: snap(240 + Math.random() * 100),
      y: snap(180 + Math.random() * 100),
      width,
      height,
      kind,
      label,
      rotation: 0,
    };
    setFixtures((prev) => [...prev, newFixture]);
    setSelectedId({ type: 'fixture', id: newFixture.id });
    setIsDirty(true);
    toast.info(`Zona "${label}" añadida al plano.`);
  };

  // Rotate Selected
  const handleRotateSelected = () => {
    if (!selectedId) return;
    const { type, id } = selectedId;

    if (type === 'wall') {
      setWalls((prev) =>
        prev.map((w) => (w.id === id ? { ...w, width: w.height, height: w.width } : w))
      );
      setIsDirty(true);
    } else if (type === 'fixture') {
      setFixtures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, width: f.height, height: f.width } : f))
      );
      setIsDirty(true);
    } else if (type === 'table') {
      setTablePositions((prev) => {
        const next = new Map(prev);
        const item = next.get(id);
        if (item) {
          const w = item.width || 100;
          const h = item.height || 80;
          next.set(id, { ...item, width: h, height: w });
        }
        return next;
      });
      setIsDirty(true);
    }
  };

  // Duplicate / Clone Selected
  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    const { type, id } = selectedId;

    if (type === 'wall') {
      const item = walls.find((w) => w.id === id);
      if (!item) return;
      const clone: FloorWall = {
        ...item,
        id: `wall_${Date.now()}`,
        x: item.x + 30,
        y: item.y + 30,
        label: `${item.label} (Copia)`,
      };
      setWalls((prev) => [...prev, clone]);
      setSelectedId({ type: 'wall', id: clone.id });
      setIsDirty(true);
      toast.success('Muro duplicado correctamente');
    } else if (type === 'fixture') {
      const item = fixtures.find((f) => f.id === id);
      if (!item) return;
      const clone: FloorFixture = {
        ...item,
        id: `fix_${Date.now()}`,
        x: item.x + 30,
        y: item.y + 30,
        label: `${item.label} (Copia)`,
      };
      setFixtures((prev) => [...prev, clone]);
      setSelectedId({ type: 'fixture', id: clone.id });
      setIsDirty(true);
      toast.success('Zona duplicada correctamente');
    } else if (type === 'table') {
      onOpenCreateTable();
    }
  };

  // Delete Selected
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const { type, id } = selectedId;

    if (type === 'wall') {
      setWalls((prev) => prev.filter((w) => w.id !== id));
      setSelectedId(null);
      setIsDirty(true);
    } else if (type === 'fixture') {
      setFixtures((prev) => prev.filter((f) => f.id !== id));
      setSelectedId(null);
      setIsDirty(true);
    } else if (type === 'table') {
      const table = tables.find((t) => t.id === id);
      if (table) onDeleteTable(table);
      setSelectedId(null);
    }
  };

  // Quick Label Update for Selected Element
  const handleUpdateSelectedLabel = (newLabel: string) => {
    if (!selectedId) return;
    const { type, id } = selectedId;

    if (type === 'wall') {
      setWalls((prev) => prev.map((w) => (w.id === id ? { ...w, label: newLabel } : w)));
    } else if (type === 'fixture') {
      setFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, label: newLabel } : f)));
    } else if (type === 'table') {
      setTablePositions((prev) => {
        const next = new Map(prev);
        const item = next.get(id);
        if (item) {
          next.set(id, { ...item, label: newLabel });
        }
        return next;
      });
    }
    setIsDirty(true);
  };

  // Quick Table Shape Update
  const handleUpdateTableShape = (shape: 'rect' | 'circle' | 'square') => {
    if (!selectedId || selectedId.type !== 'table') return;
    const id = selectedId.id;

    setTablePositions((prev) => {
      const next = new Map(prev);
      const item = next.get(id);
      if (item) {
        const def = getDefaultTableDimensions(shape, item.capacity || 4);
        next.set(id, {
          ...item,
          shape,
          width: def.width,
          height: def.height,
        });
      }
      return next;
    });
    setIsDirty(true);
  };

  // Quick Table Capacity Update
  const handleUpdateTableCapacity = (delta: number) => {
    if (!selectedId || selectedId.type !== 'table') return;
    const id = selectedId.id;

    setTablePositions((prev) => {
      const next = new Map(prev);
      const item = next.get(id);
      if (item) {
        const newCap = Math.max(1, Math.min(24, (item.capacity || 4) + delta));
        next.set(id, { ...item, capacity: newCap });
      }
      return next;
    });
    setIsDirty(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!floorPlan) return;
    try {
      setSaving(true);
      const tableMeta: Record<string, { width?: number; height?: number }> = {};
      const tableUpdates: Array<{
        id: string;
        positionX: number;
        positionY: number;
        shape?: string;
        capacity?: number;
        label?: string;
      }> = [];

      tablePositions.forEach((pos, id) => {
        if (pos.width || pos.height) {
          tableMeta[id] = { width: Math.round(pos.width || 90), height: Math.round(pos.height || 90) };
        }
        tableUpdates.push({
          id,
          positionX: Math.round(pos.x),
          positionY: Math.round(pos.y),
          shape: pos.shape,
          capacity: pos.capacity,
          label: pos.label,
        });
      });

      const layoutPayload: FloorPlanLayout = {
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
        gridSize: GRID_SIZE,
        walls,
        fixtures,
        tableMeta,
      };

      await onSaveLayout(floorPlan.id, layoutPayload, tableUpdates);
      setIsDirty(false);
    } catch {
      // error handled in mutation
    } finally {
      setSaving(false);
    }
  };

  // Revert changes
  const handleRevert = () => {
    if (!floorPlan) return;
    const layout = (floorPlan.layout || {}) as FloorPlanLayout;
    setWalls(layout.walls || []);
    setFixtures(layout.fixtures || []);

    const meta = layout.tableMeta || {};
    const map = new Map<string, TablePosData>();
    tables.forEach((t) => {
      const m = meta[t.id] || {};
      const def = getDefaultTableDimensions(t.shape, t.capacity);
      map.set(t.id, {
        x: Number(t.positionX) || 0,
        y: Number(t.positionY) || 0,
        width: m.width || def.width,
        height: m.height || def.height,
        shape: t.shape,
        capacity: t.capacity,
        label: t.label,
      });
    });
    setTablePositions(map);
    setIsDirty(false);
    setSelectedId(null);
    toast.info('Cambios descartados.');
  };

  // Helper colors for table statuses
  const getTableStatusStyle = (status: TableItem['status']) => {
    switch (status) {
      case 'free':
        return {
          bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
          border: 'border-emerald-500/60 hover:border-emerald-400',
          text: 'text-emerald-400',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
        };
      case 'occupied':
        return {
          bg: 'bg-amber-500/20 hover:bg-amber-500/30',
          border: 'border-amber-500/70 hover:border-amber-400',
          text: 'text-amber-300',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        };
      case 'check_requested':
        return {
          bg: 'bg-purple-500/25 hover:bg-purple-500/35 animate-pulse',
          border: 'border-purple-500/80 hover:border-purple-400',
          text: 'text-purple-300',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        };
      case 'paid_waiting_food':
        return {
          bg: 'bg-cyan-500/20 hover:bg-cyan-500/30',
          border: 'border-cyan-500/70 hover:border-cyan-400',
          text: 'text-cyan-300',
          glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
        };
      case 'reserved':
        return {
          bg: 'bg-blue-500/20 hover:bg-blue-500/30',
          border: 'border-blue-500/70 hover:border-blue-400',
          text: 'text-blue-300',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
        };
      case 'blocked':
        return {
          bg: 'bg-zinc-800/40 opacity-50',
          border: 'border-zinc-700',
          text: 'text-zinc-500',
          glow: '',
        };
      default:
        return {
          bg: 'bg-muted/30',
          border: 'border-border',
          text: 'text-foreground',
          glow: '',
        };
    }
  };

  // Helper for rendering realistic chairs around a table
  const renderChairs = (shape: string, capacity: number) => {
    const chairCount = Math.min(Math.max(capacity, 1), 16);
    const chairs: React.ReactNode[] = [];

    if (shape === 'circle') {
      const radius = 52;
      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * 2 * Math.PI - Math.PI / 2;
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;
        chairs.push(
          <div
            key={i}
            className="absolute w-4 h-3 rounded-t-full bg-muted-foreground/30 border border-muted-foreground/40 pointer-events-none"
            style={{
              left: `calc(50% + ${cx}px - 8px)`,
              top: `calc(50% + ${cy}px - 6px)`,
              transform: `rotate(${angle + Math.PI / 2}rad)`,
            }}
          />
        );
      }
    } else if (shape === 'rect') {
      const topCount = Math.ceil(chairCount / 2);
      const bottomCount = chairCount - topCount;
      for (let i = 0; i < topCount; i++) {
        chairs.push(
          <div
            key={`top-${i}`}
            className="absolute -top-3.5 h-3 w-5 rounded-t-md bg-muted-foreground/30 border border-muted-foreground/40 pointer-events-none"
            style={{ left: `${((i + 1) / (topCount + 1)) * 100}%`, transform: 'translateX(-50%)' }}
          />
        );
      }
      for (let i = 0; i < bottomCount; i++) {
        chairs.push(
          <div
            key={`bot-${i}`}
            className="absolute -bottom-3.5 h-3 w-5 rounded-b-md bg-muted-foreground/30 border border-muted-foreground/40 pointer-events-none"
            style={{ left: `${((i + 1) / (bottomCount + 1)) * 100}%`, transform: 'translateX(-50%)' }}
          />
        );
      }
    } else {
      // square
      ['top', 'bottom', 'left', 'right'].forEach((side) => {
        chairs.push(
          <div
            key={side}
            className={`absolute bg-muted-foreground/30 border border-muted-foreground/40 pointer-events-none ${
              side === 'top'
                ? '-top-3.5 left-1/2 -translate-x-1/2 h-3 w-6 rounded-t-md'
                : side === 'bottom'
                ? '-bottom-3.5 left-1/2 -translate-x-1/2 h-3 w-6 rounded-b-md'
                : side === 'left'
                ? '-left-3.5 top-1/2 -translate-y-1/2 w-3 h-6 rounded-l-md'
                : '-right-3.5 top-1/2 -translate-y-1/2 w-3 h-6 rounded-r-md'
            }`}
          />
        );
      });
    }

    return chairs;
  };

  // Reusable Selection Box with 8 Vertex / Edge Handles
  const renderSelectionHandles = (
    type: 'wall' | 'fixture' | 'table',
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!isEditMode) return null;
    const isSelected = selectedId?.type === type && selectedId.id === id;
    if (!isSelected) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Selection Ring */}
        <div className="absolute inset-0 border-2 border-amber-500 rounded-inherit ring-2 ring-amber-500/30" />

        {/* 4 Corner Handles (Vertices) */}
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'nw', x, y, width, height)}
          className="pointer-events-auto absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Redimensionar esquina superior izquierda"
        />
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'ne', x, y, width, height)}
          className="pointer-events-auto absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Redimensionar esquina superior derecha"
        />
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'se', x, y, width, height)}
          className="pointer-events-auto absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Redimensionar esquina inferior derecha"
        />
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'sw', x, y, width, height)}
          className="pointer-events-auto absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Redimensionar esquina inferior izquierda"
        />

        {/* 4 Edge Handles */}
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'n', x, y, width, height)}
          className="pointer-events-auto absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-ns-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Ajustar altura superior"
        />
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 's', x, y, width, height)}
          className="pointer-events-auto absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-ns-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Ajustar altura inferior"
        />
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'w', x, y, width, height)}
          className="pointer-events-auto absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-ew-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Ajustar ancho izquierdo"
        />
        <div
          onPointerDown={(e) => handleResizePointerDown(e, type, id, 'e', x, y, width, height)}
          className="pointer-events-auto absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-sm shadow-md cursor-ew-resize hover:scale-125 hover:bg-amber-100 transition-transform"
          title="Ajustar ancho derecho"
        />

        {/* Live Size Pill */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-zinc-900/90 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/40 shadow whitespace-nowrap pointer-events-none">
          {Math.round(width)} × {Math.round(height)}
        </div>
      </div>
    );
  };

  // Get active selected element details for Inspector Toolbar
  const getSelectedElementData = () => {
    if (!selectedId) return null;
    const { type, id } = selectedId;
    if (type === 'wall') {
      const item = walls.find((w) => w.id === id);
      return item ? { type, id, label: item.label || 'Muro', width: item.width, height: item.height, item } : null;
    } else if (type === 'fixture') {
      const item = fixtures.find((f) => f.id === id);
      return item ? { type, id, label: item.label, width: item.width, height: item.height, item } : null;
    } else if (type === 'table') {
      const pos = tablePositions.get(id);
      const table = tables.find((t) => t.id === id);
      if (!pos || !table) return null;
      return {
        type,
        id,
        label: pos.label || table.label,
        width: pos.width || 90,
        height: pos.height || 90,
        shape: pos.shape || table.shape || 'rect',
        capacity: pos.capacity || table.capacity || 4,
        table,
      };
    }
    return null;
  };

  const selectedData = getSelectedElementData();

  return (
    <div className="relative w-full flex flex-col space-y-3">
      {/* Top Designer Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/90 backdrop-blur-md p-3.5 rounded-2xl border border-border/80 shadow-md">
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/30 flex items-center space-x-1"
          >
            <Store className="w-3.5 h-3.5 mr-1" />
            <span>{floorPlan ? floorPlan.name : 'Plano General'}</span>
          </Badge>

          <span className="text-xs text-muted-foreground hidden sm:inline">
            {tables.length} mesas · {walls.length} muros/divisiones · {fixtures.length} zonas
          </span>
        </div>

        {/* Viewport Zoom & Grid Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/70">
            <Grid className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground hidden sm:inline font-medium">Guías</span>
            <Switch
              checked={showGrid}
              onCheckedChange={setShowGrid}
              aria-label="Alternar cuadrícula de diseño"
            />
          </div>

          <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[11px] font-mono px-2 text-muted-foreground select-none">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setZoom(1)}
              title="Restablecer 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Edit Mode Save / Revert Actions */}
          {isEditMode && isManager && (
            <div className="flex items-center space-x-1.5 pl-2 border-l border-border">
              {isDirty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevert}
                  className="h-8 px-2.5 text-xs rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Descartar</span>
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={`h-8 px-3 text-xs font-bold rounded-lg shadow-sm transition-all ${
                  isDirty
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>{saving ? 'Guardando...' : isDirty ? 'Guardar Cambios' : 'Plano Guardado'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Blueprint Design Dock (Categories) */}
      {isEditMode && isManager && (
        <Card className="p-3 bg-card/95 backdrop-blur-md border border-amber-500/30 rounded-2xl shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Herramientas de Arquitectura y Mobiliario
              </span>
            </div>

            <div className="flex items-center space-x-1 bg-muted/60 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCategory('walls')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeCategory === 'walls'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🧱 Muros y Divisiones
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('fixtures')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeCategory === 'fixtures'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🍹 Zonas de Servicio
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('tables')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeCategory === 'tables'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🪑 Mesas
              </button>
            </div>
          </div>

          {/* Category Tools Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {activeCategory === 'walls' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWall('wall', false)}
                  className="h-8 text-xs font-medium bg-muted/40 hover:bg-muted border-border"
                >
                  <span className="w-3.5 h-1.5 bg-zinc-400 rounded-sm mr-1.5 inline-block"></span>
                  Muro Horizontal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWall('wall', true)}
                  className="h-8 text-xs font-medium bg-muted/40 hover:bg-muted border-border"
                >
                  <span className="w-1.5 h-3.5 bg-zinc-400 rounded-sm mr-1.5 inline-block"></span>
                  Muro Vertical
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWall('divider', false)}
                  className="h-8 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30"
                >
                  <span className="w-3.5 h-1.5 bg-amber-600 rounded-sm mr-1.5 inline-block"></span>
                  Mampara de Madera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWall('glass', false)}
                  className="h-8 text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30"
                >
                  <span className="w-3.5 h-1.5 bg-sky-400/80 rounded-sm mr-1.5 inline-block"></span>
                  Cristalera / Ventanal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWall('door', false)}
                  className="h-8 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                >
                  <DoorOpen className="w-3.5 h-3.5 mr-1" />
                  Paso / Puerta
                </Button>
              </>
            )}

            {activeCategory === 'fixtures' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFixture('bar', 'Barra Principal')}
                  className="h-8 text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  <Wine className="w-3.5 h-3.5 mr-1" />
                  Barra de Bar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFixture('cashier', 'Caja POS')}
                  className="h-8 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  Caja de Cobro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFixture('kitchen', 'Pase de Cocina')}
                  className="h-8 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 mr-1" />
                  Pase Cocina
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFixture('entrance', 'Entrada')}
                  className="h-8 text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                >
                  <Footprints className="w-3.5 h-3.5 mr-1" />
                  Acceso / Entrada
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFixture('plant', 'Planta')}
                  className="h-8 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                >
                  🌿 Planta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFixture('pillar', 'Columna')}
                  className="h-8 text-xs font-medium bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                >
                  ⬛ Columna
                </Button>
              </>
            )}

            {activeCategory === 'tables' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenCreateTable}
                  className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nueva Mesa al Plano
                </Button>
                <span className="text-xs text-muted-foreground ml-2">
                  Haz clic en cualquier elemento para seleccionarlo y cambiar su tamaño desde los vértices.
                </span>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Persistent Inspector / Properties Panel for Selected Element */}
      {isEditMode && selectedData && (
        <Card className="p-3 bg-card/95 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-amber-500 text-black font-extrabold text-xs uppercase px-2.5 py-1">
              {selectedData.type === 'wall'
                ? '🧱 Muro'
                : selectedData.type === 'fixture'
                ? '🍹 Zona'
                : '🪑 Mesa'}
            </Badge>

            {/* Editable Label Field */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-muted-foreground">Etiqueta:</span>
              <Input
                type="text"
                value={selectedData.label}
                onChange={(e) => handleUpdateSelectedLabel(e.target.value)}
                className="h-8 w-36 text-xs font-bold rounded-lg border-border focus:border-amber-500"
                placeholder="Nombre o ID..."
              />
            </div>

            {/* Live Size & Quick +/- buttons */}
            <div className="flex items-center space-x-1 bg-muted/60 px-2.5 py-1 rounded-xl border border-border text-xs font-mono">
              <span className="text-muted-foreground font-semibold">Tamaño:</span>
              <span className="text-foreground font-bold font-mono">
                {Math.round(selectedData.width)} × {Math.round(selectedData.height)} px
              </span>
            </div>

            {/* If Table: Quick Shape and Capacity buttons */}
            {selectedData.type === 'table' && (
              <>
                <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-xs rounded-lg ${
                      selectedData.shape === 'rect' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={() => handleUpdateTableShape('rect')}
                    title="Mesa Rectangular"
                  >
                    <RectangleHorizontal className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Rectangular</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-xs rounded-lg ${
                      selectedData.shape === 'square' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={() => handleUpdateTableShape('square')}
                    title="Mesa Cuadrada"
                  >
                    <Square className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Cuadrada</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-xs rounded-lg ${
                      selectedData.shape === 'circle' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={() => handleUpdateTableShape('circle')}
                    title="Mesa Redonda"
                  >
                    <CircleIcon className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Redonda</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-1 bg-muted/60 p-0.5 rounded-xl border border-border">
                  <span className="text-xs font-bold text-muted-foreground px-1.5 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedData.capacity} pax
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-muted"
                    onClick={() => handleUpdateTableCapacity(-1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-muted"
                    onClick={() => handleUpdateTableCapacity(1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Action buttons (Rotate, Duplicate, Delete, Done) */}
          <div className="flex items-center space-x-1.5 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold rounded-xl bg-card border-border hover:bg-muted"
              onClick={handleRotateSelected}
              title="Girar orientación 90 grados"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1" />
              <span>Girar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold rounded-xl bg-card border-border hover:bg-muted"
              onClick={handleDuplicateSelected}
              title="Duplicar elemento"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              <span>Clonar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/20 hover:text-destructive"
              onClick={handleDeleteSelected}
              title="Eliminar del plano"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Eliminar</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              onClick={() => setSelectedId(null)}
              title="Finalizar ajustes de este elemento"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Listo</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Main Interactive Canvas Surface */}
      <div
        ref={containerRef}
        className="w-full min-h-[640px] h-[75vh] max-h-[850px] overflow-auto rounded-3xl border border-border/80 bg-background/95 relative select-none shadow-inner"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className={`relative transition-transform duration-75 origin-top-left ${
            showGrid ? 'bg-blueprint-grid' : ''
          }`}
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `scale(${zoom})`,
            backgroundImage: showGrid
              ? `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`
              : undefined,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
          onClick={handleCanvasClick}
        >
          {/* Walls & Partitions Layer */}
          {walls.map((wall) => {
            const isSelected = selectedId?.type === 'wall' && selectedId.id === wall.id;

            let wallStyle = 'bg-zinc-700/80 border-zinc-600 shadow-md';
            if (wall.kind === 'divider') {
              wallStyle =
                'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border-amber-600/80 shadow-md';
            } else if (wall.kind === 'glass') {
              wallStyle =
                'bg-sky-400/25 backdrop-blur-[2px] border-2 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.2)]';
            } else if (wall.kind === 'door') {
              wallStyle =
                'bg-emerald-500/10 border-2 border-dashed border-emerald-500/60 flex items-center justify-center';
            }

            return (
              <div
                key={wall.id}
                onPointerDown={(e) => handleElementPointerDown(e, 'wall', wall.id, wall.x, wall.y)}
                className={`absolute rounded transition-shadow ${wallStyle} ${
                  isEditMode ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-500/60' : ''
                } ${isSelected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}`}
                style={{
                  left: `${wall.x}px`,
                  top: `${wall.y}px`,
                  width: `${wall.width}px`,
                  height: `${wall.height}px`,
                  zIndex: 10,
                }}
              >
                {wall.kind === 'door' && (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-1">
                    🚪 Paso
                  </span>
                )}
                {isSelected && isEditMode && (
                  <span className="absolute -top-5 left-0 text-[10px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded shadow">
                    {wall.label}
                  </span>
                )}

                {/* Vertex & Edge Resize Handles */}
                {renderSelectionHandles('wall', wall.id, wall.x, wall.y, wall.width, wall.height)}
              </div>
            );
          })}

          {/* Fixtures Layer (Bars, Cashiers, Kitchens, Restrooms, Plants) */}
          {fixtures.map((fix) => {
            const isSelected = selectedId?.type === 'fixture' && selectedId.id === fix.id;

            return (
              <div
                key={fix.id}
                onPointerDown={(e) => handleElementPointerDown(e, 'fixture', fix.id, fix.x, fix.y)}
                className={`absolute rounded-2xl flex items-center justify-center p-2 border-2 transition-all select-none shadow-md ${
                  fix.kind === 'bar'
                    ? 'bg-gradient-to-br from-purple-950/70 to-zinc-900 border-purple-500/40 text-purple-200'
                    : fix.kind === 'cashier'
                    ? 'bg-gradient-to-br from-emerald-950/70 to-zinc-900 border-emerald-500/50 text-emerald-200'
                    : fix.kind === 'kitchen'
                    ? 'bg-gradient-to-br from-amber-950/70 to-zinc-900 border-amber-500/50 text-amber-200'
                    : fix.kind === 'entrance'
                    ? 'bg-gradient-to-br from-blue-950/70 to-zinc-900 border-blue-500/50 text-blue-200'
                    : fix.kind === 'plant'
                    ? 'bg-emerald-900/40 border-emerald-500/60 rounded-full text-emerald-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                } ${
                  isEditMode ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-500/60' : ''
                } ${isSelected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}`}
                style={{
                  left: `${fix.x}px`,
                  top: `${fix.y}px`,
                  width: `${fix.width}px`,
                  height: `${fix.height}px`,
                  zIndex: 15,
                }}
              >
                <div className="flex items-center space-x-1.5 text-center pointer-events-none truncate">
                  {fix.kind === 'bar' && <Wine className="w-4 h-4 shrink-0 text-purple-400" />}
                  {fix.kind === 'cashier' && <CreditCard className="w-4 h-4 shrink-0 text-emerald-400" />}
                  {fix.kind === 'kitchen' && <UtensilsCrossed className="w-4 h-4 shrink-0 text-amber-400" />}
                  {fix.kind === 'entrance' && <Footprints className="w-4 h-4 shrink-0 text-blue-400" />}
                  {fix.kind === 'plant' && <span className="text-xl">🌿</span>}
                  {fix.kind !== 'plant' && (
                    <span className="text-xs font-bold tracking-tight truncate">{fix.label}</span>
                  )}
                </div>

                {isSelected && isEditMode && (
                  <span className="absolute -top-5 left-0 text-[10px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded shadow">
                    {fix.label}
                  </span>
                )}

                {/* Vertex & Edge Resize Handles */}
                {renderSelectionHandles('fixture', fix.id, fix.x, fix.y, fix.width, fix.height)}
              </div>
            );
          })}

          {/* Tables Layer */}
          {tables.map((table) => {
            const pos = tablePositions.get(table.id) || {
              x: Number(table.positionX) || 100,
              y: Number(table.positionY) || 100,
              width: 100,
              height: 80,
              shape: table.shape || 'rect',
              capacity: table.capacity || 4,
              label: table.label,
            };

            const shape = pos.shape || table.shape || 'rect';
            const capacity = pos.capacity || table.capacity || 4;
            const width = pos.width || 100;
            const height = pos.height || 80;

            const isSelected = selectedId?.type === 'table' && selectedId.id === table.id;
            const statusStyle = getTableStatusStyle(table.status);

            return (
              <div
                key={table.id}
                onPointerDown={(e) => handleElementPointerDown(e, 'table', table.id, pos.x, pos.y)}
                onClick={(e) => {
                  if (isEditMode) {
                    e.stopPropagation();
                    setSelectedId({ type: 'table', id: table.id });
                  } else {
                    onSelectTable(table);
                  }
                }}
                className={`absolute group flex flex-col items-center justify-center p-2 border-2 transition-all duration-150 select-none ${
                  shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                } ${statusStyle.bg} ${statusStyle.border} ${statusStyle.glow} ${
                  isEditMode
                    ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-500/70'
                    : 'cursor-pointer hover:scale-105 active:scale-95'
                } ${isSelected ? 'ring-4 ring-amber-500 ring-offset-2 ring-offset-background' : ''}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  zIndex: 20,
                }}
              >
                {/* Visual Chairs around table */}
                {renderChairs(shape, capacity)}

                {/* Table Core Content */}
                <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base sm:text-lg font-black tracking-tight text-foreground leading-none">
                    {pos.label || table.label}
                  </span>

                  <div className="flex items-center space-x-1 mt-1 text-[11px] font-medium opacity-80">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span>{capacity}</span>
                  </div>

                  {/* Status Indicator Icon in Service Mode */}
                  {!isEditMode && (table.status === 'occupied' || table.status === 'check_requested') && (
                    <div
                      className={`flex items-center space-x-0.5 text-[10px] font-bold mt-1 ${
                        table.status === 'check_requested' ? 'text-purple-400' : 'text-amber-400'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{table.status === 'check_requested' ? 'Cuenta' : 'Ocupada'}</span>
                    </div>
                  )}
                </div>

                {/* Service Mode Transfer / Merge Quick Access */}
                {!isEditMode &&
                  (table.status === 'occupied' ||
                    table.status === 'check_requested' ||
                    table.status === 'paid_waiting_food') && (
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1 z-30 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onStartTransfer && (
                        <button
                          type="button"
                          onClick={() => onStartTransfer(table)}
                          className="p-1 rounded-md bg-card/95 hover:bg-muted border border-border shadow text-[10px] text-cyan-400"
                          title="Transferir mesa"
                        >
                          <ArrowRightLeft className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {onStartMerge && (
                        <button
                          type="button"
                          onClick={() => onStartMerge(table)}
                          className="p-1 rounded-md bg-card/95 hover:bg-muted border border-border shadow text-[10px] text-amber-400"
                          title="Unir mesas"
                        >
                          <GitMerge className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}

                {/* Vertex & Edge Resize Handles */}
                {renderSelectionHandles('table', table.id, pos.x, pos.y, width, height)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
