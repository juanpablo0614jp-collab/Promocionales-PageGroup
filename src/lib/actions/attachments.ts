"use server";

import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/csv",
];

export async function uploadAttachment(jobId: number, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Selecciona un archivo" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "El archivo no puede superar 10 MB" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      error:
        "Tipo de archivo no permitido. Usa imagenes, PDF, Excel, Word o CSV.",
    };
  }

  const blob = await put(`trabajos/${jobId}/${file.name}`, file, {
    access: "public",
  });

  await db.insert(attachments).values({
    jobId,
    nombre: file.name,
    url: blob.url,
    tipo: file.type,
    tamano: file.size,
  });

  revalidatePath(`/trabajos/${jobId}`);
  return { success: true };
}

export async function deleteAttachment(id: number) {
  const [attachment] = await db
    .select()
    .from(attachments)
    .where(eq(attachments.id, id));

  if (!attachment) return { error: "Archivo no encontrado" };

  await del(attachment.url);
  await db.delete(attachments).where(eq(attachments.id, id));

  revalidatePath(`/trabajos/${attachment.jobId}`);
  return { success: true };
}

export async function getAttachments(jobId: number) {
  return db
    .select()
    .from(attachments)
    .where(eq(attachments.jobId, jobId))
    .orderBy(attachments.createdAt);
}
