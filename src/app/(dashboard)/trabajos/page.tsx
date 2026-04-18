import { getJobs } from "@/lib/actions/jobs";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { TrabajosPageClient } from "./page-client";

export default async function TrabajosPage() {
  const [allJobs, allQuotes] = await Promise.all([
    getJobs(),
    db.select().from(quotes),
  ]);

  return <TrabajosPageClient jobs={allJobs} quotes={allQuotes} />;
}
