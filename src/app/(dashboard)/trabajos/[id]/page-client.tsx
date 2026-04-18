"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { PurchaseForm } from "@/components/compras/purchase-form";
import { advanceJobStatus, emitCuentaCobro } from "@/lib/actions/jobs";
import { markPurchasePaid } from "@/lib/actions/purchases";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCOP, formatDate } from "@/lib/utils/format";
import { addDays } from "date-fns";
import { toast } from "sonner";

interface JobDetails {
  job: {
    id: number;
    codigo: string;
    quoteId: number;
    fechaAprobacion: Date;
    estado: string;
    numeroCuentaCobro: string | null;
    fechaEmisionCc: Date | null;
    fechaRealPago: Date | null;
    notas: string | null;
  };
  quote: {
    id: number;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
  };
  purchases: {
    id: number;
    supplierId: number;
    descripcion: string;
    monto: number;
    fechaCompra: Date;
    fundingSourceId: number | null;
    estadoPagoProveedor: string;
  }[];
  payments: {
    id: number;
    monto: number;
    fecha: Date;
    notas: string | null;
  }[];
  kpis: {
    precioVenta: number;
    totalCompras: number;
    margenBruto: number;
    totalCobrado: number;
    pendienteCobro: number;
  };
}

interface Supplier {
  id: number;
  nombre: string;
}

interface FundingSource {
  id: number;
  nombre: string;
}

export function JobDetailClient({
  data,
  suppliers,
  fundingSources,
}: {
  data: JobDetails;
  suppliers: Supplier[];
  fundingSources: FundingSource[];
}) {
  const router = useRouter();
  const { job, quote, purchases, payments, kpis } = data;
  const [ccOpen, setCcOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [payPurchaseId, setPayPurchaseId] = useState<number | null>(null);
  const [payFundingSourceId, setPayFundingSourceId] = useState("");
  const [loading, setLoading] = useState(false);

  const suppliersMap = new Map(suppliers.map((s) => [s.id, s.nombre]));
  const fundingSourcesMap = new Map(fundingSources.map((fs) => [fs.id, fs.nombre]));

  const fechaEsperada = job.fechaEmisionCc
    ? addDays(new Date(job.fechaEmisionCc), 45)
    : null;

  const margenPct = kpis.precioVenta > 0
    ? ((kpis.margenBruto / kpis.precioVenta) * 100).toFixed(1)
    : "0";

  async function handleAdvanceStatus() {
    setLoading(true);
    const result = await advanceJobStatus(job.id);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success("Estado actualizado"); router.refresh(); }
  }

  async function handleEmitCC(formData: FormData) {
    setLoading(true);
    const result = await emitCuentaCobro(job.id, formData);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success("Cuenta de cobro emitida"); setCcOpen(false); router.refresh(); }
  }

  async function handleMarkPaid(formData: FormData) {
    if (!payPurchaseId) return;
    formData.set("fundingSourceId", payFundingSourceId);
    setLoading(true);
    const result = await markPurchasePaid(payPurchaseId, formData);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success("Compra marcada como pagada"); setPayPurchaseId(null); setPayFundingSourceId(""); router.refresh(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trabajos" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Trabajos
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{job.codigo}</h1>
          <JobStatusBadge status={job.estado} />
        </div>
        <div className="flex gap-2">
          {job.estado === "en_produccion" && (
            <Button onClick={handleAdvanceStatus} disabled={loading}>
              Marcar como entregado
            </Button>
          )}
          {job.estado === "entregado" && (
            <Button onClick={() => setCcOpen(true)} disabled={loading}>
              Emitir cuenta de cobro
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard title="Precio venta" value={formatCOP(kpis.precioVenta)} />
        <KpiCard title="Total compras" value={formatCOP(kpis.totalCompras)} />
        <KpiCard
          title={`Margen bruto (${margenPct}%)`}
          value={formatCOP(kpis.margenBruto)}
          className={kpis.margenBruto < 0 ? "text-destructive" : "text-green-600"}
        />
        <KpiCard title="Cobrado" value={formatCOP(kpis.totalCobrado)} />
        <KpiCard title="Pendiente cobro" value={formatCOP(kpis.pendienteCobro)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informacion del trabajo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Cotizacion origen">
              <Link href={`/cotizaciones/${quote.id}`} className="text-primary hover:underline">
                {quote.codigo}
              </Link>
            </InfoRow>
            <InfoRow label="Descripcion" value={quote.descripcion} />
            <InfoRow label="Fecha aprobacion" value={formatDate(job.fechaAprobacion)} />
            {job.numeroCuentaCobro && <InfoRow label="Cuenta de cobro #" value={job.numeroCuentaCobro} />}
            {job.fechaEmisionCc && <InfoRow label="Fecha emision CC" value={formatDate(job.fechaEmisionCc)} />}
            {fechaEsperada && <InfoRow label="Pago esperado" value={formatDate(fechaEsperada)} />}
            {job.notas && <InfoRow label="Notas" value={job.notas} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pagos recibidos ({payments.length})</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aun no se han registrado pagos</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.fecha)}</TableCell>
                      <TableCell className="text-right">{formatCOP(p.monto)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compras */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compras asociadas ({purchases.length})</CardTitle>
            <Button size="sm" onClick={() => setPurchaseOpen(true)}>
              Agregar compra
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aun no se han registrado compras para este trabajo
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{suppliersMap.get(p.supplierId) ?? "—"}</TableCell>
                    <TableCell>{p.descripcion}</TableCell>
                    <TableCell>{formatDate(p.fechaCompra)}</TableCell>
                    <TableCell className="text-right">{formatCOP(p.monto)}</TableCell>
                    <TableCell>
                      {p.fundingSourceId ? fundingSourcesMap.get(p.fundingSourceId) ?? "—" : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={p.estadoPagoProveedor === "pagado" ? "text-green-600" : "text-yellow-600"}>
                        {p.estadoPagoProveedor === "pagado" ? "Pagado" : "Pendiente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.estadoPagoProveedor === "pendiente" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPayPurchaseId(p.id)}
                        >
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog agregar compra */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Agregar compra a {job.codigo}</DialogTitle></DialogHeader>
          <PurchaseForm
            jobs={[{ id: job.id, codigo: job.codigo }]}
            suppliers={suppliers}
            fundingSources={fundingSources}
            defaultJobId={job.id}
            onSuccess={() => { setPurchaseOpen(false); router.refresh(); }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog marcar compra como pagada */}
      <Dialog open={payPurchaseId !== null} onOpenChange={() => { setPayPurchaseId(null); setPayFundingSourceId(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Marcar compra como pagada</DialogTitle></DialogHeader>
          <form action={handleMarkPaid} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payFundingSourceId">Fuente de fondos *</Label>
              <Select value={payFundingSourceId} onValueChange={(v) => setPayFundingSourceId(v ?? "")}>
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
              <Label htmlFor="fechaPagoProveedor">Fecha de pago *</Label>
              <Input
                id="fechaPagoProveedor"
                name="fechaPagoProveedor"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Confirmar pago"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog cuenta de cobro */}
      <Dialog open={ccOpen} onOpenChange={setCcOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Emitir cuenta de cobro</DialogTitle></DialogHeader>
          <form action={handleEmitCC} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numeroCuentaCobro">Numero de cuenta de cobro *</Label>
              <Input id="numeroCuentaCobro" name="numeroCuentaCobro" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaEmisionCc">Fecha de emision *</Label>
              <Input
                id="fechaEmisionCc"
                name="fechaEmisionCc"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Emitiendo..." : "Emitir cuenta de cobro"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KpiCard({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-2xl font-bold ${className ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children ?? <span className="text-sm text-right">{value}</span>}
    </div>
  );
}
