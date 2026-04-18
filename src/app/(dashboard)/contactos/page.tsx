import { getContacts } from "@/lib/actions/contacts";
import { ContactsPageClient } from "./page-client";

export default async function ContactosPage() {
  const contacts = await getContacts();

  return <ContactsPageClient contacts={contacts} />;
}
