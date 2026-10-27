import { EditView } from "@/components/EditView";
export const metadata = { title: "Edit sharing firman" };
export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <EditView id={(await params).id} />;
}
