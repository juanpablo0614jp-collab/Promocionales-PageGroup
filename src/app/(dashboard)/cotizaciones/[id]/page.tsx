import { getQuote } from "@/lib/actions/quotes";
import { getContacts, getContact } from "@/lib/actions/contacts";
import { notFound } from "next/navigation";
import { QuoteDetailClient } from "./page-client";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quoteId = parseInt(id, 10);
  if (isNaN(quoteId)) notFound();

  const [quote, contacts] = await Promise.all([
    getQuote(quoteId),
    getContacts(),
  ]);

  if (!quote) notFound();

  const contact = quote.contactId
    ? await getContact(quote.contactId)
    : null;

  return (
    <QuoteDetailClient quote={quote} contact={contact} contacts={contacts} />
  );
}
