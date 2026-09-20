import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { PasswordLoginSchema, PasswordLoginFormValues } from '../schemas/auth.schemas';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordLoginFormProps {
  onSubmit: (values: PasswordLoginFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const form = useForm<PasswordLoginFormValues>({
    resolver: zodResolver(PasswordLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="admin@poscocina.com"
                    className="pl-9 h-10 rounded-xl"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-10 rounded-xl"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading || form.formState.isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}</span>
        </Button>
      </form>
    </Form>
  );
};
