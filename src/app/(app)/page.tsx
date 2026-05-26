"use client";

import { useFinance } from "@/lib/finance-store";
import { ACCOUNT_CN, ACCOUNT_KEYS, ACCOUNT_COLORS, formatMoney } from "@/lib/types";
import type { Accounts } from "@/lib/types";
import { getTotalAssets, getAnnualTotal } from "@/lib/finance-logic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  annual: "春节红包、保险费、体检等年度固定开销",
  smooth: "旺季存入、淡季支取，平滑月支出",
  prepayment: "累计达标后建议缩短贷款期限",
  stableInvest: "大额存单、国债、纯债基金，目标3%-4%",
  growthInvest: "沪深300/中证500定投，目标8%-12%",
  flexible: "购物、旅行、大餐，自由支配",
};

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
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">总览</h1>
        <p className="text-sm text-muted-foreground mt-1">账户余额与资金分布一目了然</p>
      </div>

      {/* 总资产卡片 */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Wallet className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总资产</p>
              <p className="text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {formatMoney(totalAssets)}
                <span className="text-base font-normal ml-1">元</span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">月支出</p>
              <p className="font-semibold tabular-nums">{formatMoney(basicInfo.monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">年度预算({currentYear})</p>
              <p className="font-semibold tabular-nums">{formatMoney(annualTotal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">底薪</p>
              <p className="font-semibold tabular-nums">{formatMoney(basicInfo.baseSalary)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 各账户卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ACCOUNT_KEYS.map((key) => {
          const Icon = ACCOUNT_ICONS[key];
          const balance = accounts[key];
          const barColor = getBarColor(key);
          const barBgColor = getBarBgColor(key);
          const maxBar = Math.max(totalAssets, 1);
          const barPercent = (balance / maxBar) * 100;

          return (
            <Card key={key} className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${barBgColor}`}>
                  <Icon className="h-4 w-4 text-foreground/70" />
                </div>
                <CardTitle className="text-sm font-medium">{ACCOUNT_CN[key]}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xl font-bold tabular-nums">
                  {formatMoney(balance)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">元</span>
                </p>
                <div className={`mt-2 h-1.5 rounded-full ${barBgColor}`}>
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${Math.min(barPercent, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {ACCOUNT_DESCRIPTIONS[key]}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近提成记录 */}
      {data.incomeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近提成记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.incomeHistory
                .slice(-5)
                .reverse()
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {record.year} {record.month}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        提成 {formatMoney(record.commission)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-emerald-600">
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
