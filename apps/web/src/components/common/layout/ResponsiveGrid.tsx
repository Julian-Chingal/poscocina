import React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: '2' | '3' | '4' | '5' | '6';
  gap?: '3' | '4' | '6';
  children: React.ReactNode;
}

const columnVariants = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '5': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  '6': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
};

const gapVariants = {
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
};

/**
 * Cuadrícula estandarizada que preserva el ancho invariable de celdas
 * con minmax(0, 1fr) independientemente de la cantidad de registros (1 o N).
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  columns = '5',
  gap = '4',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full min-w-0 grid auto-rows-fr',
        columnVariants[columns],
        gapVariants[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
