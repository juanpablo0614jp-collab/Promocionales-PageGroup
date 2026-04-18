"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobsTable } from "@/components/trabajos/jobs-table";

interface Job {
  id: number;
  codigo: string;
  quoteId: number;
  fechaAprobacion: Date;
  estado: string;
  numeroCuentaCobro: string | null;
  fechaEmisionCc: Date | null;
  fechaRealPago: Date | null;
  notas: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Quote {
  id: number;
  codigo: string;
  precioTotal: number;
}

export function TrabajosPageClient({
  jobs,
  quotes,
}: {
  jobs: Job[];
  quotes: Quote[];
}) {
  const [filter, setFilter] = useState("todos");
  const quotesMap = new Map(quotes.map((q) => [q.id, q]));

  const filtered =
    filter === "todos" ? jobs : jobs.filter((j) => j.estado === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trabajos</h1>
      </div>

      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "todos")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="en_produccion">En produccion</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="facturado">Facturado</SelectItem>
            <SelectItem value="cobrado">Cobrado</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} trabajo{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <JobsTable jobs={filtered} quotesMap={quotesMap} />
    </div>
  );
}
