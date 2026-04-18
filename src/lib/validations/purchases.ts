import { z } from "zod/v4";

export const purchaseSchema = z.object({
  jobId: z.coerce.number().positive("Selecciona un trabajo"),
  supplierId: z.coerce.number().positive("Selecciona un proveedor"),
  descripcion: z.string().min(1, "La descripcion es obligatoria"),
  monto: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
  fechaCompra: z.string().min(1, "La fecha es obligatoria"),
  fundingSourceId: z.coerce.number().optional(),
  marcarPagada: z.string().optional(),
  fechaPagoProveedor: z.string().optional(),
  notas: z.string().optional(),
});

export type PurchaseFormData = z.infer<typeof purchaseSchema>;

export const markPaidSchema = z.object({
  fundingSourceId: z.coerce.number().positive("Selecciona una fuente de fondos"),
  fechaPagoProveedor: z.string().min(1, "La fecha de pago es obligatoria"),
});
