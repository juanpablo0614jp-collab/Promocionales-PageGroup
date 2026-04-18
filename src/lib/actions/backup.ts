"use server";

import { db } from "@/lib/db";
import {
  contacts,
  suppliers,
  fundingSources,
  quotes,
  jobs,
  purchases,
  paymentsReceived,
  cashMovements,
  attachments,
} from "@/lib/db/schema";

export async function getFullBackup() {
  const [
    allContacts,
    allSuppliers,
    allFundingSources,
    allQuotes,
    allJobs,
    allPurchases,
    allPayments,
    allMovements,
    allAttachments,
  ] = await Promise.all([
    db.select().from(contacts),
    db.select().from(suppliers),
    db.select().from(fundingSources),
    db.select().from(quotes),
    db.select().from(jobs),
    db.select().from(purchases),
    db.select().from(paymentsReceived),
    db.select().from(cashMovements),
    db.select().from(attachments),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    data: {
      contacts: allContacts,
      suppliers: allSuppliers,
      fundingSources: allFundingSources,
      quotes: allQuotes,
      jobs: allJobs,
      purchases: allPurchases,
      paymentsReceived: allPayments,
      cashMovements: allMovements,
      attachments: allAttachments,
    },
  };
}
