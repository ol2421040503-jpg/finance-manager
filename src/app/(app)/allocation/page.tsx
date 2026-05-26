"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney, ACCOUNT_CN } from "@/lib/types";
import { calculateInitialAllocation, getAnnualTotal } from "@/lib/finance-logic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AllocationPage() {
  const { data, currentYear, applyAllocation } = useFinance();
  const { basicInfo, accounts } = data;

  const [allocation, setAllocation] = useState<Record<string, number> | null>(null);
  const [applied, setApplied] = useState(false);

  function handleCalculate() {
    const result = calculateInitialAllocation(basicInfo, currentYear);
    setAllocation(result);
    setApplied(false);
  }

  function handleApply() {
    if (!allocation) return;
    applyAllocation(currentYear);
    setApplied(true);
  }

  const total = basicInfo.totalSavings;
  const annualTotal = getAnnualTotal(basicInfo, currentYear);

  function pct(amount: number): string {
    return total > 0 ? `${((amount / total) * 100).toFixed(1)}%` : "0.0%";
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">存量资金分配</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          自动计算最优分配方案，一次性将存款分配到各账户
        </p>
      </div>

      {/* 当前状态 */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">现有总存款</p>
              <p className="text-base font-bold tabular-nums">{formatMoney(total)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">紧急备用金目标</p>
              <p className="text-base font-bold tabular-nums">
                {formatMoney(basicInfo.monthlyExpenses * basicInfo.emergencyMonths)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">年度准备金目标</p>
              <p className="text-base font-bold tabular-nums">{formatMoney(annualTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">平滑基金目标</p>
              <p className="text-base font-bold tabular-nums">
                {formatMoney(basicInfo.monthlyExpenses * basicInfo.smoothMonths)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 计算按钮 */}
      <Button onClick={handleCalculate} className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white">
        <Calculator className="h-4 w-4 mr-2" />
        计算分配方案
      </Button>

      {/* 分配结果 */}
      {allocation && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              分配方案（{currentYear}年预算）
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              现有总存款：<span className="font-semibold text-foreground">{formatMoney(total)} 元</span>
            </p>
            <Separator />

            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">优先级分配</p>
            {["紧急备用金", "年度大额支出准备金", "收入平滑基金"].map((name) => (
              <div key={name} className="flex items-center justify-between py-0.5">
                <span className="text-xs">{name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{pct(allocation[name])}</span>
                  <span className="text-xs font-semibold tabular-nums">{formatMoney(allocation[name])} 元</span>
                </div>
              </div>
            ))}

            <Separator />
            <p className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">
              剩余资金分配
            </p>
            {["提前还款准备金", "稳健投资", "进取投资", "灵活消费"].map((name) => (
              <div key={name} className="flex items-center justify-between py-0.5">
                <span className="text-xs">{name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{pct(allocation[name])}</span>
                  <span className="text-xs font-semibold tabular-nums">{formatMoney(allocation[name])} 元</span>
                </div>
              </div>
            ))}

            <Separator />
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              所有资金已全部分配完毕
            </div>
          </CardContent>
        </Card>
      )}

      {/* 应用按钮 */}
      {allocation && (
        <div className="space-y-2">
          <Button
            onClick={handleApply}
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white"
            disabled={applied}
          >
            {applied ? "已应用" : "应用分配方案到账户"}
          </Button>
          {applied ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
              分配方案已应用
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 justify-center">
              <AlertTriangle className="h-3.5 w-3.5" />
              应用后将覆盖当前所有账户余额
            </div>
          )}
        </div>
      )}

      {/* 当前账户余额 */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">当前账户余额</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            {Object.entries(accounts).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs">{ACCOUNT_CN[key as keyof typeof ACCOUNT_CN]}</span>
                <span className="text-xs font-semibold tabular-nums">{formatMoney(value)} 元</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
