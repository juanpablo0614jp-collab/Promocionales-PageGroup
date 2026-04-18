import { getJobWithDetails } from "@/lib/actions/jobs";
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

  const data = await getJobWithDetails(jobId);
  if (!data) notFound();

  return <JobDetailClient data={data} />;
}
