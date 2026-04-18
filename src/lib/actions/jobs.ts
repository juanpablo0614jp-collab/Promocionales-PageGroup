"use server";

import { db } from "@/lib/db";
import { jobs, quotes, purchases, paymentsReceived } from "@/lib/db/schema";
import { emitCuentaCobroSchema } from "@/lib/validations/jobs";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getJobs(estado?: string) {
  const allJobs = estado && estado !== "todos"
    ? await db
        .select()
        .from(jobs)
        .where(eq(jobs.estado, estado as "en_produccion" | "entregado" | "facturado" | "cobrado"))
        .orderBy(jobs.createdAt)
    : await db.select().from(jobs).orderBy(jobs.createdAt);

  return allJobs;
}

export async function getJob(id: number) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
  return job ?? null;
}

export async function getJobWithDetails(id: number) {
  const job = await getJob(id);
  if (!job) return null;

  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, job.quoteId));

  const jobPurchases = await db
    .select()
    .from(purchases)
    .where(eq(purchases.jobId, id));

  const jobPayments = await db
    .select()
    .from(paymentsReceived)
    .where(eq(paymentsReceived.jobId, id));

  const totalCompras = jobPurchases.reduce((sum, p) => sum + p.monto, 0);
  const totalCobrado = jobPayments.reduce((sum, p) => sum + p.monto, 0);
  const precioVenta = quote?.precioTotal ?? 0;
  const margenBruto = precioVenta - totalCompras;
  const pendienteCobro = precioVenta - totalCobrado;

  return {
    job,
    quote,
    purchases: jobPurchases,
    payments: jobPayments,
    kpis: {
      precioVenta,
      totalCompras,
      margenBruto,
      totalCobrado,
      pendienteCobro,
    },
  };
}

export async function advanceJobStatus(id: number) {
  const job = await getJob(id);
  if (!job) return { error: "Trabajo no encontrado" };

  const transitions: Record<string, string> = {
    en_produccion: "entregado",
  };

  const nextStatus = transitions[job.estado];
  if (!nextStatus) {
    return { error: "No se puede avanzar el estado de este trabajo desde su estado actual" };
  }

  await db
    .update(jobs)
    .set({
      estado: nextStatus as "entregado",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id));

  revalidatePath("/trabajos");
  revalidatePath(`/trabajos/${id}`);
  return { success: true };
}

export async function emitCuentaCobro(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = emitCuentaCobroSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const job = await getJob(id);
  if (!job) return { error: "Trabajo no encontrado" };
  if (job.estado !== "entregado") {
    return { error: "Solo se puede facturar un trabajo entregado" };
  }

  const data = parsed.data;

  await db
    .update(jobs)
    .set({
      estado: "facturado",
      numeroCuentaCobro: data.numeroCuentaCobro,
      fechaEmisionCc: new Date(data.fechaEmisionCc),
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id));

  revalidatePath("/trabajos");
  revalidatePath(`/trabajos/${id}`);
  return { success: true };
}

export async function updateJobNotes(id: number, notas: string) {
  await db
    .update(jobs)
    .set({ notas, updatedAt: new Date() })
    .where(eq(jobs.id, id));

  revalidatePath(`/trabajos/${id}`);
  return { success: true };
}
