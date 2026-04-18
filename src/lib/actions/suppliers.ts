"use server";

import { db } from "@/lib/db";
import { suppliers, purchases } from "@/lib/db/schema";
import { supplierSchema } from "@/lib/validations/suppliers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  return db.select().from(suppliers).orderBy(suppliers.nombre);
}

export async function getSupplier(id: number) {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id));
  return supplier ?? null;
}

export async function getSupplierWithPurchases(id: number) {
  const supplier = await getSupplier(id);
  if (!supplier) return null;

  const supplierPurchases = await db
    .select()
    .from(purchases)
    .where(eq(purchases.supplierId, id))
    .orderBy(purchases.fechaCompra);

  const totalComprado = supplierPurchases.reduce((sum, p) => sum + p.monto, 0);

  return { supplier, purchases: supplierPurchases, totalComprado };
}

export async function createSupplier(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = supplierSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await db.insert(suppliers).values({
    nombre: data.nombre,
    contacto: data.contacto || null,
    telefono: data.telefono || null,
    notas: data.notas || null,
  });

  revalidatePath("/proveedores");
  return { success: true };
}

export async function updateSupplier(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = supplierSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await db
    .update(suppliers)
    .set({
      nombre: data.nombre,
      contacto: data.contacto || null,
      telefono: data.telefono || null,
      notas: data.notas || null,
    })
    .where(eq(suppliers.id, id));

  revalidatePath("/proveedores");
  revalidatePath(`/proveedores/${id}`);
  return { success: true };
}

export async function deleteSupplier(id: number) {
  // Check if supplier has purchases
  const supplierPurchases = await db
    .select()
    .from(purchases)
    .where(eq(purchases.supplierId, id));

  if (supplierPurchases.length > 0) {
    return { error: "No se puede eliminar un proveedor con compras asociadas" };
  }

  await db.delete(suppliers).where(eq(suppliers.id, id));
  revalidatePath("/proveedores");
  return { success: true };
}
