"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FilePenLine,
  Home,
  GalleryVerticalEnd,
  FolderKanban,
  Megaphone,
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-config";
import { signOutAdmin } from "@/app/admin/auth-actions";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

interface AdminShellProps {
  children: React.ReactNode;
  isBypassed: boolean;
  hasServiceRoleKey: boolean;
}

export default function AdminShell({
  children,
  isBypassed,
  hasServiceRoleKey,
}: AdminShellProps) {
  const pathname = usePathname();
  const navIcons = {
    "/admin/home": Home,
    "/admin/activity": GalleryVerticalEnd,
    "/admin/projects": FolderKanban,
    "/admin/recruit": Megaphone,
  } as const;

  const currentItem =
    ADMIN_NAV_ITEMS.find((item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? ADMIN_NAV_ITEMS[0];

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#0F1012] text-white">
      <div className="grid h-full overflow-hidden bg-[#0F1012] md:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden h-full border-r border-white/10 bg-[#111317] text-white md:flex md:flex-col">
            <div className="border-b border-white/10 px-6 py-6">
              <Link href="/admin/home" className="inline-flex items-center">
                <Image
                  src="/logo.png"
                  alt="SOLUX"
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Operations
              </p>
            </div>

            <div className="flex-1 px-3 py-5">
              <nav className="space-y-1.5">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon =
                    navIcons[item.href as keyof typeof navIcons] ?? FilePenLine;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-white/45 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-md ${
                          isActive
                            ? "bg-[#8CE0F4]/10 text-[#8CE0F4]"
                            : "bg-white/[0.04] text-white/35"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-[10px] uppercase tracking-[0.18em] ${
                            isActive ? "text-[#8CE0F4]/60" : "text-white/20"
                          }`}
                        >
                          {item.eyebrow}
                        </p>
                        <p className="mt-0.5 font-semibold">{item.label}</p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 border-t border-white/10 p-4">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                사이트 보기
              </Link>
              {!isBypassed && (
                <form action={signOutAdmin}>
                  <AdminLogoutButton />
                </form>
              )}
            </div>
          </aside>

          <main className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#0F1012] px-5 py-6 md:px-8 md:py-8 xl:px-12">
              <section className="mx-auto w-full max-w-6xl">
                <div className="mb-10 border-b border-white/10 pb-7">
                  <div className="md:hidden">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <Link href="/admin/home" className="inline-flex items-center">
                        <Image
                          src="/logo.png"
                          alt="SOLUX"
                          width={120}
                          height={32}
                          className="h-8 w-auto object-contain"
                          priority
                        />
                      </Link>
                      {!isBypassed && (
                        <form action={signOutAdmin}>
                          <AdminLogoutButton compact />
                        </form>
                      )}
                    </div>
                    <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
                      {ADMIN_NAV_ITEMS.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                        const Icon =
                          navIcons[item.href as keyof typeof navIcons] ??
                          FilePenLine;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold whitespace-nowrap ${
                              isActive
                                ? "border-[#8CE0F4]/25 bg-[#8CE0F4]/10 text-[#8CE0F4]"
                                : "border-white/10 bg-white/[0.03] text-white/45"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8CE0F4]/60">
                        {currentItem.eyebrow}
                      </p>
                      <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-white md:text-[32px]">
                        {currentItem.label}
                      </h1>
                    </div>

                  </div>
                </div>
                {isBypassed && !hasServiceRoleKey && (
                  <div
                    role="alert"
                    className="mb-8 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100"
                  >
                    로그인 우회 상태에서는 데이터 조회만 가능합니다. 저장·삭제를
                    사용하려면 서버 환경 변수에 <code>SUPABASE_SERVICE_ROLE_KEY</code>를
                    설정해주세요.
                  </div>
                )}
                {children}
              </section>
            </div>
          </main>
      </div>
    </div>
  );
}
