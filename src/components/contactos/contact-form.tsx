"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContact, updateContact } from "@/lib/actions/contacts";
import { toast } from "sonner";

interface ContactFormProps {
  contact?: {
    id: number;
    nombre: string;
    email: string | null;
    cargo: string | null;
    notas: string | null;
  };
  onSuccess?: () => void;
}

export function ContactForm({ contact, onSuccess }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = contact
      ? await updateContact(contact.id, formData)
      : await createContact(formData);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(contact ? "Contacto actualizado" : "Contacto creado");
    formRef.current?.reset();
    onSuccess?.();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          defaultValue={contact?.nombre ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={contact?.email ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo</Label>
        <Input
          id="cargo"
          name="cargo"
          defaultValue={contact?.cargo ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          name="notas"
          defaultValue={contact?.notas ?? ""}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? "Guardando..."
          : contact
            ? "Actualizar contacto"
            : "Crear contacto"}
      </Button>
    </form>
  );
}
