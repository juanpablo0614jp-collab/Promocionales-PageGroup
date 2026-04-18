"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCOP, formatDate } from "@/lib/utils/format";

interface DashboardData {
  cotizacionesPendientes: number;
  trabajosEnProduccion: number;
  trabajosFacturados: number;
  totalCuentasPorCobrar: number;
  fundingSources: { id: number; nombre: string; tipo: string }[];
  staleQuotes: {
    id: number;
    codigo: string;
    descripcion: string;
    fechaSolicitud: Date;
    diasSinRespuesta: number;
  }[];
  upcomingPayments: {
    jobId: number;
    jobCodigo: string;
    quoteCodigo: string;
    precioTotal: number;
    fechaEsperada: Date;
    diasRestantes: number;
    vencido: boolean;
  }[];
}

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Cotizaciones pendientes" href="/cotizaciones">
          <span className="text-3xl font-bold">
            {data.cotizacionesPendientes}
          </span>
        </KpiCard>

        <KpiCard title="Trabajos en produccion" href="/trabajos">
          <span className="text-3xl font-bold">
            {data.trabajosEnProduccion}
          </span>
        </KpiCard>

        <KpiCard title="Cuentas por cobrar" href="/trabajos">
          <span className="text-xl font-bold">
            {formatCOP(data.totalCuentasPorCobrar)}
          </span>
          <p className="text-xs text-muted-foreground">
            {data.trabajosFacturados} trabajo{data.trabajosFacturados !== 1 ? "s" : ""} facturado{data.trabajosFacturados !== 1 ? "s" : ""}
          </p>
        </KpiCard>

        <KpiCard title="Fuentes de fondos" href="/fuentes">
          <div className="space-y-1">
            {data.fundingSources.map((fs) => (
              <div key={fs.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{fs.nombre}</span>
                <Badge variant="outline" className="text-xs">
                  {fs.tipo === "tarjeta_credito" ? "TC" : "Efectivo"}
                </Badge>
              </div>
            ))}
          </div>
        </KpiCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Proximos pagos esperados */}
        <Card>
          <CardHeader>
            <CardTitle>Proximos pagos esperados</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay pagos pendientes
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Pago esperado</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.upcomingPayments.map((p) => (
                    <TableRow key={p.jobId}>
                      <TableCell>
                        <Link
                          href={`/trabajos/${p.jobId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {p.jobCodigo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCOP(p.precioTotal)}
                      </TableCell>
                      <TableCell>{formatDate(p.fechaEsperada)}</TableCell>
                      <TableCell>
                        {p.vencido ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Vencido ({Math.abs(p.diasRestantes)}d)
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {p.diasRestantes}d restantes
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Cotizaciones sin respuesta */}
        <Card>
          <CardHeader>
            <CardTitle>Cotizaciones sin respuesta (&gt;5 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.staleQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todas las cotizaciones tienen respuesta reciente
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Dias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.staleQuotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <Link
                          href={`/cotizaciones/${q.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {q.codigo}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {q.descripcion}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {q.diasSinRespuesta}d
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </Link>
  );
}
