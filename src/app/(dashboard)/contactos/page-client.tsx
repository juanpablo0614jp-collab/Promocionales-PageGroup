"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/contactos/contact-form";
import { ContactsTable } from "@/components/contactos/contacts-table";

interface Contact {
  id: number;
  nombre: string;
  email: string | null;
  cargo: string | null;
  notas: string | null;
  createdAt: Date;
}

export function ContactsPageClient({ contacts }: { contacts: Contact[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <Button onClick={() => setCreateOpen(true)}>Nuevo contacto</Button>
      </div>

      <ContactsTable contacts={contacts} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo contacto</DialogTitle>
          </DialogHeader>
          <ContactForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
