"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCOP, formatDate } from "@/lib/utils/format";

interface SupplierDetail {
  supplier: {
    id: number;
    nombre: string;
    contacto: string | null;
    telefono: string | null;
    notas: string | null;
    createdAt: Date;
  };
  purchases: {
    id: number;
    jobId: number;
    descripcion: string;
    monto: number;
    fechaCompra: Date;
    estadoPagoProveedor: string;
  }[];
  totalComprado: number;
}

export function SupplierDetailClient({ data }: { data: SupplierDetail }) {
  const { supplier, purchases, totalComprado } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proveedores" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Proveedores
        </Link>
      </div>

      <h1 className="text-3xl font-bold">{supplier.nombre}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informacion</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Contacto" value={supplier.contacto ?? "—"} />
            <InfoRow label="Telefono" value={supplier.telefono ?? "—"} />
            {supplier.notas && <InfoRow label="Notas" value={supplier.notas} />}
            <InfoRow label="Registrado" value={formatDate(supplier.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total comprado</span>
              <span className="text-xl font-bold">{formatCOP(totalComprado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Compras realizadas</span>
              <span className="font-medium">{purchases.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Historial de compras</CardTitle></CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay compras registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.descripcion}</TableCell>
                    <TableCell>{formatDate(p.fechaCompra)}</TableCell>
                    <TableCell className="text-right">{formatCOP(p.monto)}</TableCell>
                    <TableCell>
                      <span className={p.estadoPagoProveedor === "pagado" ? "text-green-600" : "text-yellow-600"}>
                        {p.estadoPagoProveedor === "pagado" ? "Pagado" : "Pendiente"}
                      </span>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}
