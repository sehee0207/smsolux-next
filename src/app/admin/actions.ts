"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_SECTIONS,
  type AdminFieldConfig,
  type AdminSectionConfig,
} from "@/lib/admin-config";
import { requireAdminDatabase } from "@/lib/admin-db";
import { getSupabaseStorageObjectPath } from "@/lib/storage";

class AdminValidationError extends Error {}

type AdminDatabaseClient = Awaited<ReturnType<typeof requireAdminDatabase>>;

type StoredFile = {
  bucket: string;
  path: string;
};

const IMAGE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function getImageFile(field: AdminFieldConfig, formData: FormData) {
  const value = formData.get(field.name);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  const allowedMimeTypes = (field.accept ?? "")
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean);
  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[value.type];

  if (
    !extension ||
    (allowedMimeTypes.length && !allowedMimeTypes.includes(value.type))
  ) {
    throw new AdminValidationError(
      `${field.label}은 JPG, PNG, WebP, GIF, AVIF 파일만 업로드할 수 있습니다.`
    );
  }

  const maxSizeMb = field.maxSizeMb ?? 5;

  if (value.size > maxSizeMb * 1024 * 1024) {
    throw new AdminValidationError(
      `${field.label} 파일 크기는 ${maxSizeMb}MB 이하여야 합니다.`
    );
  }

  return { file: value, extension };
}

async function removeStoredFiles(
  database: AdminDatabaseClient,
  files: StoredFile[]
) {
  const errors: string[] = [];

  for (const { bucket, path } of files) {
    try {
      const { error } = await database.storage.from(bucket).remove([path]);

      if (error) {
        errors.push(`${bucket}/${path}: ${error.message}`);
      }
    } catch (error) {
      errors.push(`${bucket}/${path}: ${getErrorMessage(error)}`);
    }
  }

  return errors;
}

function parseDetailList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...descriptionParts] = line.split("::");

      return {
        title: title.trim(),
        description: descriptionParts.join("::").trim(),
      };
    })
    .filter((detail) => detail.title);
}

function parseFieldValue(field: AdminFieldConfig, formData: FormData) {
  if (field.type === "checkbox") {
    return formData.get(field.name) === "on";
  }

  const raw = formData.get(field.name)?.toString().trim() ?? "";

  if (!raw) {
    if (field.required) {
      throw new AdminValidationError(`${field.label} 항목을 입력해주세요.`);
    }

    return null;
  }

  switch (field.type) {
    case "number": {
      const value = Number(raw);

      if (!Number.isFinite(value)) {
        throw new AdminValidationError(`${field.label} 항목은 숫자여야 합니다.`);
      }

      return value;
    }
    case "tags":
      return raw
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    case "detail-list":
      return parseDetailList(raw);
    case "datetime-local": {
      const wallClockUtc = `${raw}${raw.length === 16 ? ":00" : ""}Z`;
      const date = new Date(wallClockUtc);

      if (Number.isNaN(date.getTime())) {
        throw new AdminValidationError(`${field.label} 날짜가 올바르지 않습니다.`);
      }

      return date.toISOString();
    }
    default:
      return raw;
  }
}

function getSection(sectionId: string): AdminSectionConfig | null {
  return Object.prototype.hasOwnProperty.call(ADMIN_SECTIONS, sectionId)
    ? ADMIN_SECTIONS[sectionId]
    : null;
}

function getRedirectPath(
  path: string,
  message: string,
  status: "success" | "error"
) {
  const params = new URLSearchParams({ message, status });
  return `${path}?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

function revalidateSection(section: AdminSectionConfig) {
  section.revalidatePaths.forEach((path) => revalidatePath(path));
}

export async function saveAdminRecord(formData: FormData) {
  const sectionId = formData.get("sectionId")?.toString() ?? "";
  const section = getSection(sectionId);

  if (!section) {
    redirect(getRedirectPath("/admin/home", "알 수 없는 섹션입니다.", "error"));
  }

  let payload: Record<string, unknown>;

  try {
    payload = Object.fromEntries(
      section.fields
        .filter((field) => field.type !== "image")
        .map((field) => [field.name, parseFieldValue(field, formData)])
    );
  } catch (error) {
    redirect(getRedirectPath(section.adminPath, getErrorMessage(error), "error"));
  }

  const primaryKey = section.primaryKey ?? "id";
  const recordId = formData.get(primaryKey)?.toString().trim();
  const imageFields = section.fields.filter((field) => field.type === "image");
  const uploadedFiles: StoredFile[] = [];
  let recordSaved = false;

  try {
    const database = await requireAdminDatabase();
    let existingRecord: Record<string, unknown> | null = null;

    if (recordId && imageFields.length) {
      const { data, error } = await database
        .from(section.table)
        .select(imageFields.map((field) => field.name).join(","))
        .eq(primaryKey, recordId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("수정할 항목을 찾지 못했습니다.");
      }

      existingRecord = data as unknown as Record<string, unknown>;
    }

    for (const field of imageFields) {
      const selectedImage = getImageFile(field, formData);

      if (!selectedImage) {
        if (field.required && !recordId) {
          throw new AdminValidationError(`${field.label} 파일을 선택해주세요.`);
        }

        continue;
      }

      if (!field.storageBucket) {
        throw new Error(`${field.label}의 스토리지 버킷 설정이 없습니다.`);
      }

      const path = `${section.id}/${new Date().getUTCFullYear()}/${randomUUID()}.${
        selectedImage.extension
      }`;
      const { error } = await database.storage
        .from(field.storageBucket)
        .upload(path, await selectedImage.file.arrayBuffer(), {
          cacheControl: "31536000",
          contentType: selectedImage.file.type,
          upsert: false,
        });

      if (error) {
        throw new Error(`${field.label} 업로드 실패: ${error.message}`);
      }

      payload[field.name] = path;
      uploadedFiles.push({ bucket: field.storageBucket, path });
    }

    const query = recordId
      ? database
          .from(section.table)
          .update(payload)
          .eq(primaryKey, recordId)
          .select(primaryKey)
      : database.from(section.table).insert(payload).select(primaryKey);
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data?.length) {
      throw new Error(
        recordId
          ? "수정할 항목을 찾지 못했거나 DB 수정 권한이 없습니다."
          : "저장 결과를 확인하지 못했습니다."
      );
    }

    recordSaved = true;

    const replacedFiles = imageFields.flatMap((field) => {
      const newValue = payload[field.name];
      const oldValue = existingRecord?.[field.name];

      if (
        typeof newValue !== "string" ||
        typeof oldValue !== "string" ||
        !field.storageBucket
      ) {
        return [];
      }

      const oldPath = getSupabaseStorageObjectPath(oldValue, field.storageBucket);
      return oldPath && oldPath !== newValue
        ? [{ bucket: field.storageBucket, path: oldPath }]
        : [];
    });

    const cleanupErrors = await removeStoredFiles(database, replacedFiles);

    if (cleanupErrors.length) {
      console.error("교체된 관리자 이미지 정리 실패:", cleanupErrors);
    }
  } catch (error) {
    if (!recordSaved && uploadedFiles.length) {
      try {
        const database = await requireAdminDatabase();
        const cleanupErrors = await removeStoredFiles(database, uploadedFiles);

        if (cleanupErrors.length) {
          console.error("저장 실패 후 업로드 이미지 정리 실패:", cleanupErrors);
        }
      } catch (cleanupError) {
        console.error("저장 실패 후 업로드 이미지 정리 실패:", cleanupError);
      }
    }

    redirect(
      getRedirectPath(
        section.adminPath,
        `${section.title} 저장 실패: ${getErrorMessage(error)}`,
        "error"
      )
    );
  }

  revalidateSection(section);
  redirect(
    getRedirectPath(section.adminPath, `${section.title} 저장 완료`, "success")
  );
}

export async function deleteAdminRecord(formData: FormData) {
  const sectionId = formData.get("sectionId")?.toString() ?? "";
  const section = getSection(sectionId);

  if (!section) {
    redirect(getRedirectPath("/admin/home", "알 수 없는 섹션입니다.", "error"));
  }

  const primaryKey = section.primaryKey ?? "id";
  const recordId = formData.get(primaryKey)?.toString().trim();

  if (!recordId) {
    redirect(
      getRedirectPath(section.adminPath, "삭제할 항목의 id가 없습니다.", "error")
    );
  }

  let cleanupWarning = "";

  try {
    const database = await requireAdminDatabase();
    const imageFields = section.fields.filter(
      (field) => field.type === "image" && field.storageBucket
    );
    let storedFiles: StoredFile[] = [];

    if (imageFields.length) {
      const { data: existingRecord, error: readError } = await database
        .from(section.table)
        .select(imageFields.map((field) => field.name).join(","))
        .eq(primaryKey, recordId)
        .maybeSingle();

      if (readError) {
        throw readError;
      }

      storedFiles = imageFields.flatMap((field) => {
        const value = (
          existingRecord as unknown as Record<string, unknown> | null
        )?.[field.name];
        const path =
          typeof value === "string"
            ? getSupabaseStorageObjectPath(value, field.storageBucket!)
            : null;

        return path ? [{ bucket: field.storageBucket!, path }] : [];
      });
    }

    const { data, error } = await database
      .from(section.table)
      .delete()
      .eq(primaryKey, recordId)
      .select(primaryKey);

    if (error) {
      throw error;
    }

    if (!data?.length) {
      throw new Error("삭제할 항목을 찾지 못했거나 DB 삭제 권한이 없습니다.");
    }

    const cleanupErrors = await removeStoredFiles(database, storedFiles);

    if (cleanupErrors.length) {
      console.error("삭제된 관리자 항목 이미지 정리 실패:", cleanupErrors);
      cleanupWarning = "항목은 삭제했지만 이미지 파일 정리에 실패했습니다.";
    }
  } catch (error) {
    redirect(
      getRedirectPath(
        section.adminPath,
        `${section.title} 삭제 실패: ${getErrorMessage(error)}`,
        "error"
      )
    );
  }

  revalidateSection(section);

  if (cleanupWarning) {
    redirect(getRedirectPath(section.adminPath, cleanupWarning, "error"));
  }

  redirect(
    getRedirectPath(section.adminPath, `${section.title} 삭제 완료`, "success")
  );
}
