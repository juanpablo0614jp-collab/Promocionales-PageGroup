"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { Separator } from "@/components/ui/separator";
import { formatCOP, formatDate } from "@/lib/utils/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RentabilidadRow {
  jobId: number;
  jobCodigo: string;
  descripcion: string;
  estado: string;
  precioVenta: number;
  totalCompras: number;
  margenBruto: number;
  margenPct: number;
  totalCobrado: number;
  pendiente: number;
}

interface MonthRow {
  key: string;
  label: string;
  ingresos: number;
  egresos: number;
  margen: number;
}

interface ProyeccionRow {
  jobId: number;
  jobCodigo: string;
  descripcion: string;
  pendiente: number;
  fechaEsperada: Date;
  diasRestantes: number;
  vencido: boolean;
}

interface PendingPurchase {
  purchaseId: number;
  jobCodigo: string;
  descripcion: string;
  monto: number;
  fechaCompra: Date;
}

interface CsvRow {
  codigo: string;
  descripcion: string;
  estado: string;
  precio_venta: number;
  total_compras: number;
  margen_bruto: number;
  margen_pct: number;
  total_cobrado: number;
  pendiente: number;
}

interface ReportsData {
  rentabilidad: RentabilidadRow[];
  months: MonthRow[];
  proyeccion: ProyeccionRow[];
  pendingPurchases: PendingPurchase[];
  totalIngresosProyectados: number;
  totalEgresosPendientes: number;
  csvRows: CsvRow[];
}

function downloadCSV(rows: CsvRow[]) {
  const headers = [
    "Codigo",
    "Descripcion",
    "Estado",
    "Precio Venta",
    "Total Compras",
    "Margen Bruto",
    "Margen %",
    "Total Cobrado",
    "Pendiente",
  ];
  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.codigo,
        `"${r.descripcion.replace(/"/g, '""')}"`,
        r.estado,
        r.precio_venta,
        r.total_compras,
        r.margen_bruto,
        r.margen_pct,
        r.total_cobrado,
        r.pendiente,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-trabajos-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return String(value);
}

export function ReportesClient({ data }: { data: ReportsData }) {
  const [tab, setTab] = useState<
    "rentabilidad" | "mensual" | "flujo"
  >("rentabilidad");

  const totalVentas = data.rentabilidad.reduce(
    (sum, r) => sum + r.precioVenta,
    0
  );
  const totalComprasGlobal = data.rentabilidad.reduce(
    (sum, r) => sum + r.totalCompras,
    0
  );
  const totalMargen = totalVentas - totalComprasGlobal;
  const margenGlobalPct =
    totalVentas > 0
      ? Math.round((totalMargen / totalVentas) * 1000) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <Button variant="outline" onClick={() => downloadCSV(data.csvRows)}>
          Exportar CSV
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total ventas</p>
            <p className="text-2xl font-bold">{formatCOP(totalVentas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total compras</p>
            <p className="text-2xl font-bold">{formatCOP(totalComprasGlobal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Margen global ({margenGlobalPct}%)
            </p>
            <p
              className={`text-2xl font-bold ${totalMargen < 0 ? "text-destructive" : "text-green-600"}`}
            >
              {formatCOP(totalMargen)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Flujo proyectado</p>
            <p className="text-2xl font-bold text-green-600">
              +{formatCOP(data.totalIngresosProyectados)}
            </p>
            <p className="text-sm text-destructive">
              -{formatCOP(data.totalEgresosPendientes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={tab === "rentabilidad" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("rentabilidad")}
        >
          Rentabilidad
        </Button>
        <Button
          variant={tab === "mensual" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("mensual")}
        >
          Mensual
        </Button>
        <Button
          variant={tab === "flujo" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("flujo")}
        >
          Flujo de caja
        </Button>
      </div>

      {tab === "rentabilidad" && (
        <RentabilidadTab rows={data.rentabilidad} />
      )}
      {tab === "mensual" && <MensualTab months={data.months} />}
      {tab === "flujo" && (
        <FlujoTab
          proyeccion={data.proyeccion}
          pendingPurchases={data.pendingPurchases}
          totalIngresos={data.totalIngresosProyectados}
          totalEgresos={data.totalEgresosPendientes}
        />
      )}
    </div>
  );
}

function RentabilidadTab({ rows }: { rows: RentabilidadRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentabilidad por trabajo</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay trabajos</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajo</TableHead>
                  <TableHead className="max-w-[150px]">Descripcion</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Cobrado</TableHead>
                  <TableHead className="text-right">Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.jobId}>
                    <TableCell>
                      <Link
                        href={`/trabajos/${r.jobId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {r.jobCodigo}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {r.descripcion}
                    </TableCell>
                    <TableCell>
                      <JobStatusBadge status={r.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCOP(r.precioVenta)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCOP(r.totalCompras)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${r.margenBruto < 0 ? "text-destructive" : "text-green-600"}`}
                    >
                      {formatCOP(r.margenBruto)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${r.margenPct < 0 ? "text-destructive" : ""}`}
                    >
                      {r.margenPct}%
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCOP(r.totalCobrado)}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.pendiente > 0 ? (
                        <span className="text-yellow-600">
                          {formatCOP(r.pendiente)}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          {formatCOP(0)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MensualTab({ months }: { months: MonthRow[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Egresos (12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis
                  tickFormatter={(v: number) => formatCompact(v)}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value) => formatCOP(Number(value))}
                />
                <Legend />
                <Bar
                  dataKey="ingresos"
                  name="Ingresos"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="egresos"
                  name="Egresos"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Egresos</TableHead>
                <TableHead className="text-right">Neto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((m) => (
                <TableRow key={m.key}>
                  <TableCell className="capitalize">{m.label}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCOP(m.ingresos)}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {formatCOP(m.egresos)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${m.margen < 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    {formatCOP(m.margen)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FlujoTab({
  proyeccion,
  pendingPurchases,
  totalIngresos,
  totalEgresos,
}: {
  proyeccion: ProyeccionRow[];
  pendingPurchases: PendingPurchase[];
  totalIngresos: number;
  totalEgresos: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Ingresos esperados
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCOP(totalIngresos)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Egresos pendientes
            </p>
            <p className="text-2xl font-bold text-destructive">
              {formatCOP(totalEgresos)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Flujo neto</p>
            <p
              className={`text-2xl font-bold ${totalIngresos - totalEgresos < 0 ? "text-destructive" : "text-green-600"}`}
            >
              {formatCOP(totalIngresos - totalEgresos)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cobros esperados</CardTitle>
        </CardHeader>
        <CardContent>
          {proyeccion.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay cobros pendientes
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajo</TableHead>
                  <TableHead className="max-w-[150px]">Descripcion</TableHead>
                  <TableHead className="text-right">Pendiente</TableHead>
                  <TableHead>Pago esperado</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proyeccion.map((p) => (
                  <TableRow key={p.jobId}>
                    <TableCell>
                      <Link
                        href={`/trabajos/${p.jobId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.jobCodigo}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {p.descripcion}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCOP(p.pendiente)}
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

      <Card>
        <CardHeader>
          <CardTitle>
            Compras pendientes de pago ({pendingPurchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todas las compras estan pagadas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Fecha compra</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPurchases.map((p) => (
                  <TableRow key={p.purchaseId}>
                    <TableCell className="font-medium">
                      {p.jobCodigo}
                    </TableCell>
                    <TableCell>{p.descripcion}</TableCell>
                    <TableCell>{formatDate(p.fechaCompra)}</TableCell>
                    <TableCell className="text-right">
                      {formatCOP(p.monto)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
