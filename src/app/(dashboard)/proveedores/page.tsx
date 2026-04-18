import { getSuppliers } from "@/lib/actions/suppliers";
import { ProveedoresPageClient } from "./page-client";

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers();
  return <ProveedoresPageClient suppliers={suppliers} />;
}
