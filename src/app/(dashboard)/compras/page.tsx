import { getPurchases } from "@/lib/actions/purchases";
import { getJobs } from "@/lib/actions/jobs";
import { getSuppliers } from "@/lib/actions/suppliers";
import { db } from "@/lib/db";
import { fundingSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ComprasPageClient } from "./page-client";

export default async function ComprasPage() {
  const [allPurchases, allJobs, allSuppliers, allFundingSources] = await Promise.all([
    getPurchases(),
    getJobs(),
    getSuppliers(),
    db.select().from(fundingSources).where(eq(fundingSources.activo, true)),
  ]);

  return (
    <ComprasPageClient
      purchases={allPurchases}
      jobs={allJobs}
      suppliers={allSuppliers}
      fundingSources={allFundingSources}
    />
  );
}
