import React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
  children: React.ReactNode;
}

const maxWidthMap = {
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-full',
};

/**
 * Contenedor estructural estándar para todas las vistas principales de la aplicación.
 * Garantiza contención rígida (w-full min-w-0), centrado y paddings simétricos.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  maxWidth = '7xl',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full min-w-0 mx-auto p-4 sm:p-6 lg:p-8 flex flex-col flex-1',
        maxWidthMap[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
