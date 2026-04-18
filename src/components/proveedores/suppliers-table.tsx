"use client";

import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SupplierForm } from "./supplier-form";
import { deleteSupplier } from "@/lib/actions/suppliers";
import { toast } from "sonner";
import { useState } from "react";
import { formatDate } from "@/lib/utils/format";

interface Supplier {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  notas: string | null;
  createdAt: Date;
}

export function SuppliersTable({ suppliers }: { suppliers: Supplier[] }) {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete(id: number) {
    if (!confirm("¿Estas seguro de eliminar este proveedor?")) return;
    const result = await deleteSupplier(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Proveedor eliminado");
    }
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No hay proveedores registrados</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-[140px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Link href={`/proveedores/${s.id}`} className="font-medium text-primary hover:underline">
                  {s.nombre}
                </Link>
              </TableCell>
              <TableCell>{s.contacto ?? "—"}</TableCell>
              <TableCell>{s.telefono ?? "—"}</TableCell>
              <TableCell>{formatDate(s.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingSupplier(s); setEditOpen(true); }}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}>
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar proveedor</DialogTitle></DialogHeader>
          {editingSupplier && (
            <SupplierForm supplier={editingSupplier} onSuccess={() => setEditOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
