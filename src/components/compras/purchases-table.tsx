"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { markPurchasePaid, deletePurchase } from "@/lib/actions/purchases";
import { formatCOP, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

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
}

interface PurchasesTableProps {
  purchases: Purchase[];
  jobsMap: Map<number, string>;
  suppliersMap: Map<number, string>;
  fundingSources: { id: number; nombre: string }[];
  fundingSourcesMap: Map<number, string>;
  showJobColumn?: boolean;
}

export function PurchasesTable({
  purchases,
  jobsMap,
  suppliersMap,
  fundingSources,
  fundingSourcesMap,
  showJobColumn = true,
}: PurchasesTableProps) {
  const [payingPurchase, setPayingPurchase] = useState<Purchase | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [fundingSourceId, setFundingSourceId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleMarkPaid(formData: FormData) {
    if (!payingPurchase) return;
    formData.set("fundingSourceId", fundingSourceId);
    setLoading(true);
    const result = await markPurchasePaid(payingPurchase.id, formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Compra marcada como pagada");
      setPayOpen(false);
      setFundingSourceId("");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta compra?")) return;
    const result = await deletePurchase(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Compra eliminada");
    }
  }

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No hay compras registradas</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {showJobColumn && <TableHead>Trabajo</TableHead>}
            <TableHead>Proveedor</TableHead>
            <TableHead>Descripcion</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Fuente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[160px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((p) => (
            <TableRow key={p.id}>
              {showJobColumn && (
                <TableCell>
                  <Link href={`/trabajos/${p.jobId}`} className="text-primary hover:underline">
                    {jobsMap.get(p.jobId) ?? "—"}
                  </Link>
                </TableCell>
              )}
              <TableCell>{suppliersMap.get(p.supplierId) ?? "—"}</TableCell>
              <TableCell className="max-w-[150px] truncate">{p.descripcion}</TableCell>
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
                <div className="flex gap-1">
                  {p.estadoPagoProveedor === "pendiente" && (
                    <Button variant="ghost" size="sm" onClick={() => { setPayingPurchase(p); setPayOpen(true); }}>
                      Pagar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar compra como pagada</DialogTitle>
          </DialogHeader>
          {payingPurchase && (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                {payingPurchase.descripcion} — {formatCOP(payingPurchase.monto)}
              </p>
            </div>
          )}
          <form action={handleMarkPaid} className="space-y-4">
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
    </>
  );
}
