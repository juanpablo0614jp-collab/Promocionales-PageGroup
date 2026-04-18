import { getQuotes } from "@/lib/actions/quotes";
import { getContacts } from "@/lib/actions/contacts";
import { CotizacionesPageClient } from "./page-client";

export default async function CotizacionesPage() {
  const [quotes, contacts] = await Promise.all([getQuotes(), getContacts()]);

  return <CotizacionesPageClient quotes={quotes} contacts={contacts} />;
}
