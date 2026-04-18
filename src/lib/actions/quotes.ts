"use server";

import { db } from "@/lib/db";
import { quotes, jobs } from "@/lib/db/schema";
import { quoteSchema } from "@/lib/validations/quotes";
import { eq, sql, and, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function generateQuoteCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `COT-${year}-`;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(like(quotes.codigo, `${prefix}%`));

  const num = (result?.count ?? 0) + 1;
  return `${prefix}${String(num).padStart(3, "0")}`;
}

async function generateJobCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TRB-${year}-`;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(like(jobs.codigo, `${prefix}%`));

  const num = (result?.count ?? 0) + 1;
  return `${prefix}${String(num).padStart(3, "0")}`;
}

export async function getQuotes(estado?: string) {
  if (estado && estado !== "todos") {
    return db
      .select()
      .from(quotes)
      .where(eq(quotes.estado, estado as "pendiente_respuesta" | "aprobada" | "rechazada" | "vencida"))
      .orderBy(quotes.createdAt);
  }
  return db.select().from(quotes).orderBy(quotes.createdAt);
}

export async function getQuote(id: number) {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  return quote ?? null;
}

export async function createQuote(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = quoteSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const codigo = await generateQuoteCode();
  const precioTotal = data.cantidad * data.precioUnitario;

  await db.insert(quotes).values({
    codigo,
    fechaSolicitud: new Date(data.fechaSolicitud),
    contactId: data.contactId,
    descripcion: data.descripcion,
    cantidad: data.cantidad,
    precioUnitario: data.precioUnitario,
    precioTotal,
    fechaVencimiento: data.fechaVencimiento
      ? new Date(data.fechaVencimiento)
      : null,
    notas: data.notas || null,
  });

  revalidatePath("/cotizaciones");
  return { success: true };
}

export async function updateQuote(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = quoteSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const precioTotal = data.cantidad * data.precioUnitario;

  await db
    .update(quotes)
    .set({
      fechaSolicitud: new Date(data.fechaSolicitud),
      contactId: data.contactId,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      precioUnitario: data.precioUnitario,
      precioTotal,
      fechaVencimiento: data.fechaVencimiento
        ? new Date(data.fechaVencimiento)
        : null,
      notas: data.notas || null,
      updatedAt: new Date(),
    })
    .where(eq(quotes.id, id));

  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  return { success: true };
}

export async function approveQuote(id: number) {
  const quote = await getQuote(id);
  if (!quote) return { error: "Cotizacion no encontrada" };
  if (quote.estado !== "pendiente_respuesta") {
    return { error: "Solo se pueden aprobar cotizaciones pendientes de respuesta" };
  }

  const jobCode = await generateJobCode();

  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({ estado: "aprobada", updatedAt: new Date() })
      .where(eq(quotes.id, id));

    await tx.insert(jobs).values({
      codigo: jobCode,
      quoteId: id,
      fechaAprobacion: new Date(),
      estado: "en_produccion",
    });
  });

  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  revalidatePath("/trabajos");
  return { success: true };
}

export async function rejectQuote(id: number) {
  const quote = await getQuote(id);
  if (!quote) return { error: "Cotizacion no encontrada" };
  if (quote.estado !== "pendiente_respuesta") {
    return { error: "Solo se pueden rechazar cotizaciones pendientes de respuesta" };
  }

  await db
    .update(quotes)
    .set({ estado: "rechazada", updatedAt: new Date() })
    .where(eq(quotes.id, id));

  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  return { success: true };
}

export async function expireQuote(id: number) {
  const quote = await getQuote(id);
  if (!quote) return { error: "Cotizacion no encontrada" };
  if (quote.estado !== "pendiente_respuesta") {
    return { error: "Solo se pueden vencer cotizaciones pendientes de respuesta" };
  }

  await db
    .update(quotes)
    .set({ estado: "vencida", updatedAt: new Date() })
    .where(eq(quotes.id, id));

  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  return { success: true };
}

export async function deleteQuote(id: number) {
  const quote = await getQuote(id);
  if (!quote) return { error: "Cotizacion no encontrada" };
  if (quote.estado === "aprobada") {
    return { error: "No se puede eliminar una cotizacion aprobada" };
  }

  await db.delete(quotes).where(eq(quotes.id, id));
  revalidatePath("/cotizaciones");
  return { success: true };
}
