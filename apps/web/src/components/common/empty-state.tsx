import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <Card
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center select-none border-dashed border-border bg-card/40',
        className
      )}
    >
      <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-inner">
        <Icon className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mt-1">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-4 border-border hover:border-primary/50 hover:text-primary cursor-pointer"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};
