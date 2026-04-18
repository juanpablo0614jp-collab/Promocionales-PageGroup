import { z } from "zod/v4";

export const contactSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.email("Email invalido").optional().or(z.literal("")),
  cargo: z.string().optional(),
  notas: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
