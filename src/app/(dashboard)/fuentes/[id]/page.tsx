import { getFundingSourceWithMovements } from "@/lib/actions/funding-sources";
import { notFound } from "next/navigation";
import { FuenteDetailClient } from "./page-client";

export default async function FuenteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { id } = await params;
  const { desde, hasta } = await searchParams;
  const sourceId = parseInt(id, 10);
  if (isNaN(sourceId)) notFound();

  const data = await getFundingSourceWithMovements(sourceId, desde, hasta);
  if (!data) notFound();

  return <FuenteDetailClient data={data} desde={desde} hasta={hasta} />;
}
