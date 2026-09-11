import AdminMessage from "@/components/admin/AdminMessage";
import AdminSection from "@/components/admin/AdminSection";
import { fetchTableRecords } from "@/lib/admin-data";
import { ADMIN_SECTIONS } from "@/lib/admin-config";

type SearchParams = Promise<{
  message?: string;
  status?: "success" | "error";
}>;

export default async function AdminRecruitPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { message, status } = await searchParams;
  const [recruitments, faqs] = await Promise.all([
    fetchTableRecords("recruitments", {
      orderBy: "end_date",
      ascending: false,
    }),
    fetchTableRecords("faqs", {
      orderBy: "id",
      ascending: true,
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminMessage message={message} status={status} />
      <AdminSection
        section={ADMIN_SECTIONS.recruitments}
        records={recruitments as Record<string, unknown>[]}
        createMode="modal"
        editMode="modal"
      />
      <AdminSection
        section={ADMIN_SECTIONS.faqs}
        records={faqs as Record<string, unknown>[]}
        recordLayout="grid"
        createMode="modal"
        editMode="modal"
      />
    </div>
  );
}
