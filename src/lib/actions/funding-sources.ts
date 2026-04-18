"use server";

import { db } from "@/lib/db";
import { fundingSources, cashMovements } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFundingSources() {
  return db.select().from(fundingSources).orderBy(fundingSources.id);
}

export async function getFundingSource(id: number) {
  const [fs] = await db
    .select()
    .from(fundingSources)
    .where(eq(fundingSources.id, id));
  return fs ?? null;
}

export async function getFundingSourcesWithBalances() {
  const sources = await getFundingSources();
  const movements = await db.select().from(cashMovements);

  return sources.map((source) => {
    const sourceMovements = movements.filter(
      (m) => m.fundingSourceId === source.id
    );
    const totalSalidas = sourceMovements
      .filter((m) => m.tipo === "salida")
      .reduce((sum, m) => sum + m.monto, 0);
    const totalReposiciones = sourceMovements
      .filter((m) => m.tipo === "entrada_reposicion")
      .reduce((sum, m) => sum + m.monto, 0);
    const saldoAfuera = totalSalidas - totalReposiciones;

    return {
      ...source,
      totalSalidas,
      totalReposiciones,
      saldoAfuera,
      movimientosCount: sourceMovements.length,
    };
  });
}

export async function getFundingSourceWithMovements(
  id: number,
  fechaDesde?: string,
  fechaHasta?: string
) {
  const source = await getFundingSource(id);
  if (!source) return null;

  let conditions = [eq(cashMovements.fundingSourceId, id)];
  if (fechaDesde) {
    conditions.push(gte(cashMovements.fecha, new Date(fechaDesde)));
  }
  if (fechaHasta) {
    conditions.push(lte(cashMovements.fecha, new Date(fechaHasta + "T23:59:59")));
  }

  const movements = await db
    .select()
    .from(cashMovements)
    .where(and(...conditions))
    .orderBy(cashMovements.fecha);

  const allMovements = await db
    .select()
    .from(cashMovements)
    .where(eq(cashMovements.fundingSourceId, id));

  const totalSalidas = allMovements
    .filter((m) => m.tipo === "salida")
    .reduce((sum, m) => sum + m.monto, 0);
  const totalReposiciones = allMovements
    .filter((m) => m.tipo === "entrada_reposicion")
    .reduce((sum, m) => sum + m.monto, 0);
  const saldoAfuera = totalSalidas - totalReposiciones;

  return {
    source,
    movements,
    totalSalidas,
    totalReposiciones,
    saldoAfuera,
  };
}

export async function toggleFundingSourceActive(id: number) {
  const source = await getFundingSource(id);
  if (!source) return { error: "Fuente no encontrada" };

  await db
    .update(fundingSources)
    .set({ activo: !source.activo })
    .where(eq(fundingSources.id, id));

  revalidatePath("/fuentes");
  revalidatePath(`/fuentes/${id}`);
  return { success: true };
}
