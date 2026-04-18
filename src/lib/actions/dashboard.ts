"use server";

import { db } from "@/lib/db";
import { quotes, jobs, fundingSources, cashMovements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addDays, differenceInDays } from "date-fns";

export async function getDashboardData() {
  const [allQuotes, allJobs, allFundingSources, allMovements] = await Promise.all([
    db.select().from(quotes),
    db.select().from(jobs),
    db.select().from(fundingSources).where(eq(fundingSources.activo, true)),
    db.select().from(cashMovements),
  ]);

  const pendingQuotes = allQuotes.filter(
    (q) => q.estado === "pendiente_respuesta"
  );
  const jobsInProduction = allJobs.filter(
    (j) => j.estado === "en_produccion"
  );
  const invoicedJobs = allJobs.filter((j) => j.estado === "facturado");

  const now = new Date();
  const staleQuotes = pendingQuotes.filter((q) => {
    const days = differenceInDays(now, new Date(q.fechaSolicitud));
    return days > 5;
  });

  const upcomingPayments = invoicedJobs
    .filter((j) => j.fechaEmisionCc)
    .map((j) => {
      const fechaEsperada = addDays(new Date(j.fechaEmisionCc!), 45);
      const diasRestantes = differenceInDays(fechaEsperada, now);
      const quote = allQuotes.find((q) => q.id === j.quoteId);
      return {
        jobId: j.id,
        jobCodigo: j.codigo,
        quoteCodigo: quote?.codigo ?? "",
        precioTotal: quote?.precioTotal ?? 0,
        fechaEsperada,
        diasRestantes,
        vencido: diasRestantes < 0,
      };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  const totalCuentasPorCobrar = invoicedJobs.reduce((sum, j) => {
    const quote = allQuotes.find((q) => q.id === j.quoteId);
    return sum + (quote?.precioTotal ?? 0);
  }, 0);

  // Calculate saldo afuera per funding source
  const fundingSourcesWithBalance = allFundingSources.map((source) => {
    const sourceMovements = allMovements.filter(
      (m) => m.fundingSourceId === source.id
    );
    const totalSalidas = sourceMovements
      .filter((m) => m.tipo === "salida")
      .reduce((sum, m) => sum + m.monto, 0);
    const totalReposiciones = sourceMovements
      .filter((m) => m.tipo === "entrada_reposicion")
      .reduce((sum, m) => sum + m.monto, 0);

    return {
      id: source.id,
      nombre: source.nombre,
      tipo: source.tipo,
      saldoAfuera: totalSalidas - totalReposiciones,
    };
  });

  return {
    cotizacionesPendientes: pendingQuotes.length,
    trabajosEnProduccion: jobsInProduction.length,
    trabajosFacturados: invoicedJobs.length,
    totalCuentasPorCobrar,
    fundingSources: fundingSourcesWithBalance,
    staleQuotes: staleQuotes.map((q) => ({
      id: q.id,
      codigo: q.codigo,
      descripcion: q.descripcion,
      fechaSolicitud: q.fechaSolicitud,
      diasSinRespuesta: differenceInDays(now, new Date(q.fechaSolicitud)),
    })),
    upcomingPayments,
  };
}
