import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      {/* Backdrop overlay listener */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {children}
    </div>
  );
};

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  onClose?: () => void;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, maxWidth = 'md', onClose, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'relative w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 animate-in zoom-in-95 duration-150 my-auto',
        maxWidthMap[maxWidth],
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          title="Cerrar modal (Esc)"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer select-none"
        >
          <X className="size-4" />
          <span className="sr-only">Cerrar</span>
        </button>
      )}
      {children}
    </div>
  );
});
DialogContent.displayName = 'DialogContent';

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1 text-left mb-4 pr-6', className)}
    {...props}
  />
);

export const DialogTitle: React.FC<
  React.HTMLAttributes<HTMLHeadingElement>
> = ({ className, ...props }) => (
  <h2
    className={cn('text-base sm:text-lg font-bold text-white tracking-tight leading-tight', className)}
    {...props}
  />
);

export const DialogDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ...props }) => (
  <p className={cn('text-xs text-slate-400', className)} {...props} />
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 pt-4 border-t border-slate-800/80',
      className
    )}
    {...props}
  />
);
