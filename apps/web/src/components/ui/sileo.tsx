import React from 'react';
import {
  Toaster as SileoBaseToaster,
  sileo,
  type SileoOptions,
  type SileoPosition,
} from 'sileo';
import { useTheme } from 'next-themes';

export type ToastOptions = Partial<SileoOptions> & {
  id?: string;
  description?: React.ReactNode;
  duration?: number | null;
  position?: SileoPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
};

let toastCounter = 0;
const generateUniqueId = () =>
  `sileo_${Date.now()}_${++toastCounter}_${Math.random().toString(36).slice(2, 7)}`;

function normalizeToastArgs(
  messageOrOpts: string | React.ReactNode | Partial<SileoOptions>,
  extraOpts?: ToastOptions | string
): SileoOptions & { id: string } {
  const autoId = generateUniqueId();

  if (typeof messageOrOpts === 'string' || React.isValidElement(messageOrOpts)) {
    const extra =
      typeof extraOpts === 'string'
        ? { description: extraOpts }
        : extraOpts || {};

    const button = extra.action
      ? { title: extra.action.label, onClick: extra.action.onClick }
      : (extra as any).button;

    return {
      id: extra.id || autoId,
      title: typeof messageOrOpts === 'string' ? messageOrOpts : undefined,
      description:
        extra.description || (typeof messageOrOpts !== 'string' ? messageOrOpts : undefined),
      duration: extra.duration !== undefined ? extra.duration : 4500,
      position: extra.position || 'bottom-right',
      button,
      ...extra,
    };
  }

  const opts = (messageOrOpts || {}) as SileoOptions & {
    id?: string;
    action?: { label: string; onClick: () => void };
  };
  const button = opts.action
    ? { title: opts.action.label, onClick: opts.action.onClick }
    : opts.button;

  return {
    id: opts.id || autoId,
    duration: opts.duration !== undefined ? opts.duration : 4500,
    position: opts.position || 'bottom-right',
    ...opts,
    button,
  };
}

/**
 * Universal Sileo Toast Adapter
 * Provides a drop-in API compatible with Sonner & standard React toast calls,
 * powered by Sileo's gooey SVG morphing animations and physics.
 */
export const toast = Object.assign(
  (message: string | React.ReactNode, opts?: ToastOptions) => {
    return sileo.show(normalizeToastArgs(message, opts));
  },
  {
    success: (message: string | React.ReactNode, opts?: ToastOptions) => {
      return sileo.success(normalizeToastArgs(message, opts));
    },
    error: (message: string | React.ReactNode, opts?: ToastOptions) => {
      return sileo.error(normalizeToastArgs(message, opts));
    },
    warning: (message: string | React.ReactNode, opts?: ToastOptions) => {
      return sileo.warning(normalizeToastArgs(message, opts));
    },
    info: (message: string | React.ReactNode, opts?: ToastOptions) => {
      return sileo.info(normalizeToastArgs(message, opts));
    },
    action: (message: string | React.ReactNode, opts?: ToastOptions) => {
      return sileo.action(normalizeToastArgs(message, opts));
    },
    loading: (message: string | React.ReactNode, opts?: ToastOptions) => {
      return sileo.show({
        ...normalizeToastArgs(message, opts),
        type: 'loading',
        duration: null,
      });
    },
    promise: <T,>(
      promise: Promise<T> | (() => Promise<T>),
      opts: {
        loading: string | SileoOptions;
        success: string | SileoOptions | ((data: T) => string | SileoOptions);
        error: string | SileoOptions | ((err: unknown) => string | SileoOptions);
        action?: string | SileoOptions | ((data: T) => string | SileoOptions);
        position?: SileoPosition;
      }
    ) => {
      const formatOpt = (
        val: string | SileoOptions | ((arg: any) => string | SileoOptions)
      ) => {
        if (typeof val === 'function') {
          return (arg: any) => {
            const res = val(arg);
            return typeof res === 'string' ? { title: res } : res;
          };
        }
        return typeof val === 'string' ? { title: val } : val;
      };

      return sileo.promise(promise, {
        loading:
          typeof opts.loading === 'string' ? { title: opts.loading } : opts.loading,
        success: formatOpt(opts.success) as any,
        error: formatOpt(opts.error) as any,
        action: opts.action ? (formatOpt(opts.action) as any) : undefined,
        position: opts.position,
      });
    },
    dismiss: (id?: string) => {
      if (id) {
        sileo.dismiss(id);
      } else {
        sileo.clear();
      }
    },
    clear: (position?: SileoPosition) => {
      sileo.clear(position);
    },
  }
);

export type ToasterProps = React.ComponentProps<typeof SileoBaseToaster>;

export const Toaster: React.FC<ToasterProps> = ({
  position = 'bottom-right',
  offset,
  options,
  theme: explicitTheme,
  ...props
}) => {
  const { resolvedTheme } = useTheme();
  const theme = explicitTheme || (resolvedTheme === 'dark' ? 'dark' : 'light');

  return (
    <SileoBaseToaster
      position={position}
      offset={offset}
      options={options}
      theme={theme as 'light' | 'dark'}
      {...props}
    />
  );
};

export { sileo };
export default Toaster;
