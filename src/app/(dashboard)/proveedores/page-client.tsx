"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplierForm } from "@/components/proveedores/supplier-form";
import { SuppliersTable } from "@/components/proveedores/suppliers-table";

interface Supplier {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  notas: string | null;
  createdAt: Date;
}

export function ProveedoresPageClient({ suppliers }: { suppliers: Supplier[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Button onClick={() => setCreateOpen(true)}>Nuevo proveedor</Button>
      </div>
      <SuppliersTable suppliers={suppliers} />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo proveedor</DialogTitle></DialogHeader>
          <SupplierForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
