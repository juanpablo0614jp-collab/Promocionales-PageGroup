import { getFundingSourcesWithBalances } from "@/lib/actions/funding-sources";
import { FuentesPageClient } from "./page-client";

export default async function FuentesPage() {
  const sources = await getFundingSourcesWithBalances();
  return <FuentesPageClient sources={sources} />;
}
