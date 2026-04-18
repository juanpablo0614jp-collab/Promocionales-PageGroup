import { z } from "zod/v4";

export const jobStatusSchema = z.enum([
  "en_produccion",
  "entregado",
  "facturado",
  "cobrado",
]);

export const emitCuentaCobroSchema = z.object({
  numeroCuentaCobro: z.string().min(1, "El numero de cuenta de cobro es obligatorio"),
  fechaEmisionCc: z.string().min(1, "La fecha de emision es obligatoria"),
});

export type EmitCuentaCobroData = z.infer<typeof emitCuentaCobroSchema>;
