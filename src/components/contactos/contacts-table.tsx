"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "./contact-form";
import { deleteContact } from "@/lib/actions/contacts";
import { toast } from "sonner";
import { useState } from "react";
import { formatDate } from "@/lib/utils/format";

interface Contact {
  id: number;
  nombre: string;
  email: string | null;
  cargo: string | null;
  notas: string | null;
  createdAt: Date;
}

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete(id: number) {
    if (!confirm("¿Estas seguro de eliminar este contacto?")) return;
    const result = await deleteContact(id);
    if (result.success) {
      toast.success("Contacto eliminado");
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No hay contactos registrados</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-[120px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.nombre}</TableCell>
              <TableCell>{contact.email ?? "—"}</TableCell>
              <TableCell>{contact.cargo ?? "—"}</TableCell>
              <TableCell>{formatDate(contact.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingContact(contact);
                      setEditOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(contact.id)}
                  >
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
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <ContactForm
              contact={editingContact}
              onSuccess={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
