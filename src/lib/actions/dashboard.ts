"use server";

import { db } from "@/lib/db";
import { quotes, jobs, fundingSources } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { addDays, differenceInDays } from "date-fns";

export async function getDashboardData() {
  const [allQuotes, allJobs, allFundingSources] = await Promise.all([
    db.select().from(quotes),
    db.select().from(jobs),
    db.select().from(fundingSources).where(eq(fundingSources.activo, true)),
  ]);

  const pendingQuotes = allQuotes.filter(
    (q) => q.estado === "pendiente_respuesta"
  );
  const jobsInProduction = allJobs.filter(
    (j) => j.estado === "en_produccion"
  );
  const invoicedJobs = allJobs.filter((j) => j.estado === "facturado");

  // Cotizaciones pendientes con mas de 5 dias sin respuesta
  const now = new Date();
  const staleQuotes = pendingQuotes.filter((q) => {
    const days = differenceInDays(now, new Date(q.fechaSolicitud));
    return days > 5;
  });

  // Proximos pagos esperados (trabajos facturados)
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

  // Total cuentas por cobrar
  const totalCuentasPorCobrar = invoicedJobs.reduce((sum, j) => {
    const quote = allQuotes.find((q) => q.id === j.quoteId);
    return sum + (quote?.precioTotal ?? 0);
  }, 0);

  return {
    cotizacionesPendientes: pendingQuotes.length,
    trabajosEnProduccion: jobsInProduction.length,
    trabajosFacturados: invoicedJobs.length,
    totalCuentasPorCobrar,
    fundingSources: allFundingSources,
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
