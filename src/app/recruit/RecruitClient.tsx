"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { Faq, RecruitmentNotice } from "@/types/recruit";
import { RECRUIT_CORE_VALUES } from "@/lib/site-content";
import { formatDateTime } from "@/utils/date";

const ValueStyles: { [key: string]: { icon: React.ReactNode, gradient: string } } = {
    growth: {
        icon: <TrendingUp size={40} className="text-[#8CE0F4]" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
    },
    solidarity: {
        icon: <Users size={40} className="text-[#A1B3DD]" />,
        gradient: "from-indigo-500/20 to-purple-500/20",
    },
    responsibility: {
        icon: <ShieldCheck size={40} className="text-[#ADE6D2]" />,
        gradient: "from-emerald-500/20 to-teal-500/20",
    },
};

interface RecruitClientProps {
    initialFaqs: Faq[];
    activeRecruitment?: RecruitmentNotice | null;
}

export default function RecruitClient({ initialFaqs, activeRecruitment }: RecruitClientProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <main className="min-h-screen bg-[#0F1012] text-white selection:bg-[#8CE0F4]/30 overflow-x-hidden">
            <div className="relative z-10 container mx-auto px-6 md:px-10 pt-32 pb-10 max-w-7xl">
                <div className="mb-24 space-y-6 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight tracking-tight"
                    >
                        <span className="text-transparent bg-clip-text bg-primary">
                            Apply Now
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-white/50 text-base md:text-lg max-w-xl leading-relaxed break-keep mx-auto md:mx-0"
                    >
                        솔룩스의 다음 챕터를 함께 써 내려갈, 당신의 열정을 기다립니다.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-36">
                    {RECRUIT_CORE_VALUES.map((value, idx) => {
                        const style = ValueStyles[value.key] || ValueStyles.growth;
                        return (
                            <motion.div
                                key={value.key}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 backdrop-blur-sm border border-white/10">
                                    {style.icon}
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">
                                    {value.title}
                                </h3>

                                <p className="text-white/50 leading-relaxed text-sm">
                                    {value.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="max-w-4xl mx-auto mb-32">
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-3xl font-semibold text-center mb-10"
                    >
                        자주 묻는 질문
                    </motion.h2>

                    <div className="space-y-4">
                        {initialFaqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 transition-all duration-300 hover:border-white/20">
                                <button
                                    onClick={() => toggleAccordion(idx)}
                                    className="w-full flex justify-between items-center text-left group"
                                >
                                    <span className="text-base font-medium text-white/90 pr-6 leading-snug">
                                        {faq.question}
                                    </span>

                                    {openIndex === idx ? (
                                        <ChevronUp className="text-white/50 flex-shrink-0 mt-1 transition-colors" />
                                    ) : (
                                        <ChevronDown className="text-white/30 flex-shrink-0 mt-1 transition-colors group-hover:text-white/50" />
                                    )}
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === idx
                                        ? "max-h-40 opacity-100 mt-4"
                                        : "max-h-0 opacity-0"
                                        }`}
                                >

                                    <p className="text-white/50 leading-relaxed text-sm">
                                        {faq.answer}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative max-w-3xl mx-auto text-center py-30 px-6"
                >
                    {activeRecruitment ? (
                        <>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8CE0F4]/10 border border-[#8CE0F4]/20 mb-10">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8CE0F4] opacity-50"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8CE0F4]"></span>
                                </span>
                                <span className="text-[11px] font-bold text-[#8CE0F4] tracking-[0.15em] uppercase">
                                    Recruiting Now
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight tracking-[-0.02em] text-white">
                                <span className="drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]">
                                    {activeRecruitment.title}
                                </span>
                            </h2>


                            <div className="mb-12">
                                <p className="text-lg md:text-xl text-white/80 font-medium tracking-tight mb-4">
                                    {formatDateTime(activeRecruitment.start_date)}<br className="sm:hidden" /> ~ {formatDateTime(activeRecruitment.end_date)}
                                </p>
                                <p className="text-sm text-white/40 break-keep">
                                    숙명여자대학교 계정으로만 지원이 가능합니다.
                                </p>
                            </div>

                            <a
                                href={activeRecruitment.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-3 bg-[#8CE0F4] text-black text-sm md:text-base font-bold rounded-full hover:scale-105 hover:shadow-[0_0_50px_rgba(140,224,244,0.3)] active:scale-95 transition-all duration-300 group"
                            >
                                지원하기
                                <svg
                                    className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold mb-6 text-white/60 tracking-tight">
                                현재 모집 기간이 아닙니다
                            </h2>

                            <p className="text-sm text-white/40 break-keep mb-12">
                                다음 모집 소식을 기다려주세요.<br />
                                인스타그램을 팔로우하시면 빠르게 소식을 받아보실 수 있습니다.
                            </p>

                            <button
                                disabled
                                className="px-8 py-3 bg-white/5 text-white/20 text-sm md:text-md font-medium rounded-full cursor-not-allowed border border-white/5"
                            >
                                모집 준비 중
                            </button>
                        </>
                    )}
                </motion.div>
            </div>
        </main >
    );
}
