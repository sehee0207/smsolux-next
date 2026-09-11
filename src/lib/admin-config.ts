export type AdminFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "tags"
  | "detail-list"
  | "image"
  | "datetime-local";

export interface AdminFieldConfig {
  name: string;
  label: string;
  type?: AdminFieldType;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
  storageBucket?: string;
}

export interface AdminSectionConfig {
  id: string;
  table: string;
  title: string;
  description: string;
  primaryKey?: string;
  publicPath: string;
  adminPath: string;
  revalidatePaths: string[];
  emptyStateLabel: string;
  fields: AdminFieldConfig[];
}

export const ADMIN_SECTIONS: Record<string, AdminSectionConfig> = {
  reviews: {
    id: "reviews",
    table: "reviews",
    title: "활동 후기",
    description: "홈 화면 후기 슬라이더의 내용을 관리합니다.",
    primaryKey: "id",
    publicPath: "/",
    adminPath: "/admin/home",
    revalidatePaths: ["/", "/admin", "/admin/home"],
    emptyStateLabel: "등록된 리뷰가 없습니다.",
    fields: [
      {
        name: "name",
        label: "이름",
        placeholder: "홍길동",
        required: true,
      },
      {
        name: "gen",
        label: "기수",
        placeholder: "34기",
        required: true,
      },
      {
        name: "part",
        label: "파트",
        placeholder: "Frontend",
        required: true,
      },
      {
        name: "content",
        label: "후기 내용",
        type: "textarea",
        rows: 4,
        placeholder: "후기 내용",
        required: true,
      },
    ],
  },
  activities: {
    id: "activities",
    table: "activities",
    title: "활동 타임라인",
    description: "활동 소개와 세부 카드를 노출 순서대로 관리합니다.",
    primaryKey: "id",
    publicPath: "/activity",
    adminPath: "/admin/activity",
    revalidatePaths: ["/activity", "/admin", "/admin/activity"],
    emptyStateLabel: "활동 데이터가 없습니다.",
    fields: [
      {
        name: "title",
        label: "제목",
        placeholder: "정기 세미나",
        required: true,
      },
      {
        name: "description",
        label: "설명",
        type: "textarea",
        rows: 4,
        placeholder: "활동 설명",
        required: true,
      },
      {
        name: "details",
        label: "세부 카드",
        type: "detail-list",
        rows: 5,
        placeholder: "세부 제목 :: 세부 설명",
        description: "한 줄에 하나씩 입력합니다. 형식: 제목 :: 설명",
      },
      {
        name: "order",
        label: "노출 순서",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
  },
  projects: {
    id: "projects",
    table: "projects",
    title: "프로젝트 아카이브",
    description: "기수별 프로젝트와 수상 정보를 관리합니다.",
    primaryKey: "id",
    publicPath: "/project",
    adminPath: "/admin/projects",
    revalidatePaths: ["/project", "/projects", "/admin", "/admin/projects"],
    emptyStateLabel: "프로젝트가 없습니다.",
    fields: [
      {
        name: "generation",
        label: "기수",
        type: "number",
        placeholder: "34",
        required: true,
      },
      {
        name: "year",
        label: "연도",
        type: "number",
        placeholder: "2026",
        required: true,
      },
      {
        name: "term",
        label: "학기",
        placeholder: "1학기",
        required: true,
      },
      {
        name: "title",
        label: "프로젝트명",
        placeholder: "프로젝트 이름",
        required: true,
      },
      {
        name: "team_name",
        label: "팀명",
        placeholder: "Team SOLUX",
        required: true,
      },
      {
        name: "desc",
        label: "설명",
        type: "textarea",
        rows: 4,
        placeholder: "프로젝트 설명",
        required: true,
      },
      {
        name: "award",
        label: "수상",
        placeholder: "대상",
      },
      {
        name: "category",
        label: "분야",
        placeholder: "Web / App / Game / Data / Web&Data",
        required: true,
      },
      {
        name: "stacks",
        label: "기술 스택",
        type: "tags",
        placeholder: "Next.js, Supabase, Figma",
      },
      {
        name: "image",
        label: "프로젝트 이미지",
        type: "image",
        accept: "image/jpeg,image/png,image/webp,image/gif,image/avif",
        maxSizeMb: 5,
        storageBucket: "project-thumbnail",
        description:
          "JPG, PNG, WebP, GIF, AVIF 파일을 업로드합니다. 최대 5MB이며, 수정할 때 파일을 선택하지 않으면 기존 이미지가 유지됩니다.",
      },
      {
        name: "link",
        label: "프로젝트 링크",
        placeholder: "https://...",
      },
    ],
  },
  recruitments: {
    id: "recruitments",
    table: "recruitments",
    title: "모집 공고",
    description: "공고를 미리 등록하고 공개 여부와 모집 기간을 관리합니다.",
    primaryKey: "id",
    publicPath: "/recruit",
    adminPath: "/admin/recruit",
    revalidatePaths: ["/recruit", "/admin", "/admin/recruit"],
    emptyStateLabel: "모집 공고가 없습니다.",
    fields: [
      {
        name: "title",
        label: "공고 제목",
        placeholder: "35기 신입 부원 모집",
        required: true,
      },
      {
        name: "generation",
        label: "모집 기수",
        type: "number",
        placeholder: "35",
      },
      {
        name: "start_date",
        label: "모집 시작",
        type: "datetime-local",
        required: true,
      },
      {
        name: "end_date",
        label: "모집 마감",
        type: "datetime-local",
        required: true,
      },
      {
        name: "application_url",
        label: "지원 링크",
        placeholder: "https://...",
        required: true,
      },
      {
        name: "is_active",
        label: "게시 허용",
        type: "checkbox",
        description: "체크된 공고가 현재 모집 배너에 노출됩니다.",
      },
    ],
  },
  faqs: {
    id: "faqs",
    table: "faqs",
    title: "자주 묻는 질문",
    description: "지원자가 자주 묻는 질문과 답변을 관리합니다.",
    primaryKey: "id",
    publicPath: "/recruit",
    adminPath: "/admin/recruit",
    revalidatePaths: ["/recruit", "/admin", "/admin/recruit"],
    emptyStateLabel: "FAQ가 없습니다.",
    fields: [
      {
        name: "question",
        label: "질문",
        type: "textarea",
        rows: 2,
        placeholder: "자주 묻는 질문",
        required: true,
      },
      {
        name: "answer",
        label: "답변",
        type: "textarea",
        rows: 4,
        placeholder: "답변",
        required: true,
      },
    ],
  },
};

export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin/home",
    label: "Home",
    eyebrow: "/",
    description: "활동 후기",
  },
  {
    href: "/admin/activity",
    label: "Activity",
    eyebrow: "/activity",
    description: "활동 타임라인 관리",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    eyebrow: "/project",
    description: "프로젝트 아카이브",
  },
  {
    href: "/admin/recruit",
    label: "Recruit",
    eyebrow: "/recruit",
    description: "모집 공고와 FAQ",
  },
];
