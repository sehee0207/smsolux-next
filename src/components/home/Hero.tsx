"use client";

import dynamic from "next/dynamic";
import { TextBadge } from "@/components/common/TextBadge";

/**
 * 등장 애니메이션은 CSS 로 돌린다. framer-motion 을 쓰면 초기 상태가
 * 서버 HTML 에 opacity:0 으로 찍혀서, 스크립트를 다 받기 전까지 첫 화면이
 * 검게 비어 보인다. CSS 는 첫 페인트부터 동작한다.
 */
const HeroCanvas = dynamic(() => import("@/components/home/HeroCanvas"), {
    ssr: false,
});

export default function Hero({ className }: { className?: string }) {
    return (
        <section className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden ${className}`}>
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <HeroCanvas />
            </div>

            <div className="animate-drift-one absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[130px] pointer-events-none" />
            <div className="animate-drift-two absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />

            <div className="relative z-10 container mx-auto max-w-7xl px-6 md:px-10 flex flex-col items-center text-center">
                <div className="animate-rise mb-6" style={{ animationDelay: "0.2s" }}>
                    <TextBadge text="Sookmyung Programming Club" />
                </div>

                <h1 className="animate-rise mb-3" style={{ animationDelay: "0.4s" }}>
                    <span
                        className="block text-8xl lg:text-9xl font-black text-white tracking-tighter font-montserrat"
                        style={{
                            textShadow: "0 0 40px rgba(140, 224, 244, 0.4)",
                            fontWeight: 900
                        }}
                    >
                        SOLUX
                    </span>
                </h1>

                <div
                    className="animate-rise max-w-3xl flex flex-col items-center gap-6"
                    style={{ animationDelay: "0.6s" }}
                >
                    <p className="text-lg md:text-xl text-white font-semibold tracking-tight break-keep bg-clip-text bg-gradient-to-br from-white via-blue-50 to-blue-200">
                        숙명여자대학교 유일 <br className="md:hidden" />프로그래밍 중앙 동아리
                    </p>

                    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <p className="text-md md:text-lg text-gray-400 font-light leading-relaxed break-keep">
                        <strong className="font-semibold text-white/90">상상을 현실로 —</strong><br />
                        아이디어가 <strong className="font-bold">기획</strong>을 만나<br />
                        <strong className="font-bold">디자인</strong>과 <strong className="font-bold">코드</strong>로 완성되는 곳.
                    </p>
                </div>

            </div>

            <div
                className="animate-fade-in absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                style={{ animationDelay: "1.2s" }}
            >
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Scroll Down</span>
                <div className="w-6 h-10 border-2 border-gray-500/50 rounded-full flex justify-center p-1 backdrop-blur-sm">
                    <div className="animate-scroll-wheel w-1 h-2 bg-primary rounded-full" />
                </div>
            </div>

        </section>
    );
}
