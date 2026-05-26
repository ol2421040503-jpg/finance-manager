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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FinanceProvider } from "@/lib/finance-store";

const NAV_ITEMS = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/basic-info", label: "基础信息", icon: Settings },
  { href: "/allocation", label: "存量资金分配", icon: PiggyBank },
  { href: "/monthly-income", label: "月度工资提成", icon: TrendingUp },
  { href: "/other-income", label: "其他收入", icon: Wallet },
  { href: "/expenses", label: "支出记录", icon: Receipt },
  { href: "/balance", label: "账户余额", icon: Landmark },
  { href: "/history", label: "综合历史", icon: History },
  { href: "/rules", label: "规则说明", icon: BookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <FinanceProvider>
      <div className="flex h-screen overflow-hidden">
        {/* 侧边栏 */}
        <aside
          className={cn(
            "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
            collapsed ? "w-16" : "w-56"
          )}
        >
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-sidebar-border px-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                财
              </div>
              {!collapsed && (
                <span className="whitespace-nowrap text-sm font-semibold text-sidebar-foreground">
                  销售理财管理器
                </span>
              )}
            </div>
          </div>

          {/* 导航 */}
          <nav className="flex-1 overflow-y-auto py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* 折叠按钮 */}
          <div className="border-t border-sidebar-border p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-6xl p-6">{children}</div>
        </main>
      </div>
    </FinanceProvider>
  );
}
