import CampaignDetailPage from "./page.client";

export default function Page({ params }: { params: { id: string } }) {
  return <CampaignDetailPage id={params.id} />;
}
