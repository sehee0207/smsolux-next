"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { Suspense } from "react";

/**
 * Hero 뒤에 깔리는 별 배경.
 *
 * three.js 가 클라이언트 번들에서 가장 큰 덩어리라(약 874KB) 첫 화면을
 * 막지 않도록 Hero 에서 지연 로딩한다. 장식이므로 한 박자 늦게 떠도 된다.
 */
export default function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <Sparkles
          count={200}
          scale={[10, 10, 10]}
          size={2}
          speed={0.4}
          opacity={0.6}
          color="#8CE0F4"
        />
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Suspense>
    </Canvas>
  );
}
