"use client";

import { useFinance } from "@/lib/finance-store";
import { ACCOUNT_CN, ACCOUNT_KEYS, ACCOUNT_COLORS, formatMoney } from "@/lib/types";
import type { Accounts } from "@/lib/types";
import { getTotalAssets, getAnnualTotal } from "@/lib/finance-logic";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  CalendarDays,
  TrendingUp,
  Home,
  BarChart3,
  Rocket,
  Coffee,
  Wallet,
} from "lucide-react";

const ACCOUNT_ICONS: Record<keyof Accounts, React.ElementType> = {
  emergency: Shield,
  annual: CalendarDays,
  smooth: TrendingUp,
  prepayment: Home,
  stableInvest: BarChart3,
  growthInvest: Rocket,
  flexible: Coffee,
};

const ACCOUNT_DESCRIPTIONS: Record<keyof Accounts, string> = {
  emergency: "失业、重大疾病、意外事故",
  annual: "春节红包、保险费、体检等",
  smooth: "旺季存入、淡季支取",
  prepayment: "累计达标后建议缩短贷款期限",
  stableInvest: "大额存单、国债，目标3%-4%",
  growthInvest: "沪深300/中证500定投",
  flexible: "购物、旅行、大餐",
};

function getIconBg(key: keyof Accounts): string {
  const colors: Record<string, string> = {
    sky: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  };
  return colors[ACCOUNT_COLORS[key]] || "bg-gray-100 text-gray-600";
}

function getBarColor(key: keyof Accounts): string {
  const colors: Record<string, string> = {
    sky: "bg-sky-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
  };
  return colors[ACCOUNT_COLORS[key]] || "bg-gray-500";
}

function getBarBgColor(key: keyof Accounts): string {
  const colors: Record<string, string> = {
    sky: "bg-sky-100 dark:bg-sky-950",
    violet: "bg-violet-100 dark:bg-violet-950",
    amber: "bg-amber-100 dark:bg-amber-950",
    rose: "bg-rose-100 dark:bg-rose-950",
    emerald: "bg-emerald-100 dark:bg-emerald-950",
    blue: "bg-blue-100 dark:bg-blue-950",
    orange: "bg-orange-100 dark:bg-orange-950",
  };
  return colors[ACCOUNT_COLORS[key]] || "bg-gray-100";
}

export default function DashboardPage() {
  const { data, currentYear } = useFinance();
  const { accounts, basicInfo } = data;
  const totalAssets = getTotalAssets(accounts);
  const annualTotal = getAnnualTotal(basicInfo, currentYear);

  return (
    <div className="space-y-4">
      {/* 页头 */}
      <div>
        <h1 className="text-xl font-bold text-foreground">总览</h1>
        <p className="text-xs text-muted-foreground mt-0.5">账户余额与资金分布</p>
      </div>

      {/* 总资产卡片 */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">总资产</p>
              <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {formatMoney(totalAssets)}
                <span className="text-sm font-normal ml-0.5">元</span>
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">月支出</p>
              <p className="font-semibold tabular-nums">{formatMoney(basicInfo.monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{currentYear}年度预算</p>
              <p className="font-semibold tabular-nums">{formatMoney(annualTotal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">底薪</p>
              <p className="font-semibold tabular-nums">{formatMoney(basicInfo.baseSalary)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 各账户卡片 - 紧凑列表风格 */}
      <div className="space-y-2">
        {ACCOUNT_KEYS.map((key) => {
          const Icon = ACCOUNT_ICONS[key];
          const balance = accounts[key];
          const barColor = getBarColor(key);
          const barBgColor = getBarBgColor(key);
          const iconBg = getIconBg(key);
          const maxBar = Math.max(totalAssets, 1);
          const barPercent = (balance / maxBar) * 100;

          return (
            <Card key={key} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{ACCOUNT_CN[key]}</span>
                      <span className="text-sm font-bold tabular-nums">
                        {formatMoney(balance)}
                        <span className="text-[10px] font-normal text-muted-foreground ml-0.5">元</span>
                      </span>
                    </div>
                    <div className={`mt-1.5 h-1 rounded-full ${barBgColor}`}>
                      <div
                        className={`h-full rounded-full ${barColor} transition-all`}
                        style={{ width: `${Math.min(barPercent, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground truncate">
                      {ACCOUNT_DESCRIPTIONS[key]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近提成记录 */}
      {data.incomeHistory.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">最近提成</p>
            <div className="space-y-2">
              {data.incomeHistory
                .slice(-5)
                .reverse()
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium tabular-nums">
                        {record.year}.{record.month.replace("月", "")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        提成 {formatMoney(record.commission)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-emerald-600">
                      +{formatMoney(record.totalIncome)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
