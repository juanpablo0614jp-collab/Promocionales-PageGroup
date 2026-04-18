import { getJobWithDetails } from "@/lib/actions/jobs";
import { getSuppliers } from "@/lib/actions/suppliers";
import { getAttachments } from "@/lib/actions/attachments";
import { db } from "@/lib/db";
import { fundingSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { JobDetailClient } from "./page-client";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) notFound();

  const [data, suppliers, allFundingSources, jobAttachments] = await Promise.all([
    getJobWithDetails(jobId),
    getSuppliers(),
    db.select().from(fundingSources).where(eq(fundingSources.activo, true)),
    getAttachments(jobId),
  ]);

  if (!data) notFound();

  return (
    <JobDetailClient
      data={data}
      suppliers={suppliers}
      fundingSources={allFundingSources}
      attachments={jobAttachments}
    />
  );
}
