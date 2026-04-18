"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { formatCOP, formatDate } from "@/lib/utils/format";
import { addDays } from "date-fns";

interface Job {
  id: number;
  codigo: string;
  quoteId: number;
  fechaAprobacion: Date;
  estado: string;
  numeroCuentaCobro: string | null;
  fechaEmisionCc: Date | null;
  fechaRealPago: Date | null;
}

interface Quote {
  id: number;
  codigo: string;
  precioTotal: number;
}

export function JobsTable({
  jobs,
  quotesMap,
}: {
  jobs: Job[];
  quotesMap: Map<number, Quote>;
}) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No hay trabajos registrados</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Codigo</TableHead>
          <TableHead>Cotizacion</TableHead>
          <TableHead>Fecha aprobacion</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Pago esperado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const quote = quotesMap.get(job.quoteId);
          const fechaEsperada = job.fechaEmisionCc
            ? addDays(new Date(job.fechaEmisionCc), 45)
            : null;

          return (
            <TableRow key={job.id}>
              <TableCell>
                <Link
                  href={`/trabajos/${job.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {job.codigo}
                </Link>
              </TableCell>
              <TableCell>
                {quote ? (
                  <Link
                    href={`/cotizaciones/${quote.id}`}
                    className="text-muted-foreground hover:underline"
                  >
                    {quote.codigo}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{formatDate(job.fechaAprobacion)}</TableCell>
              <TableCell>
                <JobStatusBadge status={job.estado} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {quote ? formatCOP(quote.precioTotal) : "—"}
              </TableCell>
              <TableCell>
                {fechaEsperada ? formatDate(fechaEsperada) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
