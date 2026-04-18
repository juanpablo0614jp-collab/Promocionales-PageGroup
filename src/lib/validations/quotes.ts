import { z } from "zod/v4";

export const quoteSchema = z.object({
  fechaSolicitud: z.string().min(1, "La fecha es obligatoria"),
  contactId: z.coerce.number().positive("Selecciona un contacto"),
  descripcion: z.string().min(1, "La descripcion es obligatoria"),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().int().positive("El precio debe ser mayor a 0"),
  fechaVencimiento: z.string().optional(),
  notas: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

export const quoteStatusSchema = z.enum([
  "pendiente_respuesta",
  "aprobada",
  "rechazada",
  "vencida",
]);
