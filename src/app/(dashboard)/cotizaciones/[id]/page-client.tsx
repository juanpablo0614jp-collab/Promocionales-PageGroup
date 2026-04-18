"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { QuoteStatusBadge } from "@/components/shared/status-badge";
import { QuoteForm } from "@/components/cotizaciones/quote-form";
import {
  approveQuote,
  rejectQuote,
  expireQuote,
  deleteQuote,
} from "@/lib/actions/quotes";
import { formatCOP, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

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

export function QuoteDetailClient({
  quote,
  contact,
  contacts,
}: {
  quote: Quote;
  contact: Contact | null;
  contacts: Contact[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isPending = quote.estado === "pendiente_respuesta";

  async function handleApprove() {
    if (!confirm("¿Aprobar esta cotizacion? Se creara un trabajo automaticamente."))
      return;
    setLoading(true);
    const result = await approveQuote(quote.id);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cotizacion aprobada. Trabajo creado.");
      router.refresh();
    }
  }

  async function handleReject() {
    if (!confirm("¿Rechazar esta cotizacion?")) return;
    setLoading(true);
    const result = await rejectQuote(quote.id);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cotizacion rechazada");
      router.refresh();
    }
  }

  async function handleExpire() {
    if (!confirm("¿Marcar esta cotizacion como vencida?")) return;
    setLoading(true);
    const result = await expireQuote(quote.id);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cotizacion marcada como vencida");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta cotizacion? Esta accion no se puede deshacer."))
      return;
    setLoading(true);
    const result = await deleteQuote(quote.id);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cotizacion eliminada");
      router.push("/cotizaciones");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cotizaciones"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Cotizaciones
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{quote.codigo}</h1>
          <QuoteStatusBadge status={quote.estado} />
        </div>
        <div className="flex gap-2">
          {isPending && (
            <>
              <Button onClick={handleApprove} disabled={loading}>
                Aprobar
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={loading}
              >
                Rechazar
              </Button>
              <Button
                variant="outline"
                onClick={handleExpire}
                disabled={loading}
              >
                Marcar vencida
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                disabled={loading}
              >
                Editar
              </Button>
            </>
          )}
          {quote.estado !== "aprobada" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informacion general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Fecha solicitud" value={formatDate(quote.fechaSolicitud)} />
            <InfoRow label="Contacto" value={contact?.nombre ?? "—"} />
            <InfoRow label="Descripcion" value={quote.descripcion} />
            {quote.fechaVencimiento && (
              <InfoRow label="Vencimiento" value={formatDate(quote.fechaVencimiento)} />
            )}
            {quote.notas && <InfoRow label="Notas" value={quote.notas} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Cantidad" value={String(quote.cantidad)} />
            <InfoRow label="Precio unitario" value={formatCOP(quote.precioUnitario)} />
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Precio total</span>
              <span className="text-xl font-bold">{formatCOP(quote.precioTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar cotizacion</DialogTitle>
          </DialogHeader>
          <QuoteForm
            contacts={contacts}
            quote={quote}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
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
