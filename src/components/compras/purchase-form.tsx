"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createPurchase } from "@/lib/actions/purchases";
import { toast } from "sonner";

interface PurchaseFormProps {
  jobs: { id: number; codigo: string }[];
  suppliers: { id: number; nombre: string }[];
  fundingSources: { id: number; nombre: string }[];
  defaultJobId?: number;
  onSuccess?: () => void;
}

export function PurchaseForm({
  jobs,
  suppliers,
  fundingSources,
  defaultJobId,
  onSuccess,
}: PurchaseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(defaultJobId ? String(defaultJobId) : "");
  const [supplierId, setSupplierId] = useState("");
  const [fundingSourceId, setFundingSourceId] = useState("");
  const [marcarPagada, setMarcarPagada] = useState(false);

  async function handleSubmit(formData: FormData) {
    formData.set("jobId", jobId);
    formData.set("supplierId", supplierId);
    formData.set("marcarPagada", marcarPagada ? "true" : "false");
    if (marcarPagada && fundingSourceId) {
      formData.set("fundingSourceId", fundingSourceId);
    }
    setLoading(true);
    const result = await createPurchase(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Compra registrada");
    formRef.current?.reset();
    setMarcarPagada(false);
    setFundingSourceId("");
    onSuccess?.();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {!defaultJobId && (
        <div className="space-y-2">
          <Label htmlFor="jobId">Trabajo *</Label>
          <Select value={jobId} onValueChange={(v) => setJobId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar trabajo" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>{j.codigo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="supplierId">Proveedor *</Label>
        <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar proveedor" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripcion *</Label>
        <Input id="descripcion" name="descripcion" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monto">Monto (COP) *</Label>
          <Input id="monto" name="monto" type="number" min="1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaCompra">Fecha compra *</Label>
          <Input
            id="fechaCompra"
            name="fechaCompra"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="marcarPagada"
          checked={marcarPagada}
          onChange={(e) => setMarcarPagada(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="marcarPagada" className="font-normal">
          Marcar como pagada al proveedor
        </Label>
      </div>

      {marcarPagada && (
        <div className="space-y-4 rounded-md border p-4">
          <div className="space-y-2">
            <Label htmlFor="fundingSourceId">Fuente de fondos *</Label>
            <Select value={fundingSourceId} onValueChange={(v) => setFundingSourceId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fuente" />
              </SelectTrigger>
              <SelectContent>
                {fundingSources.map((fs) => (
                  <SelectItem key={fs.id} value={String(fs.id)}>{fs.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaPagoProveedor">Fecha de pago</Label>
            <Input
              id="fechaPagoProveedor"
              name="fechaPagoProveedor"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Registrar compra"}
      </Button>
    </form>
  );
}
