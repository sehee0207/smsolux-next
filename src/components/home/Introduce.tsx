"use client";

import React from "react";
import { motion } from "framer-motion";
import { HOME_ACTIVITIES, HOME_STATS } from "@/lib/site-content";
import { FolderGit2, BookOpen, Presentation, Users } from "lucide-react";

// Fixed styling and icons for home activities
const ActivityStyles: { [key: string]: { icon: React.ReactNode, accent: string, bg: string, border: string } } = {
    project: {
        icon: <FolderGit2 size={20} />,
        accent: "text-[#8CE0F4]",
        bg: "bg-[#8CE0F4]/10",
        border: "border-[#8CE0F4]/20"
    },
    networking: {
        icon: <Users size={20} />,
        accent: "text-[#a1b3dd]",
        bg: "bg-[#a1b3dd]/10",
        border: "border-[#a1b3dd]/20"
    },
    study: {
        icon: <BookOpen size={20} />,
        accent: "text-[#ade6d2]",
        bg: "bg-[#ade6d2]/10",
        border: "border-[#ade6d2]/20"
    },
    seminar: {
        icon: <Presentation size={20} />,
        accent: "text-[#a6c9d8]",
        bg: "bg-[#a6c9d8]/10",
        border: "border-[#a6c9d8]/20"
    }
};

interface IntroduceProps {
    isSummary?: boolean;
    className?: string;
}

export default function Introduce({
    isSummary = false,
    className
}: IntroduceProps) {
    // Merge content with fixed styling
    const displayActivities = HOME_ACTIVITIES.map(activity => {
        const style = ActivityStyles[activity.key] || ActivityStyles.project;
        return {
            key: activity.key,
            title: activity.title,
            desc: activity.description,
            icon: style.icon,
            accent: style.accent,
            accentBg: style.bg,
            accentBorder: style.border
        };
    });

    return (
        <section className={`relative w-full overflow-hidden flex flex-col justify-center ${isSummary ? "py-20" : "py-24"} ${className}`}>
            <div className="container mx-auto max-w-7xl px-6 md:px-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-start lg:items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-5/12 space-y-8"
                    >
                        <div className="space-y-4">
                            <span className="inline-block text-[#8CE0F4] text-xs font-bold tracking-widest uppercase border-b border-[#8CE0F4]/30 pb-1">
                                About SOLUX
                            </span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[1.15] tracking-tight">
                                숙명여대 유일의
                                <br />
                                <span className="text-transparent bg-clip-text bg-primary">
                                    프로그래밍 중앙 동아리
                                </span>
                            </h2>
                        </div>

                        <p className="text-gray-400 leading-relaxed text-base md:text-lg break-keep">
                            소프트웨어학부 리눅스 학회에서 출발해,<br />
                            이제는 전공을 넘은 다양한 분야의 학우들이 모여<br />
                            <strong className="text-white/80">더 넓은 세상의 가능성</strong>을 함께 만들어갑니다.
                        </p>

                        <div className="pt-6 grid grid-cols-3 gap-6">
                            {HOME_STATS.map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                                    className={idx < HOME_STATS.length - 1 ? "border-r border-white/10 pr-4" : ""}
                                >
                                    <span className="block text-2xl font-black text-white">{stat.value}</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="w-full lg:w-6/12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displayActivities.map((activity, idx) => (
                            <motion.div
                                key={activity.key}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className={`group relative p-6 rounded-2xl bg-white/[0.03] border ${activity.accentBorder} hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1`}
                            >
                                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${activity.accentBg} pointer-events-none`} />

                                <div className={`w-11 h-11 rounded-xl ${activity.accentBg} border ${activity.accentBorder} flex items-center justify-center mb-4 ${activity.accent} group-hover:scale-110 transition-transform duration-300`}>
                                    {activity.icon}
                                </div>

                                <h3 className="text-white font-bold text-sm mb-2 tracking-tight">{activity.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed break-keep">{activity.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}