import { deleteAdminRecord, saveAdminRecord } from "@/app/admin/actions";
import {
  type AdminFieldConfig,
  type AdminSectionConfig,
} from "@/lib/admin-config";
import { ChevronDown, PencilLine, Plus } from "lucide-react";
import CreateRecordModal from "@/components/admin/CreateRecordModal";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { getKstWallClockTimestamp } from "@/utils/date";
import { resolveSupabaseImageUrl } from "@/lib/storage";

function formatDateTimeLocal(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  return date.toISOString().slice(0, 16);
}

function formatFieldValue(field: AdminFieldConfig, value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  switch (field.type) {
    case "tags":
      return Array.isArray(value) ? value.join(", ") : "";
    case "detail-list":
      return Array.isArray(value)
        ? value
            .map((detail) => {
              if (!detail || typeof detail !== "object") {
                return "";
              }

              const title =
                "title" in detail && typeof detail.title === "string"
                  ? detail.title
                  : "";
              const description =
                "description" in detail && typeof detail.description === "string"
                  ? detail.description
                  : "";

              return [title, description].filter(Boolean).join(" :: ");
            })
            .filter(Boolean)
            .join("\n")
        : "";
    case "datetime-local":
      return formatDateTimeLocal(value);
    default:
      return typeof value === "string" || typeof value === "number"
        ? String(value)
        : "";
  }
}

function FieldInput({
  field,
  value,
}: {
  field: AdminFieldConfig;
  value: unknown;
}) {
  const baseClassName =
    "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#8CE0F4]/60 focus:bg-black/30";

  if (field.type === "image") {
    const currentValue = typeof value === "string" ? value : "";
    const previewUrl = resolveSupabaseImageUrl(currentValue, {
      bucket: field.storageBucket,
    });

    return (
      <div className="mt-2 space-y-3">
        {previewUrl && (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {/* The Supabase host is environment-specific, so this admin preview intentionally uses a native image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${field.label} 현재 이미지`}
              className="h-40 w-full object-cover"
            />
            <p className="truncate border-t border-white/10 px-3 py-2 text-xs text-white/35">
              현재 이미지: {currentValue}
            </p>
          </div>
        )}
        <input
          type="file"
          name={field.name}
          accept={field.accept}
          required={field.required && !currentValue}
          className={`${baseClassName} file:mr-3 file:rounded-lg file:border-0 file:bg-[#8CE0F4] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#071013]`}
        />
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "detail-list") {
    return (
      <textarea
        name={field.name}
        defaultValue={formatFieldValue(field, value)}
        rows={field.rows ?? 4}
        required={field.required}
        placeholder={field.placeholder}
        className={`${baseClassName} resize-y`}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">{field.label}</p>
          <p className="text-xs text-white/35">체크한 항목만 공개 대상으로 사용합니다.</p>
        </div>
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(value)}
          className="h-5 w-5 rounded border-white/20 bg-black/30 accent-[#8CE0F4]"
        />
      </label>
    );
  }

  return (
    <input
      type={
        field.type === "number"
          ? "number"
          : field.type === "datetime-local"
          ? "datetime-local"
          : "text"
      }
      name={field.name}
      defaultValue={formatFieldValue(field, value)}
      required={field.required}
      placeholder={field.placeholder}
      className={baseClassName}
    />
  );
}

function getRecordHeadline(record: Record<string, unknown>) {
  const headlineCandidates = ["title", "name", "question", "label", "key"];

  for (const key of headlineCandidates) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "이름 없는 항목";
}

function joinRecordValues(
  record: Record<string, unknown>,
  fields: string[]
) {
  return fields
    .map((field) => record[field])
    .filter((value) =>
      typeof value === "string"
        ? Boolean(value.trim())
        : typeof value === "number"
    )
    .map(String)
    .join(" · ");
}

function getSummaryMeta(sectionId: string, record: Record<string, unknown>) {
  switch (sectionId) {
    case "reviews":
      return joinRecordValues(record, ["gen", "part"]);
    case "activities":
      return record.order === undefined ? "" : `노출 순서 ${record.order}`;
    case "projects":
      return joinRecordValues(record, ["generation", "term", "team_name"]);
    default:
      return "";
  }
}

function formatAdminDate(value: unknown) {
  if (typeof value !== "string") {
    return "날짜 미설정";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 확인 필요";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getRecruitmentStatus(record: Record<string, unknown>) {
  if (!record.is_active) {
    return {
      label: "비공개",
      className: "border-white/10 bg-white/5 text-white/40",
    };
  }

  const now = getKstWallClockTimestamp();
  const start = new Date(String(record.start_date ?? "")).getTime();
  const end = new Date(String(record.end_date ?? "")).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return {
      label: "날짜 확인",
      className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    };
  }

  if (now < start) {
    return {
      label: "게시 예정",
      className: "border-blue-400/20 bg-blue-400/10 text-blue-200",
    };
  }

  if (now >= end) {
    return {
      label: "마감",
      className: "border-white/10 bg-white/5 text-white/40",
    };
  }

  return {
    label: "모집 중",
    className: "border-[#8CE0F4]/25 bg-[#8CE0F4]/10 text-[#8CE0F4]",
  };
}

function getRecordBodyPreview(record: Record<string, unknown>) {
  const value = record.description ?? record.content ?? record.desc ?? record.answer;

  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  return value.trim();
}

export function RecordForm({
  section,
  record,
  isCreateForm = false,
  hideHeader = false,
  variant = "card",
}: {
  section: AdminSectionConfig;
  record: Record<string, unknown>;
  isCreateForm?: boolean;
  hideHeader?: boolean;
  variant?: "card" | "plain";
}) {
  const primaryKey = section.primaryKey ?? "id";
  const recordId = record[primaryKey];
  const formId = `${section.id}-${String(recordId ?? "new").replace(
    /[^a-zA-Z0-9_-]/g,
    "-"
  )}-form`;

  return (
    <article
      className={variant === "plain" ? "" : "rounded-2xl border border-white/10 bg-white/[0.025] p-5"}
    >
      {!hideHeader && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              {isCreateForm ? "새 항목 추가" : "기존 항목 수정"}
            </p>
            <h4 className="mt-1 text-lg font-semibold text-white">
              {isCreateForm ? `${section.title} 추가` : getRecordHeadline(record)}
            </h4>
          </div>
          {!isCreateForm && recordId !== undefined && recordId !== null && (
            <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/35">
              {primaryKey}: {String(recordId)}
            </span>
          )}
        </div>
      )}

      <div>
        <form
          id={formId}
          action={saveAdminRecord}
          data-pending-label={isCreateForm ? "추가" : "저장"}
          className="space-y-5"
        >
          <input type="hidden" name="sectionId" value={section.id} />
          {!isCreateForm && recordId !== undefined && recordId !== null && (
            <input type="hidden" name={primaryKey} value={String(recordId)} />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" ||
                  field.type === "detail-list" ||
                  field.type === "image"
                    ? "md:col-span-2"
                    : ""
                }
              >
                {field.type !== "checkbox" && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-sm font-semibold text-red-500">
                          *
                        </span>
                      )}
                    </label>
                  </div>
                )}
                <FieldInput field={field} value={record[field.name]} />
                {field.description && (
                  <p className="mt-2 text-xs leading-5 text-white/35">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </form>

        <div className="mt-5 flex justify-end gap-2">
          {!isCreateForm && recordId !== undefined && recordId !== null && (
            <form action={deleteAdminRecord} data-pending-label="삭제">
              <input type="hidden" name="sectionId" value={section.id} />
              <input type="hidden" name={primaryKey} value={String(recordId)} />
              <AdminDeleteButton />
            </form>
          )}
          <button
            type="submit"
            form={formId}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8CE0F4] px-4 py-2.5 text-sm font-bold text-[#071013] transition-colors hover:bg-[#9ae8f9]"
          >
            {isCreateForm ? <Plus className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
            {isCreateForm ? "새 항목 저장" : "변경사항 저장"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminSection({
  section,
  records,
  recordLayout = "list",
  createMode = "inline",
  editMode = "inline",
}: {
  section: AdminSectionConfig;
  records: Record<string, unknown>[];
  recordLayout?: "list" | "grid";
  createMode?: "inline" | "modal";
  editMode?: "inline" | "modal";
}) {
  return (
    <section className="space-y-5 border-b border-white/10 pb-10 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              {section.title}
            </h3>
            <span className="text-xs tabular-nums text-white/30">{records.length}</span>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/40">
            {section.description}
          </p>
        </div>
        {createMode === "modal" && (
          <CreateRecordModal sectionId={section.id} title={section.title}>
            <RecordForm
              section={section}
              record={{}}
              isCreateForm
              hideHeader
              variant="plain"
            />
          </CreateRecordModal>
        )}
      </div>

      {createMode === "inline" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#8CE0F4]" />
            <p className="text-sm font-semibold text-white">새 항목</p>
          </div>
          <RecordForm
            section={section}
            record={{}}
            isCreateForm
          />
        </div>
      )}

      {records.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center text-sm text-white/35">
          {section.emptyStateLabel} 위의 카드에서 첫 항목을 추가할 수 있습니다.
        </div>
      )}

      <div
        className={
          recordLayout === "grid"
            ? "grid gap-4 lg:grid-cols-2"
            : "space-y-4"
        }
      >
        {records.map((record, index) => {
          const recordKey = String(
            record[section.primaryKey ?? "id"] ?? `record-${index}`
          );
          const summaryMeta = getSummaryMeta(section.id, record);
          const recruitmentStatus =
            section.id === "recruitments" ? getRecruitmentStatus(record) : null;

          const summaryContent = (
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {recruitmentStatus && (
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${recruitmentStatus.className}`}>
                      {recruitmentStatus.label}
                    </span>
                  )}
                  {summaryMeta && (
                    <p className="text-xs text-white/35">{summaryMeta}</p>
                  )}
                </div>
                <p className={`${recruitmentStatus || summaryMeta ? "mt-3" : ""} text-base font-semibold text-white`}>
                  {getRecordHeadline(record)}
                </p>
                {section.id === "recruitments" ? (
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-xs font-medium text-white/35">마감</span>
                    <span className="text-lg font-semibold tabular-nums text-white">
                      {formatAdminDate(record.end_date)}
                    </span>
                    {recruitmentStatus?.label === "게시 예정" && (
                      <span className="text-xs text-white/30">
                        · 시작 {formatAdminDate(record.start_date)}
                      </span>
                    )}
                  </div>
                ) : getRecordBodyPreview(record) ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
                    {getRecordBodyPreview(record)}
                  </p>
                ) : null}
            </div>
          );

          return editMode === "modal" ? (
            <article
              key={recordKey}
              className="flex min-h-28 items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-5 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
            >
              {summaryContent}
              <div className="shrink-0">
                <CreateRecordModal
                  sectionId={`${section.id}-${recordKey}`}
                  title={getRecordHeadline(record)}
                  mode="edit"
                >
                  <RecordForm
                    section={section}
                    record={record}
                    hideHeader
                    variant="plain"
                  />
                </CreateRecordModal>
              </div>
            </article>
          ) : (
            <details
              key={recordKey}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] open:border-white/20"
            >
              <summary className="flex min-h-28 cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 transition-colors hover:bg-white/[0.035]">
                {summaryContent}
                <div className="flex shrink-0 items-center gap-2 text-sm text-white/35">
                  편집하기
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </div>
              </summary>
              <div className="border-t border-white/10 bg-black/10 px-5 py-5">
                <RecordForm
                  section={section}
                  record={record}
                />
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
