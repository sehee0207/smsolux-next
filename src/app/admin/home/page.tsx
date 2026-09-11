import AdminMessage from "@/components/admin/AdminMessage";
import AdminSection from "@/components/admin/AdminSection";
import { fetchTableRecords } from "@/lib/admin-data";
import { ADMIN_SECTIONS } from "@/lib/admin-config";

type SearchParams = Promise<{
  message?: string;
  status?: "success" | "error";
}>;

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { message, status } = await searchParams;
  const reviews = await fetchTableRecords("reviews", {
    orderBy: "created_at",
    ascending: false,
  });

  return (
    <div className="space-y-6">
      <AdminMessage message={message} status={status} />
      <AdminSection
        section={ADMIN_SECTIONS.reviews}
        records={reviews as Record<string, unknown>[]}
        recordLayout="grid"
        createMode="modal"
        editMode="modal"
      />
    </div>
  );
}
