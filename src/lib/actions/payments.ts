"use server";

import { db } from "@/lib/db";
import { paymentsReceived, cashMovements, jobs, quotes } from "@/lib/db/schema";
import { paymentReceivedSchema } from "@/lib/validations/payments";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface DistributionLine {
  fundingSourceId: number;
  monto: number;
}

export async function createPaymentReceived(
  formData: FormData,
  distributions: DistributionLine[]
) {
  const raw = Object.fromEntries(formData);
  const parsed = paymentReceivedSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Validate distribution total doesn't exceed payment
  const totalDistributed = distributions.reduce((sum, d) => sum + d.monto, 0);
  if (totalDistributed > data.monto) {
    return { error: "El total distribuido no puede exceder el monto del pago" };
  }

  await db.transaction(async (tx) => {
    // Create the payment received record
    const [payment] = await tx
      .insert(paymentsReceived)
      .values({
        jobId: data.jobId,
        monto: data.monto,
        fecha: new Date(data.fecha),
        notas: data.notas || null,
      })
      .returning();

    // Create cash movements for each distribution (reposicion)
    for (const dist of distributions) {
      if (dist.monto > 0) {
        await tx.insert(cashMovements).values({
          tipo: "entrada_reposicion",
          fundingSourceId: dist.fundingSourceId,
          monto: dist.monto,
          fecha: new Date(data.fecha),
          paymentReceivedId: payment.id,
          notas: `Reposicion desde pago de trabajo`,
        });
      }
    }

    // Check if job is now fully paid -> transition to cobrado
    const allPayments = await tx
      .select()
      .from(paymentsReceived)
      .where(eq(paymentsReceived.jobId, data.jobId));

    const totalPaid = allPayments.reduce((sum, p) => sum + p.monto, 0);

    const [job] = await tx
      .select()
      .from(jobs)
      .where(eq(jobs.id, data.jobId));

    if (job) {
      const [quote] = await tx
        .select()
        .from(quotes)
        .where(eq(quotes.id, job.quoteId));

      if (quote && totalPaid >= quote.precioTotal && job.estado === "facturado") {
        await tx
          .update(jobs)
          .set({
            estado: "cobrado",
            fechaRealPago: new Date(data.fecha),
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, data.jobId));
      }
    }
  });

  revalidatePath(`/trabajos/${data.jobId}`);
  revalidatePath("/trabajos");
  revalidatePath("/fuentes");
  revalidatePath("/");
  return { success: true };
}

export async function deletePaymentReceived(id: number) {
  const [payment] = await db
    .select()
    .from(paymentsReceived)
    .where(eq(paymentsReceived.id, id));

  if (!payment) return { error: "Pago no encontrado" };

  await db.transaction(async (tx) => {
    // Delete associated cash movements
    await tx
      .delete(cashMovements)
      .where(eq(cashMovements.paymentReceivedId, id));

    // Delete the payment
    await tx.delete(paymentsReceived).where(eq(paymentsReceived.id, id));

    // Check if job should revert from cobrado
    const [job] = await tx
      .select()
      .from(jobs)
      .where(eq(jobs.id, payment.jobId));

    if (job && job.estado === "cobrado") {
      const remainingPayments = await tx
        .select()
        .from(paymentsReceived)
        .where(eq(paymentsReceived.jobId, payment.jobId));

      const totalRemaining = remainingPayments.reduce(
        (sum, p) => sum + p.monto,
        0
      );

      const [quote] = await tx
        .select()
        .from(quotes)
        .where(eq(quotes.id, job.quoteId));

      if (quote && totalRemaining < quote.precioTotal) {
        await tx
          .update(jobs)
          .set({
            estado: "facturado",
            fechaRealPago: null,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, payment.jobId));
      }
    }
  });

  revalidatePath(`/trabajos/${payment.jobId}`);
  revalidatePath("/trabajos");
  revalidatePath("/fuentes");
  revalidatePath("/");
  return { success: true };
}
