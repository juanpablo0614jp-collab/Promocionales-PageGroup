import { z } from "zod/v4";

export const paymentReceivedSchema = z.object({
  jobId: z.coerce.number().positive("Selecciona un trabajo"),
  monto: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  notas: z.string().optional(),
});

export type PaymentReceivedFormData = z.infer<typeof paymentReceivedSchema>;

// Each distribution line: fundingSourceId + monto
export const distributionLineSchema = z.object({
  fundingSourceId: z.coerce.number().positive(),
  monto: z.coerce.number().int().positive(),
});
