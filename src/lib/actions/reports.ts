"use server";

import { db } from "@/lib/db";
import {
  quotes,
  jobs,
  purchases,
  paymentsReceived,
  cashMovements,
  fundingSources,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  addDays,
  differenceInDays,
} from "date-fns";
import { es } from "date-fns/locale";

export async function getReportsData() {
  const [
    allQuotes,
    allJobs,
    allPurchases,
    allPayments,
    allMovements,
    allFundingSources,
  ] = await Promise.all([
    db.select().from(quotes),
    db.select().from(jobs),
    db.select().from(purchases),
    db.select().from(paymentsReceived),
    db.select().from(cashMovements),
    db.select().from(fundingSources),
  ]);

  // ── Rentabilidad por trabajo ──────────────────────────────────────
  const rentabilidad = allJobs.map((job) => {
    const quote = allQuotes.find((q) => q.id === job.quoteId);
    const jobPurchases = allPurchases.filter((p) => p.jobId === job.id);
    const jobPayments = allPayments.filter((p) => p.jobId === job.id);

    const precioVenta = quote?.precioTotal ?? 0;
    const totalCompras = jobPurchases.reduce((sum, p) => sum + p.monto, 0);
    const margenBruto = precioVenta - totalCompras;
    const margenPct = precioVenta > 0 ? (margenBruto / precioVenta) * 100 : 0;
    const totalCobrado = jobPayments.reduce((sum, p) => sum + p.monto, 0);

    return {
      jobId: job.id,
      jobCodigo: job.codigo,
      descripcion: quote?.descripcion ?? "",
      estado: job.estado,
      precioVenta,
      totalCompras,
      margenBruto,
      margenPct: Math.round(margenPct * 10) / 10,
      totalCobrado,
      pendiente: precioVenta - totalCobrado,
    };
  });

  // ── Reporte mensual (ultimos 12 meses) ────────────────────────────
  const now = new Date();
  const months: {
    key: string;
    label: string;
    ingresos: number;
    egresos: number;
    margen: number;
  }[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const key = format(monthDate, "yyyy-MM");
    const label = format(monthDate, "MMM yyyy", { locale: es });

    const monthPayments = allPayments.filter((p) => {
      const d = new Date(p.fecha);
      return d >= start && d <= end;
    });
    const monthPurchases = allPurchases.filter((p) => {
      const d = new Date(p.fechaCompra);
      return d >= start && d <= end;
    });

    const ingresos = monthPayments.reduce((sum, p) => sum + p.monto, 0);
    const egresos = monthPurchases.reduce((sum, p) => sum + p.monto, 0);

    months.push({
      key,
      label,
      ingresos,
      egresos,
      margen: ingresos - egresos,
    });
  }

  // ── Flujo de caja proyectado ──────────────────────────────────────
  // Expected incoming: invoiced jobs with fechaEmisionCc + 45 days
  const invoicedJobs = allJobs.filter((j) => j.estado === "facturado");
  const proyeccion = invoicedJobs
    .filter((j) => j.fechaEmisionCc)
    .map((j) => {
      const quote = allQuotes.find((q) => q.id === j.quoteId);
      const jobPayments = allPayments.filter((p) => p.jobId === j.id);
      const totalPaid = jobPayments.reduce((sum, p) => sum + p.monto, 0);
      const precioTotal = quote?.precioTotal ?? 0;
      const pendiente = precioTotal - totalPaid;
      const fechaEsperada = addDays(new Date(j.fechaEmisionCc!), 45);
      const diasRestantes = differenceInDays(fechaEsperada, now);

      return {
        jobId: j.id,
        jobCodigo: j.codigo,
        descripcion: quote?.descripcion ?? "",
        pendiente,
        fechaEsperada,
        diasRestantes,
        vencido: diasRestantes < 0,
      };
    })
    .filter((p) => p.pendiente > 0)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  // Pending purchase payments (egresos pendientes)
  const pendingPurchases = allPurchases
    .filter((p) => p.estadoPagoProveedor === "pendiente")
    .map((p) => {
      const job = allJobs.find((j) => j.id === p.jobId);
      return {
        purchaseId: p.id,
        jobCodigo: job?.codigo ?? "",
        descripcion: p.descripcion,
        monto: p.monto,
        fechaCompra: p.fechaCompra,
      };
    });

  const totalIngresosProyectados = proyeccion.reduce(
    (sum, p) => sum + p.pendiente,
    0
  );
  const totalEgresosPendientes = pendingPurchases.reduce(
    (sum, p) => sum + p.monto,
    0
  );

  // ── CSV data for monthly report ───────────────────────────────────
  const csvRows = rentabilidad.map((r) => ({
    codigo: r.jobCodigo,
    descripcion: r.descripcion,
    estado: r.estado,
    precio_venta: r.precioVenta,
    total_compras: r.totalCompras,
    margen_bruto: r.margenBruto,
    margen_pct: r.margenPct,
    total_cobrado: r.totalCobrado,
    pendiente: r.pendiente,
  }));

  return {
    rentabilidad,
    months,
    proyeccion,
    pendingPurchases,
    totalIngresosProyectados,
    totalEgresosPendientes,
    csvRows,
  };
}
