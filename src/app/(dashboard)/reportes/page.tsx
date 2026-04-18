import { getReportsData } from "@/lib/actions/reports";
import { ReportesClient } from "./page-client";

export default async function ReportesPage() {
  const data = await getReportsData();
  return <ReportesClient data={data} />;
}
