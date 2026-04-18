"use server";

import { db } from "@/lib/db";
import { purchases, jobs, suppliers, fundingSources } from "@/lib/db/schema";
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

  await db.insert(purchases).values({
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
  });

  revalidatePath("/compras");
  revalidatePath(`/trabajos/${data.jobId}`);
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

  await db
    .update(purchases)
    .set({
      estadoPagoProveedor: "pagado",
      fundingSourceId: data.fundingSourceId,
      fechaPagoProveedor: new Date(data.fechaPagoProveedor),
    })
    .where(eq(purchases.id, id));

  revalidatePath("/compras");
  revalidatePath(`/trabajos/${purchase.jobId}`);
  return { success: true };
}

export async function deletePurchase(id: number) {
  const purchase = await getPurchase(id);
  if (!purchase) return { error: "Compra no encontrada" };

  await db.delete(purchases).where(eq(purchases.id, id));
  revalidatePath("/compras");
  revalidatePath(`/trabajos/${purchase.jobId}`);
  return { success: true };
}
