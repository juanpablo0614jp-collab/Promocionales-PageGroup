import { getSupplierWithPurchases } from "@/lib/actions/suppliers";
import { notFound } from "next/navigation";
import { SupplierDetailClient } from "./page-client";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplierId = parseInt(id, 10);
  if (isNaN(supplierId)) notFound();

  const data = await getSupplierWithPurchases(supplierId);
  if (!data) notFound();

  return <SupplierDetailClient data={data} />;
}
