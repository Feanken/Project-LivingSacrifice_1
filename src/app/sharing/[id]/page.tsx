import { Suspense } from "react";
import { DetailView } from "@/components/DetailView";
export const metadata = { title: "Baca sharing firman" };
export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="shell detail-skeleton">Memuat sharing firman...</div>
      }
    >
      <DetailView id={id} />
    </Suspense>
  );
}
