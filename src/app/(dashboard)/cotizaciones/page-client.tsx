"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuoteForm } from "@/components/cotizaciones/quote-form";
import { QuotesTable } from "@/components/cotizaciones/quotes-table";

interface Quote {
  id: number;
  codigo: string;
  fechaSolicitud: Date;
  contactId: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  estado: string;
  fechaVencimiento: Date | null;
  notas: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Contact {
  id: number;
  nombre: string;
  email: string | null;
  cargo: string | null;
  notas: string | null;
  createdAt: Date;
}

export function CotizacionesPageClient({
  quotes,
  contacts,
}: {
  quotes: Quote[];
  contacts: Contact[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("todos");

  const filtered =
    filter === "todos" ? quotes : quotes.filter((q) => q.estado === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <Button onClick={() => setCreateOpen(true)}>Nueva cotizacion</Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "todos")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente_respuesta">Pendiente</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} cotizacion{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      <QuotesTable quotes={filtered} contacts={contacts} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva cotizacion</DialogTitle>
          </DialogHeader>
          <QuoteForm
            contacts={contacts}
            onSuccess={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
