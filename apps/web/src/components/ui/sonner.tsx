import React from 'react';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl font-sans',
          description: 'group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-amber-500 group-[.toast]:text-slate-950 font-medium',
          cancelButton:
            'group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400',
          error:
            'group-[.toaster]:!bg-rose-950/95 group-[.toaster]:!text-rose-100 group-[.toaster]:!border-rose-800/80',
          success:
            'group-[.toaster]:!bg-emerald-950/95 group-[.toaster]:!text-emerald-100 group-[.toaster]:!border-emerald-800/80',
          warning:
            'group-[.toaster]:!bg-amber-950/95 group-[.toaster]:!text-amber-100 group-[.toaster]:!border-amber-800/80',
          info:
            'group-[.toaster]:!bg-blue-950/95 group-[.toaster]:!text-blue-100 group-[.toaster]:!border-blue-800/80',
        },
      }}
      richColors
      position="top-right"
      {...props}
    />
  );
};

export { toast };
