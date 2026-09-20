import { z } from 'zod';

export const CloseShiftSchema = z.object({
  closingAmount: z
    .string()
    .min(1, 'Debes ingresar el monto contado')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'El monto debe ser un número igual o mayor a cero',
    }),
  closingNotes: z.string(),
});

export type CloseShiftFormValues = z.infer<typeof CloseShiftSchema>;
