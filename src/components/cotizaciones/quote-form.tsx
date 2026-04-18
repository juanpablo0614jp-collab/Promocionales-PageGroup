"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuote, updateQuote } from "@/lib/actions/quotes";
import { formatCOP } from "@/lib/utils/format";
import { toast } from "sonner";

interface Contact {
  id: number;
  nombre: string;
}

interface Quote {
  id: number;
  fechaSolicitud: Date;
  contactId: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  fechaVencimiento: Date | null;
  notas: string | null;
}

interface QuoteFormProps {
  contacts: Contact[];
  quote?: Quote;
  onSuccess?: () => void;
}

export function QuoteForm({ contacts, quote, onSuccess }: QuoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [cantidad, setCantidad] = useState(quote?.cantidad ?? 0);
  const [precioUnitario, setPrecioUnitario] = useState(quote?.precioUnitario ?? 0);
  const [contactId, setContactId] = useState(String(quote?.contactId ?? ""));

  const precioTotal = cantidad * precioUnitario;

  function toDateInputValue(date: Date | null | undefined): string {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  }

  async function handleSubmit(formData: FormData) {
    formData.set("contactId", contactId);
    setLoading(true);
    const result = quote
      ? await updateQuote(quote.id, formData)
      : await createQuote(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(quote ? "Cotizacion actualizada" : "Cotizacion creada");
    formRef.current?.reset();
    onSuccess?.();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fechaSolicitud">Fecha de solicitud *</Label>
        <Input
          id="fechaSolicitud"
          name="fechaSolicitud"
          type="date"
          required
          defaultValue={toDateInputValue(quote?.fechaSolicitud) || new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactId">Contacto *</Label>
        <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar contacto" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="contactId" value={contactId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripcion *</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          required
          defaultValue={quote?.descripcion ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad *</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            min="1"
            required
            defaultValue={quote?.cantidad ?? ""}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="precioUnitario">Precio unitario (COP) *</Label>
          <Input
            id="precioUnitario"
            name="precioUnitario"
            type="number"
            min="1"
            required
            defaultValue={quote?.precioUnitario ?? ""}
            onChange={(e) => setPrecioUnitario(Number(e.target.value))}
          />
        </div>
      </div>

      {precioTotal > 0 && (
        <div className="rounded-md bg-muted p-3 text-center">
          <span className="text-sm text-muted-foreground">Precio total: </span>
          <span className="text-lg font-bold">{formatCOP(precioTotal)}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
        <Input
          id="fechaVencimiento"
          name="fechaVencimiento"
          type="date"
          defaultValue={toDateInputValue(quote?.fechaVencimiento)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          name="notas"
          defaultValue={quote?.notas ?? ""}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? "Guardando..."
          : quote
            ? "Actualizar cotizacion"
            : "Crear cotizacion"}
      </Button>
    </form>
  );
}
