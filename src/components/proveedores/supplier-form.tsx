"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupplier, updateSupplier } from "@/lib/actions/suppliers";
import { toast } from "sonner";

interface SupplierFormProps {
  supplier?: {
    id: number;
    nombre: string;
    contacto: string | null;
    telefono: string | null;
    notas: string | null;
  };
  onSuccess?: () => void;
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = supplier
      ? await updateSupplier(supplier.id, formData)
      : await createSupplier(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(supplier ? "Proveedor actualizado" : "Proveedor creado");
    formRef.current?.reset();
    onSuccess?.();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input id="nombre" name="nombre" required defaultValue={supplier?.nombre ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contacto">Persona de contacto</Label>
        <Input id="contacto" name="contacto" defaultValue={supplier?.contacto ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefono">Telefono</Label>
        <Input id="telefono" name="telefono" defaultValue={supplier?.telefono ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" defaultValue={supplier?.notas ?? ""} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Guardando..." : supplier ? "Actualizar proveedor" : "Crear proveedor"}
      </Button>
    </form>
  );
}
