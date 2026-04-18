"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleFundingSourceActive } from "@/lib/actions/funding-sources";
import { formatCOP } from "@/lib/utils/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FundingSourceWithBalance {
  id: number;
  nombre: string;
  tipo: string;
  activo: boolean;
  totalSalidas: number;
  totalReposiciones: number;
  saldoAfuera: number;
  movimientosCount: number;
}

export function FuentesPageClient({
  sources,
}: {
  sources: FundingSourceWithBalance[];
}) {
  const router = useRouter();
  const totalAfuera = sources
    .filter((s) => s.activo)
    .reduce((sum, s) => sum + s.saldoAfuera, 0);

  async function handleToggle(id: number) {
    const result = await toggleFundingSourceActive(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Estado actualizado");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fuentes de Fondos</h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total afuera</p>
          <p className="text-2xl font-bold">{formatCOP(totalAfuera)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Card
            key={source.id}
            className={!source.activo ? "opacity-60" : undefined}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <Link
                    href={`/fuentes/${source.id}`}
                    className="hover:underline"
                  >
                    {source.nombre}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {source.tipo === "tarjeta_credito" ? "TC" : "Efectivo"}
                  </Badge>
                  {!source.activo && (
                    <Badge variant="secondary" className="text-xs">
                      Inactiva
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Salidas</span>
                <span className="text-red-600">{formatCOP(source.totalSalidas)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reposiciones</span>
                <span className="text-green-600">{formatCOP(source.totalReposiciones)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Saldo afuera</span>
                <span
                  className={`text-lg font-bold ${
                    source.saldoAfuera > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCOP(source.saldoAfuera)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {source.movimientosCount} movimiento{source.movimientosCount !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(source.id)}
                  >
                    {source.activo ? "Desactivar" : "Activar"}
                  </Button>
                  <Link href={`/fuentes/${source.id}`}>
                    <Button variant="outline" size="sm">
                      Ver detalle
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
