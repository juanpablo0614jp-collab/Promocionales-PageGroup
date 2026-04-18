"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFullBackup } from "@/lib/actions/backup";
import { toast } from "sonner";

export function ConfiguracionClient() {
  const [exporting, setExporting] = useState(false);

  async function handleExportJSON() {
    setExporting(true);
    try {
      const backup = await getFullBackup();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-pgc-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup descargado");
    } catch {
      toast.error("Error al exportar");
    }
    setExporting(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuracion</h1>

      <Card>
        <CardHeader>
          <CardTitle>Backup de datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Descarga un respaldo completo de todos los datos del sistema en
            formato JSON. Incluye contactos, proveedores, cotizaciones,
            trabajos, compras, pagos, movimientos de caja y archivos adjuntos.
          </p>
          <Button onClick={handleExportJSON} disabled={exporting}>
            {exporting ? "Exportando..." : "Descargar backup JSON"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informacion del sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Aplicacion" value="Promocionales PGC" />
          <InfoRow label="Version" value="1.0.0" />
          <Separator />
          <InfoRow label="Framework" value="Next.js 16" />
          <InfoRow label="Base de datos" value="Vercel Postgres (Neon)" />
          <InfoRow label="Almacenamiento" value="Vercel Blob" />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
