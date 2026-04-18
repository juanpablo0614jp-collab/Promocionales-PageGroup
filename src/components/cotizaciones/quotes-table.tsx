"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "@/components/shared/status-badge";
import { formatCOP, formatDate } from "@/lib/utils/format";

interface Quote {
  id: number;
  codigo: string;
  fechaSolicitud: Date;
  contactId: number | null;
  descripcion: string;
  precioTotal: number;
  estado: string;
}

interface Contact {
  id: number;
  nombre: string;
}

interface QuotesTableProps {
  quotes: Quote[];
  contacts: Contact[];
}

export function QuotesTable({ quotes, contacts }: QuotesTableProps) {
  const contactMap = new Map(contacts.map((c) => [c.id, c.nombre]));

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No hay cotizaciones registradas</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Codigo</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead className="max-w-[200px]">Descripcion</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id}>
            <TableCell>
              <Link
                href={`/cotizaciones/${quote.id}`}
                className="font-medium text-primary hover:underline"
              >
                {quote.codigo}
              </Link>
            </TableCell>
            <TableCell>{formatDate(quote.fechaSolicitud)}</TableCell>
            <TableCell>
              {quote.contactId ? contactMap.get(quote.contactId) ?? "—" : "—"}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {quote.descripcion}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCOP(quote.precioTotal)}
            </TableCell>
            <TableCell>
              <QuoteStatusBadge status={quote.estado} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
