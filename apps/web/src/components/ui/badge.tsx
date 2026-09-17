import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info';
}

const badgeVariants = ({
  variant = 'default',
  className = '',
}: {
  variant?: BadgeProps['variant'];
  className?: string;
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none select-none';

  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'border-transparent bg-orange-600 text-white shadow hover:bg-orange-500',
    secondary:
      'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700',
    destructive:
      'border-rose-700/50 bg-rose-950/60 text-rose-300 hover:bg-rose-900/60',
    outline: 'border-slate-700 text-slate-300',
    success:
      'border-emerald-700/50 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60',
    warning:
      'border-amber-700/50 bg-amber-950/60 text-amber-400 hover:bg-amber-900/60',
    info: 'border-blue-700/50 bg-blue-950/60 text-blue-400 hover:bg-blue-900/60',
  };

  return cn(baseStyles, variants[variant], className);
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  return <div className={badgeVariants({ variant, className })} {...props} />;
};
