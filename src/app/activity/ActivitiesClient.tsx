"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Rocket,
    Presentation,
    BookOpen,
    MonitorPlay,
    PartyPopper,
    CalendarDays,
    Star,
    ArrowUpRight,
    PencilLine,
    Plus,
    Save,
    Trash2,
    X
} from "lucide-react";
import { Activity } from "@/types/activity";
import { deleteActivityInline, saveActivityInline } from "./actions";
import {
    formatActivityDetailsInput,
    parseActivityDetailsInput,
} from "@/lib/activity-details";
import Link from "next/link";

interface ActivitiesClientProps {
    initialActivities: Activity[];
    canEdit?: boolean;
}

type ActivityDraft = {
    id?: number;
    title: string;
    description: string;
    detailsText: string;
    order: number;
};

const createDraftFromActivity = (activity: Activity): ActivityDraft => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    detailsText: formatActivityDetailsInput(activity.details),
    order: activity.order,
});

const createEmptyDraft = (nextOrder: number): ActivityDraft => ({
    title: "",
    description: "",
    detailsText: "",
    order: nextOrder,
});

const sortActivities = (activities: Activity[]) =>
    [...activities].sort((a, b) => a.order - b.order);

function ActivityEditorBar({
    draft,
    isPending,
    message,
    onClose,
    onCreate,
    onDelete,
    onSave,
}: {
    draft: ActivityDraft | null;
    isPending: boolean;
    message: string | null;
    onClose: () => void;
    onCreate: () => void;
    onDelete: () => void;
    onSave: () => void;
}) {
    return (
        <div className="fixed inset-x-4 bottom-4 z-[70] rounded-3xl border border-[#8CE0F4]/20 bg-[#111317]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:inset-x-auto md:right-6 md:top-24 md:bottom-auto md:w-[340px]">
            <div className="flex flex-col gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8CE0F4]">
                        Live Editing
                    </p>
                    <p className="mt-1 text-sm text-white">
                        {draft?.title?.trim()
                            ? `"${draft.title}" 편집 중`
                            : "새 활동 카드 작성 중"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                        카드 자체를 클릭해서 바로 수정하고, 저장 또는 삭제로 마무리하세요.
                    </p>
                    {message && (
                        <p className="mt-2 text-xs text-white/55">{message}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onCreate}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        <Plus className="h-4 w-4" />
                        새 카드
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                        닫기
                    </button>
                    {draft?.id ? (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Trash2 className="h-4 w-4" />
                            삭제
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isPending || !draft}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#8CE0F4] px-4 py-2.5 text-sm font-bold text-[#071013] transition-colors hover:bg-[#9ae8f9] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const ActivityIcon = ({ title }: { title: string }) => {
    if (title.includes("프로젝트")) return <Rocket size={28} className="text-[#8CE0F4]" />;
    if (title.includes("스타터")) return <Star size={28} className="text-[#ADE6D2]" />;
    if (title.includes("발표회")) return <Presentation size={28} className="text-[#A1B3DD]" />;
    if (title.includes("스터디")) return <BookOpen size={28} className="text-[#A6C9D8]" />;
    if (title.includes("강의")) return <MonitorPlay size={28} className="text-[#8CE0F4]/80" />;
    if (title.includes("오프라인")) return <PartyPopper size={28} className="text-[#ADE6D2]/80" />;
    return <CalendarDays size={28} className="text-white/40" />;
};

export default function ActivitiesClient({
    initialActivities,
    canEdit = false,
}: ActivitiesClientProps) {
    const router = useRouter();
    const [activities, setActivities] = useState(() => sortActivities(initialActivities));
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(
        initialActivities[0]?.id ?? null
    );
    const [draft, setDraft] = useState<ActivityDraft | null>(
        initialActivities[0] ? createDraftFromActivity(initialActivities[0]) : null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const draftDetails = draft ? parseActivityDetailsInput(draft.detailsText) : [];

    const handleSelectActivity = (activity: Activity) => {
        setSelectedId(activity.id ?? null);
        setDraft(createDraftFromActivity(activity));
        setMessage(null);
    };

    const handleCreateDraft = () => {
        const nextOrder =
            activities.reduce((max, activity) => Math.max(max, activity.order), 0) + 1;
        setSelectedId(null);
        setDraft(createEmptyDraft(nextOrder));
        setMessage("새 활동 카드를 작성 중입니다.");
    };

    const handleDraftChange = (field: keyof ActivityDraft, value: string | number) => {
        setDraft((current) => (current ? { ...current, [field]: value } : current));
    };

    const handleDetailChange = (
        index: number,
        field: "title" | "description",
        value: string
    ) => {
        setDraft((current) => {
            if (!current) {
                return current;
            }

            const details = parseActivityDetailsInput(current.detailsText);
            const nextDetails = details.map((detail, detailIndex) =>
                detailIndex === index ? { ...detail, [field]: value } : detail
            );

            return {
                ...current,
                detailsText: formatActivityDetailsInput(nextDetails),
            };
        });
    };

    const handleAddDetail = () => {
        setDraft((current) => {
            if (!current) {
                return current;
            }

            const details = parseActivityDetailsInput(current.detailsText);
            details.push({
                title: "새 세부 카드",
                description: "",
            });

            return {
                ...current,
                detailsText: formatActivityDetailsInput(details),
            };
        });
    };

    const handleRemoveDetail = (index: number) => {
        setDraft((current) => {
            if (!current) {
                return current;
            }

            const details = parseActivityDetailsInput(current.detailsText).filter(
                (_, detailIndex) => detailIndex !== index
            );

            return {
                ...current,
                detailsText: formatActivityDetailsInput(details),
            };
        });
    };

    const handleSave = () => {
        if (!draft) {
            return;
        }

        startTransition(async () => {
            const result = await saveActivityInline({
                id: draft.id,
                title: draft.title,
                description: draft.description,
                details: parseActivityDetailsInput(draft.detailsText),
                order: draft.order,
            });

            setMessage(result.message);

            if (!result.success || !result.activity) {
                return;
            }

            const savedActivity = result.activity;

            setActivities((current) => {
                const next = current.filter((activity) => activity.id !== savedActivity.id);
                next.push(savedActivity);
                return sortActivities(next);
            });
            setSelectedId(savedActivity.id ?? null);
            setDraft(createDraftFromActivity(savedActivity));
            router.refresh();
        });
    };

    const handleDelete = () => {
        if (!draft?.id) {
            setDraft(null);
            setSelectedId(null);
            setMessage("새 활동 초안을 닫았습니다.");
            return;
        }

        if (!window.confirm("이 활동 카드를 삭제할까요?")) {
            return;
        }

        startTransition(async () => {
            const result = await deleteActivityInline(draft.id as number);
            setMessage(result.message);

            if (!result.success) {
                return;
            }

            const nextActivities = activities.filter((activity) => activity.id !== draft.id);
            const fallback = nextActivities[0];

            setActivities(nextActivities);
            setSelectedId(fallback?.id ?? null);
            setDraft(fallback ? createDraftFromActivity(fallback) : null);
            router.refresh();
        });
    };

    return (
        <main className="min-h-screen bg-[#0F1012] text-white selection:bg-[#8CE0F4]/30 overflow-x-hidden">
            {canEdit && (
                <>
                    <button
                        type="button"
                        onClick={() => setIsEditorOpen(true)}
                        className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full border border-[#8CE0F4]/30 bg-[#10161B]/90 px-4 py-3 text-sm font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:bg-[#162028]"
                    >
                        <PencilLine className="h-4 w-4 text-[#8CE0F4]" />
                        Activity 편집
                    </button>

                    {isEditorOpen && (
                        <ActivityEditorBar
                            draft={draft}
                            isPending={isPending}
                            message={message}
                            onClose={() => setIsEditorOpen(false)}
                            onCreate={handleCreateDraft}
                            onDelete={handleDelete}
                            onSave={handleSave}
                        />
                    )}
                </>
            )}

            <div
                className={`relative z-10 container mx-auto max-w-7xl px-6 pt-32 pb-20 transition-[padding] duration-300 md:px-10 ${canEdit && isEditorOpen
                    ? "pb-48 md:pr-[400px]"
                    : ""
                    }`}
            >
                <div className="mb-24 space-y-6 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight tracking-tight items-center"
                    >
                        Life at{" "}
                        <span className="text-transparent bg-clip-text bg-primary">
                            SOLUX
                        </span>
                    </motion.h1>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-white/50 text-base md:text-lg max-w-xl leading-relaxed break-keep mx-auto md:mx-0"
                        >
                            정기 세미나부터 네트워킹까지, 솔룩스만의 다양한 활동들을 확인해보세요.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex justify-center md:justify-start pt-2 lg:pt-0"
                        >
                            <Link
                                href="https://solux.tistory.com/category"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1 text-white/70 hover:text-[#8CE0F4] text-xs md:text-sm font-medium transition-colors duration-200"
                            >
                                더 많은 기록 보기
                                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200" />
                            </Link>
                        </motion.div>
                    </div>
                </div>

                <div className="relative space-y-24 md:space-y-32">
                    <div className="hidden md:block absolute left-16 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                    {activities.map((activity, idx) => (
                        <motion.div
                            key={activity.id || idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`relative flex flex-col gap-8 rounded-[28px] px-4 py-5 transition-colors md:flex-row md:gap-12 md:px-6 ${canEdit && isEditorOpen ? "cursor-pointer" : ""
                                } ${canEdit && isEditorOpen && selectedId === (activity.id ?? null)
                                    ? "border border-[#8CE0F4]/25 bg-[#8CE0F4]/8 shadow-[0_0_0_1px_rgba(140,224,244,0.08)]"
                                    : "border border-transparent"
                                }`}
                            onClick={() => {
                                if (!canEdit || !isEditorOpen) {
                                    return;
                                }

                                handleSelectActivity(activity);
                            }}
                        >
                            <div className="flex-shrink-0 relative z-10">
                                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-[#1A1C20] border border-white/10 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]">
                                    <div className="scale-75 md:scale-125">
                                        <ActivityIcon title={activity.title} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow pt-2">
                                {canEdit && isEditorOpen && selectedId === (activity.id ?? null) && (
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#8CE0F4]/20 bg-[#8CE0F4]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8CE0F4]">
                                            Live Editing
                                        </div>
                                        <div className="text-xs text-white/35">
                                            이 카드에서 직접 수정 중
                                        </div>
                                    </div>
                                )}
                                {canEdit && isEditorOpen && selectedId === (activity.id ?? null) && draft ? (
                                    <>
                                        <input
                                            value={draft.title}
                                            onChange={(event) => handleDraftChange("title", event.target.value)}
                                            placeholder="활동 제목"
                                            className="mb-6 w-full rounded-2xl border border-[#8CE0F4]/25 bg-white/5 px-4 py-3 text-lg font-bold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#8CE0F4]/70 focus:bg-white/8 md:text-xl"
                                            onClick={(event) => event.stopPropagation()}
                                        />

                                        <textarea
                                            value={draft.description}
                                            onChange={(event) => handleDraftChange("description", event.target.value)}
                                            placeholder="활동 설명"
                                            rows={5}
                                            className="mb-8 w-full rounded-2xl border border-[#8CE0F4]/25 bg-white/5 px-4 py-3 text-base leading-relaxed text-gray-300 outline-none transition-colors placeholder:text-white/20 focus:border-[#8CE0F4]/70 focus:bg-white/8 md:text-md"
                                            onClick={(event) => event.stopPropagation()}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-3">
                                            {activity.title}
                                        </h3>

                                        <div className="text-gray-400 leading-relaxed mb-8 text-base md:text-md whitespace-pre-line break-keep">
                                            {activity.description}
                                        </div>
                                    </>
                                )}

                                {(canEdit && isEditorOpen && selectedId === (activity.id ?? null) && draft
                                    ? draftDetails
                                    : activity.details
                                )?.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(canEdit && isEditorOpen && selectedId === (activity.id ?? null) && draft
                                            ? draftDetails
                                            : activity.details
                                        )?.map((detail, detailIdx) =>
                                            canEdit && isEditorOpen && selectedId === (activity.id ?? null) && draft ? (
                                                <div
                                                    key={detailIdx}
                                                    className="rounded-xl border border-[#8CE0F4]/20 bg-white/6 p-5"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <input
                                                        value={detail.title}
                                                        onChange={(event) =>
                                                            handleDetailChange(detailIdx, "title", event.target.value)
                                                        }
                                                        className="mb-3 w-full border-b border-[#8CE0F4]/20 bg-transparent pb-2 text-md font-bold text-[#8CE0F4] outline-none placeholder:text-[#8CE0F4]/40 focus:border-[#8CE0F4]/60"
                                                        placeholder="세부 카드 제목"
                                                    />
                                                    <textarea
                                                        value={detail.description}
                                                        onChange={(event) =>
                                                            handleDetailChange(
                                                                detailIdx,
                                                                "description",
                                                                event.target.value
                                                            )
                                                        }
                                                        rows={4}
                                                        className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-300 outline-none placeholder:text-white/20"
                                                        placeholder="세부 카드 설명"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDetail(detailIdx)}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        카드 삭제
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    key={detailIdx}
                                                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                                                >
                                                    <h4 className="text-[#8CE0F4] font-bold text-md mb-2">
                                                        {detail.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-300 leading-relaxed">
                                                        {detail.description}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : null}

                                {canEdit && isEditorOpen && selectedId === (activity.id ?? null) && draft && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleAddDetail();
                                        }}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#8CE0F4]/30 bg-[#8CE0F4]/8 px-4 py-3 text-sm font-semibold text-[#8CE0F4] transition-colors hover:bg-[#8CE0F4]/14"
                                    >
                                        <Plus className="h-4 w-4" />
                                        세부 카드 추가
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
