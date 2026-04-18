"use server";

import { db } from "@/lib/db";
import { purchases, cashMovements } from "@/lib/db/schema";
import { purchaseSchema, markPaidSchema } from "@/lib/validations/purchases";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  return db.select().from(purchases).orderBy(purchases.createdAt);
}

export async function getPurchase(id: number) {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, id));
  return purchase ?? null;
}

export async function createPurchase(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = purchaseSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const marcarPagada = data.marcarPagada === "true";

  if (marcarPagada && !data.fundingSourceId) {
    return { error: "Selecciona una fuente de fondos para marcar como pagada" };
  }

  await db.transaction(async (tx) => {
    const [newPurchase] = await tx.insert(purchases).values({
      jobId: data.jobId,
      supplierId: data.supplierId,
      descripcion: data.descripcion,
      monto: data.monto,
      fechaCompra: new Date(data.fechaCompra),
      fundingSourceId: marcarPagada ? data.fundingSourceId : null,
      estadoPagoProveedor: marcarPagada ? "pagado" : "pendiente",
      fechaPagoProveedor: marcarPagada && data.fechaPagoProveedor
        ? new Date(data.fechaPagoProveedor)
        : null,
      notas: data.notas || null,
    }).returning();

    if (marcarPagada && data.fundingSourceId) {
      await tx.insert(cashMovements).values({
        tipo: "salida",
        fundingSourceId: data.fundingSourceId,
        monto: data.monto,
        fecha: data.fechaPagoProveedor
          ? new Date(data.fechaPagoProveedor)
          : new Date(data.fechaCompra),
        purchaseId: newPurchase.id,
        notas: `Pago compra: ${data.descripcion}`,
      });
    }
  });

  revalidatePath("/compras");
  revalidatePath(`/trabajos/${data.jobId}`);
  revalidatePath("/fuentes");
  return { success: true };
}

export async function markPurchasePaid(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = markPaidSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const purchase = await getPurchase(id);
  if (!purchase) return { error: "Compra no encontrada" };
  if (purchase.estadoPagoProveedor === "pagado") {
    return { error: "Esta compra ya esta marcada como pagada" };
  }

  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(purchases)
      .set({
        estadoPagoProveedor: "pagado",
        fundingSourceId: data.fundingSourceId,
        fechaPagoProveedor: new Date(data.fechaPagoProveedor),
      })
      .where(eq(purchases.id, id));

    await tx.insert(cashMovements).values({
      tipo: "salida",
      fundingSourceId: data.fundingSourceId,
      monto: purchase.monto,
      fecha: new Date(data.fechaPagoProveedor),
      purchaseId: id,
      notas: `Pago compra: ${purchase.descripcion}`,
    });
  });

  revalidatePath("/compras");
  revalidatePath(`/trabajos/${purchase.jobId}`);
  revalidatePath("/fuentes");
  return { success: true };
}

export async function deletePurchase(id: number) {
  const purchase = await getPurchase(id);
  if (!purchase) return { error: "Compra no encontrada" };

  await db.transaction(async (tx) => {
    // Delete related cash movements first
    await tx.delete(cashMovements).where(eq(cashMovements.purchaseId, id));
    await tx.delete(purchases).where(eq(purchases.id, id));
  });

  revalidatePath("/compras");
  revalidatePath(`/trabajos/${purchase.jobId}`);
  revalidatePath("/fuentes");
  return { success: true };
}
