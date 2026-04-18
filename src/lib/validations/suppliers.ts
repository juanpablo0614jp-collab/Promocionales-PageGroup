import { z } from "zod/v4";

export const supplierSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  notas: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
