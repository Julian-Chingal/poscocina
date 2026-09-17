import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const buttonVariants = ({
  variant = 'default',
  size = 'default',
  className = '',
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    default: 'bg-orange-600 text-white shadow-sm hover:bg-orange-500 active:bg-orange-700',
    destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700',
    outline:
      'border border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 hover:text-white',
    secondary: 'bg-slate-800 text-slate-200 shadow-sm hover:bg-slate-700 hover:text-white',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    link: 'text-orange-400 underline-offset-4 hover:underline',
    accent: 'bg-amber-600 text-white shadow-sm hover:bg-amber-500',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    default: 'h-8 px-3 py-1.5',
    sm: 'h-7 rounded-md px-2.5 text-[11px]',
    lg: 'h-10 rounded-xl px-5 text-sm',
    icon: 'h-8 w-8',
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
