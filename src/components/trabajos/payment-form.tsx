"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createPaymentReceived } from "@/lib/actions/payments";
import { formatCOP } from "@/lib/utils/format";
import { toast } from "sonner";

interface FundingSource {
  id: number;
  nombre: string;
}

interface PaymentFormProps {
  jobId: number;
  jobCodigo: string;
  pendienteCobro: number;
  fundingSources: FundingSource[];
  onSuccess?: () => void;
}

export function PaymentForm({
  jobId,
  jobCodigo,
  pendienteCobro,
  fundingSources,
  onSuccess,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [monto, setMonto] = useState(pendienteCobro > 0 ? pendienteCobro : 0);
  const [showDistribution, setShowDistribution] = useState(false);
  const [distributions, setDistributions] = useState<
    { fundingSourceId: number; monto: number }[]
  >(fundingSources.map((fs) => ({ fundingSourceId: fs.id, monto: 0 })));

  const totalDistributed = distributions.reduce((sum, d) => sum + d.monto, 0);
  const remaining = monto - totalDistributed;

  function updateDistribution(fundingSourceId: number, value: number) {
    setDistributions((prev) =>
      prev.map((d) =>
        d.fundingSourceId === fundingSourceId
          ? { ...d, monto: value }
          : d
      )
    );
  }

  async function handleSubmit(formData: FormData) {
    formData.set("jobId", String(jobId));
    formData.set("monto", String(monto));

    const activeDistributions = showDistribution
      ? distributions.filter((d) => d.monto > 0)
      : [];

    setLoading(true);
    const result = await createPaymentReceived(formData, activeDistributions);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Pago registrado");
    onSuccess?.();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="rounded-md bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          Trabajo: <span className="font-medium text-foreground">{jobCodigo}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Pendiente de cobro: <span className="font-medium text-foreground">{formatCOP(pendienteCobro)}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monto">Monto recibido (COP) *</Label>
        <Input
          id="monto"
          name="monto"
          type="number"
          min="1"
          required
          value={monto || ""}
          onChange={(e) => setMonto(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha de pago *</Label>
        <Input
          id="fecha"
          name="fecha"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showDistribution"
            checked={showDistribution}
            onChange={(e) => setShowDistribution(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="showDistribution" className="font-normal">
            Distribuir pago para reponer fuentes de fondos
          </Label>
        </div>
      </div>

      {showDistribution && monto > 0 && (
        <div className="space-y-3 rounded-md border p-4">
          <p className="text-sm font-medium">
            Distribuir {formatCOP(monto)} entre fuentes:
          </p>
          {fundingSources.map((fs) => {
            const dist = distributions.find(
              (d) => d.fundingSourceId === fs.id
            );
            return (
              <div key={fs.id} className="flex items-center gap-3">
                <Label className="w-[140px] text-sm font-normal shrink-0">
                  {fs.nombre}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={monto}
                  value={dist?.monto || ""}
                  onChange={(e) =>
                    updateDistribution(fs.id, Number(e.target.value) || 0)
                  }
                  className="w-[150px]"
                  placeholder="0"
                />
              </div>
            );
          })}
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Total distribuido:</span>
            <span className={remaining < 0 ? "text-destructive font-medium" : "font-medium"}>
              {formatCOP(totalDistributed)} / {formatCOP(monto)}
            </span>
          </div>
          {remaining < 0 && (
            <p className="text-xs text-destructive">
              El total distribuido excede el monto del pago
            </p>
          )}
          {remaining > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCOP(remaining)} sin distribuir (se registra el pago pero no se repone)
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || (showDistribution && remaining < 0)}
        className="w-full"
      >
        {loading ? "Registrando..." : "Registrar pago"}
      </Button>
    </form>
  );
}
