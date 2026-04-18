"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PurchaseForm } from "@/components/compras/purchase-form";
import { PurchasesTable } from "@/components/compras/purchases-table";
import { formatCOP } from "@/lib/utils/format";

interface Purchase {
  id: number;
  jobId: number;
  supplierId: number;
  descripcion: string;
  monto: number;
  fechaCompra: Date;
  fundingSourceId: number | null;
  estadoPagoProveedor: string;
  fechaPagoProveedor: Date | null;
  notas: string | null;
  createdAt: Date;
}

interface Job {
  id: number;
  codigo: string;
}

interface Supplier {
  id: number;
  nombre: string;
}

interface FundingSource {
  id: number;
  nombre: string;
}

export function ComprasPageClient({
  purchases,
  jobs,
  suppliers,
  fundingSources,
}: {
  purchases: Purchase[];
  jobs: Job[];
  suppliers: Supplier[];
  fundingSources: FundingSource[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterProveedor, setFilterProveedor] = useState("todos");
  const [filterTrabajo, setFilterTrabajo] = useState("todos");

  const jobsMap = new Map(jobs.map((j) => [j.id, j.codigo]));
  const suppliersMap = new Map(suppliers.map((s) => [s.id, s.nombre]));
  const fundingSourcesMap = new Map(fundingSources.map((fs) => [fs.id, fs.nombre]));

  let filtered = purchases;
  if (filterEstado !== "todos") {
    filtered = filtered.filter((p) => p.estadoPagoProveedor === filterEstado);
  }
  if (filterProveedor !== "todos") {
    filtered = filtered.filter((p) => p.supplierId === Number(filterProveedor));
  }
  if (filterTrabajo !== "todos") {
    filtered = filtered.filter((p) => p.jobId === Number(filterTrabajo));
  }

  const totalMonto = filtered.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compras</h1>
        <Button onClick={() => setCreateOpen(true)}>Nueva compra</Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={filterEstado} onValueChange={(v) => setFilterEstado(v ?? "todos")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Estado: Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterProveedor} onValueChange={(v) => setFilterProveedor(v ?? "todos")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Proveedor: Todos</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTrabajo} onValueChange={(v) => setFilterTrabajo(v ?? "todos")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Trabajo: Todos</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={String(j.id)}>{j.codigo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {filtered.length} compra{filtered.length !== 1 ? "s" : ""} — Total: {formatCOP(totalMonto)}
        </span>
      </div>

      <PurchasesTable
        purchases={filtered}
        jobsMap={jobsMap}
        suppliersMap={suppliersMap}
        fundingSources={fundingSources}
        fundingSourcesMap={fundingSourcesMap}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nueva compra</DialogTitle></DialogHeader>
          <PurchaseForm
            jobs={jobs}
            suppliers={suppliers}
            fundingSources={fundingSources}
            onSuccess={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
