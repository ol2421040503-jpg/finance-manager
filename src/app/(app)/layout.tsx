"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  PiggyBank,
  TrendingUp,
  Wallet,
  Receipt,
  Landmark,
  History,
  BookOpen,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FinanceProvider } from "@/lib/finance-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// 底部 Tab 5个主要入口
const TAB_ITEMS = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/monthly-income", label: "提成", icon: TrendingUp },
  { href: "/other-income", label: "其他收入", icon: Wallet },
  { href: "/expenses", label: "支出", icon: Receipt },
  { href: "#more", label: "更多", icon: Menu },
];

// 更多菜单中的页面
const MORE_ITEMS = [
  { href: "/basic-info", label: "基础信息", icon: Settings, desc: "设置基本财务参数" },
  { href: "/allocation", label: "存量资金分配", icon: PiggyBank, desc: "一次性分配现有存款" },
  { href: "/balance", label: "账户余额", icon: Landmark, desc: "查看并管理各账户余额" },
  { href: "/history", label: "综合历史", icon: History, desc: "查看所有收支记录" },
  { href: "/rules", label: "规则说明", icon: BookOpen, desc: "了解分配规则" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "#more") return false;
    return pathname === href;
  };

  const isMoreChildActive = MORE_ITEMS.some((item) => pathname === item.href);

  return (
    <FinanceProvider>
      <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
        {/* 顶部标题栏 */}
        <header className="shrink-0 flex items-center h-12 px-4 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 safe-top">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-xs">
              财
            </div>
            <span className="text-sm font-semibold text-foreground">
              销售理财管理器
            </span>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-lg px-4 py-4 pb-24">
            {children}
          </div>
        </main>

        {/* 底部 Tab 栏 */}
        <nav className="shrink-0 border-t border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 safe-bottom">
          <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
            {TAB_ITEMS.map((item) => {
              const active = item.href === "#more" ? isMoreChildActive : isTabActive(item.href);
              const isMore = item.href === "#more";

              if (isMore) {
                return (
                  <button
                    key={item.href}
                    onClick={() => setMoreOpen(true)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 text-muted-foreground transition-colors active:scale-95",
                      isMoreChildActive && "text-amber-600"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[10px] leading-tight">更多</span>
                    {isMoreChildActive && (
                      <span className="absolute top-1 h-0.5 w-6 rounded-full bg-amber-600" />
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 text-muted-foreground transition-colors active:scale-95 relative",
                    active && "text-amber-600"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                  {active && (
                    <span className="absolute top-0 h-0.5 w-6 rounded-full bg-amber-600" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 更多菜单 Sheet */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh]">
            <SheetHeader className="pb-2">
              <SheetTitle className="text-left text-base">更多功能</SheetTitle>
            </SheetHeader>
            <div className="space-y-1 pb-safe">
              {MORE_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors active:bg-muted",
                      active
                        ? "bg-amber-50 dark:bg-amber-950/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          active && "text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </FinanceProvider>
  );
}
