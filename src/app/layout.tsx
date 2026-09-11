import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { Montserrat, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppFrame from "@/components/layout/AppFrame";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://sm-solux.dev"
  ),
  title: "SOLUX - 숙명여자대학교 개발 동아리",
  description: "숙명여자대학교 유일 프로그래밍 중앙 동아리 SOLUX입니다.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SOLUX - 숙명여자대학교 개발 동아리",
    description: "숙명여자대학교 유일 프로그래밍 중앙 동아리 SOLUX입니다.",
    siteName: "SOLUX",
    images: [
      {
        url: "/thumbnail.png",
        width: 1898,
        height: 866,
        alt: "Page Thumbnail",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${montserrat.variable} ${notoSansKr.variable} bg-background text-white antialiased`}>
        <Analytics />
        <SpeedInsights />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
