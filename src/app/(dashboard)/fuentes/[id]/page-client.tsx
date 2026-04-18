"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toggleFundingSourceActive } from "@/lib/actions/funding-sources";
import { formatCOP, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

interface FundingSourceDetail {
  source: {
    id: number;
    nombre: string;
    tipo: string;
    activo: boolean;
  };
  movements: {
    id: number;
    tipo: string;
    monto: number;
    fecha: Date;
    purchaseId: number | null;
    paymentReceivedId: number | null;
    notas: string | null;
    createdAt: Date;
  }[];
  totalSalidas: number;
  totalReposiciones: number;
  saldoAfuera: number;
}

export function FuenteDetailClient({
  data,
  desde,
  hasta,
}: {
  data: FundingSourceDetail;
  desde?: string;
  hasta?: string;
}) {
  const router = useRouter();
  const { source, movements, totalSalidas, totalReposiciones, saldoAfuera } = data;
  const [fechaDesde, setFechaDesde] = useState(desde ?? "");
  const [fechaHasta, setFechaHasta] = useState(hasta ?? "");

  function handleFilter() {
    const params = new URLSearchParams();
    if (fechaDesde) params.set("desde", fechaDesde);
    if (fechaHasta) params.set("hasta", fechaHasta);
    const qs = params.toString();
    router.push(`/fuentes/${source.id}${qs ? `?${qs}` : ""}`);
  }

  function handleClearFilter() {
    setFechaDesde("");
    setFechaHasta("");
    router.push(`/fuentes/${source.id}`);
  }

  async function handleToggle() {
    const result = await toggleFundingSourceActive(source.id);
    if (result.error) toast.error(result.error);
    else { toast.success("Estado actualizado"); router.refresh(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fuentes" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Fuentes de Fondos
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{source.nombre}</h1>
          <Badge variant="outline">
            {source.tipo === "tarjeta_credito" ? "Tarjeta de credito" : "Efectivo propio"}
          </Badge>
          {!source.activo && <Badge variant="secondary">Inactiva</Badge>}
        </div>
        <Button variant="outline" onClick={handleToggle}>
          {source.activo ? "Desactivar" : "Activar"}
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total salidas</p>
            <p className="text-2xl font-bold text-red-600">{formatCOP(totalSalidas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total reposiciones</p>
            <p className="text-2xl font-bold text-green-600">{formatCOP(totalReposiciones)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Saldo afuera</p>
            <p className={`text-2xl font-bold ${saldoAfuera > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCOP(saldoAfuera)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro por fechas */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="fechaDesde" className="text-xs">Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fechaHasta" className="text-xs">Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button size="sm" onClick={handleFilter}>Filtrar</Button>
            {(desde || hasta) && (
              <Button size="sm" variant="ghost" onClick={handleClearFilter}>
                Limpiar
              </Button>
            )}
          </div>

          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No hay movimientos{desde || hasta ? " en el rango seleccionado" : ""}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.fecha)}</TableCell>
                    <TableCell>
                      {m.tipo === "salida" ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Salida
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Reposicion
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={m.tipo === "salida" ? "text-red-600" : "text-green-600"}>
                        {m.tipo === "salida" ? "- " : "+ "}{formatCOP(m.monto)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground">
                      {m.notas ?? "—"}
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
