import React from 'react';
import { SubNavGroup } from './sub-nav.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export * from './sub-nav.types';

export interface SubNavLayoutProps {
  title: string;
  subtitle?: string;
  category?: string;
  headerActions?: React.ReactNode;
  groups: SubNavGroup[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const SubNavLayout: React.FC<SubNavLayoutProps> = ({
  title,
  subtitle,
  category,
  headerActions,
  groups,
  activeItemId,
  onSelectItem,
  children,
  className,
}) => {
  const allItems = groups.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.id === activeItemId) || allItems[0];
  const ActiveIcon = activeItem?.icon;

  return (
    <div className={cn('w-full min-w-0 max-w-7xl mx-auto p-4 sm:p-6 lg:p-10', className)}>
      {/* 1. Encabezado Superior */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          {category && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <span>{category}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {headerActions && <div className="flex items-center space-x-3 shrink-0">{headerActions}</div>}
      </header>

      {/* 2. Selector Mobile con DropdownMenu de shadcn/ui (< lg) */}
      <div className="block lg:hidden mt-6 w-full min-w-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 px-4 rounded-xl border-border bg-card hover:bg-muted/50 transition cursor-pointer text-xs font-semibold"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {ActiveIcon && <ActiveIcon className="w-4 h-4 text-primary shrink-0" />}
                <div className="flex flex-col text-left truncate">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Sección Actual
                  </span>
                  <span className="truncate text-foreground font-bold">{activeItem?.label || 'Seleccionar sección'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {activeItem?.badge !== undefined && (
                  <Badge variant={activeItem.badgeVariant || 'secondary'} className="text-[10px] px-2 py-0.5 font-mono">
                    {activeItem.badge}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-y-auto p-1.5 rounded-xl border-border shadow-xl"
          >
            {groups.map((group, gIdx) => (
              <React.Fragment key={group.id || gIdx}>
                {gIdx > 0 && <DropdownMenuSeparator className="my-1" />}
                {group.heading && (
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 py-1.5">
                    {group.heading}
                  </DropdownMenuLabel>
                )}
                {group.items.map((item) => {
                  const isSelected = item.id === activeItemId;
                  const ItemIcon = item.icon;

                  return (
                    <DropdownMenuItem
                      key={item.id}
                      disabled={item.disabled}
                      onClick={() => onSelectItem(item.id)}
                      className={cn(
                        'flex items-center justify-between text-xs py-2.5 px-3 rounded-lg cursor-pointer transition',
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold focus:bg-primary/15 focus:text-primary'
                          : 'text-foreground focus:bg-muted/70'
                      )}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {ItemIcon && (
                          <ItemIcon
                            className={cn('w-4 h-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <Badge
                          variant={item.badgeVariant || (isSelected ? 'default' : 'secondary')}
                          className="text-[10px] px-1.5 py-0.5 ml-2 font-mono shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 3. Contenedor Principal a Dos Columnas (Sidebar + Contenido) */}
      <div className="w-full min-w-0 flex flex-col lg:flex-row gap-8 items-start mt-6 lg:mt-8">
        {/* Columna Izquierda: Sidebar Vertical Rígido e Inmutable para Escritorio (lg+) */}
        <aside className="hidden lg:block w-64 min-w-[16rem] max-w-[16rem] shrink-0 space-y-6 sticky top-6">
          {groups.map((group, groupIdx) => (
            <div key={group.id || groupIdx} className="space-y-1">
              {group.heading && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-3 py-1">
                  {group.heading}
                </div>
              )}

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.id === activeItemId;
                  const Icon = item.icon;

                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      type="button"
                      disabled={item.disabled}
                      onClick={() => onSelectItem(item.id)}
                      className={cn(
                        'w-full justify-between h-auto py-2.5 px-3 rounded-xl transition text-xs cursor-pointer',
                        isActive
                          ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary shadow-xs hover:bg-primary/15 hover:text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium'
                      )}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {Icon && (
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0 transition-colors',
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <Badge
                          variant={item.badgeVariant || (isActive ? 'default' : 'secondary')}
                          className="text-[10px] px-1.5 py-0.5 h-auto rounded-full font-mono ml-2 shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* Columna Derecha: Área de Contenido Dinámico */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
