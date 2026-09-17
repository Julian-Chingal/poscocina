import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center select-none rounded-2xl border border-dashed border-slate-800 bg-slate-900/30',
        className
      )}
    >
      <div className="size-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <Icon className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mt-1">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-4 border-slate-700 hover:border-orange-500/50 hover:text-orange-400"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
