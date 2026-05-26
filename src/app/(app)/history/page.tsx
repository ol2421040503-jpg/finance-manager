"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Download, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

export default function HistoryPage() {
  const { data, deleteIncomeRecord, deleteOtherIncomeRecord, deleteExpenseRecord } = useFinance();
  const { incomeHistory, otherIncomeHistory, expenseHistory } = data;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleExportCSV() {
    const rows: string[][] = [];
    rows.push(["=== 工资提成 ==="]);
    rows.push([
      "年份", "月份", "总收入", "底薪", "提成",
      "紧急", "年度", "平滑", "稳健", "进取", "灵活",
    ]);
    for (const r of incomeHistory) {
      rows.push([
        r.year, r.month, String(r.totalIncome), String(r.baseSalary),
        String(r.commission), String(r.toEmergency), String(r.toAnnual),
        String(r.smoothAmount), String(r.stableAmount),
        String(r.growthAmount), String(r.flexibleAmount),
      ]);
    }
    rows.push([]);
    rows.push(["=== 其他收入 ==="]);
    rows.push(["年份", "月份", "类型", "金额", "备注"]);
    for (const r of otherIncomeHistory) {
      rows.push([r.year, r.month, r.type, String(r.amount), r.note]);
    }
    rows.push([]);
    rows.push(["=== 支出记录 ==="]);
    rows.push(["年份", "月份", "类型", "金额", "用途"]);
    for (const r of expenseHistory) {
      rows.push([r.year, r.month, r.type, String(r.amount), r.note]);
    }

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const commissions = incomeHistory.map((r) => r.commission);
  const avgCommission = commissions.length > 0 ? commissions.reduce((a, b) => a + b, 0) / commissions.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">综合历史</h1>
          <p className="text-xs text-muted-foreground mt-0.5">查看所有收支记录</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleExportCSV}>
          <Download className="h-3 w-3 mr-1" />
          导出CSV
        </Button>
      </div>

      {/* 提成统计 */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              提成统计
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">月份数</p>
                <p className="text-base font-bold tabular-nums">{commissions.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">平均提成</p>
                <p className="text-base font-bold tabular-nums">{formatMoney(avgCommission)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">最高</p>
                <p className="text-base font-bold tabular-nums text-emerald-600">
                  {formatMoney(Math.max(...commissions))}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">最低</p>
                <p className="text-base font-bold tabular-nums text-amber-600">
                  {formatMoney(Math.min(...commissions))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 三类历史记录 */}
      <Tabs defaultValue="income">
        <TabsList className="w-full h-9">
          <TabsTrigger value="income" className="text-xs flex-1">工资提成</TabsTrigger>
          <TabsTrigger value="other" className="text-xs flex-1">其他收入</TabsTrigger>
          <TabsTrigger value="expense" className="text-xs flex-1">支出记录</TabsTrigger>
        </TabsList>

        {/* 工资提成 */}
        <TabsContent value="income">
          {incomeHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">暂无记录</p>
          ) : (
            <div className="space-y-2 mt-2">
              {[...incomeHistory].reverse().map((r) => {
                const isExpanded = expandedId === `income-${r.id}`;
                return (
                  <div key={r.id} className="rounded-lg border border-border/50 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-3 text-left active:bg-muted/50"
                      onClick={() => setExpandedId(isExpanded ? null : `income-${r.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium tabular-nums">
                          {r.year}.{r.month.replace("月", "")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          提成 {formatMoney(r.commission)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold tabular-nums text-emerald-600">
                          +{formatMoney(r.totalIncome)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border/50 px-3 pb-3 pt-2 space-y-1.5">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">底薪</span>
                            <span className="tabular-nums">{formatMoney(r.baseSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">紧急</span>
                            <span className="tabular-nums">{formatMoney(r.toEmergency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">年度</span>
                            <span className="tabular-nums">{formatMoney(r.toAnnual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">平滑</span>
                            <span className={`tabular-nums ${r.smoothAmount < 0 ? "text-rose-600" : ""}`}>
                              {formatMoney(r.smoothAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">稳健</span>
                            <span className="tabular-nums">{formatMoney(r.stableAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">进取</span>
                            <span className="tabular-nums">{formatMoney(r.growthAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">灵活</span>
                            <span className="tabular-nums">{formatMoney(r.flexibleAmount)}</span>
                          </div>
                        </div>
                        <div className="pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] text-rose-600 hover:text-rose-700"
                            onClick={() => {
                              if (confirm("删除后将回滚账户余额，确定？")) deleteIncomeRecord(r.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 其他收入 */}
        <TabsContent value="other">
          {otherIncomeHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">暂无记录</p>
          ) : (
            <div className="space-y-2 mt-2">
              {[...otherIncomeHistory].reverse().map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium tabular-nums">
                        {r.year}.{r.month.replace("月", "")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{r.type}</span>
                    </div>
                    {r.note && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-semibold tabular-nums text-emerald-600">
                      +{formatMoney(r.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-600 hover:text-rose-700"
                      onClick={() => {
                        if (confirm("删除后将回滚账户余额，确定？")) deleteOtherIncomeRecord(r.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 支出记录 */}
        <TabsContent value="expense">
          {expenseHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">暂无记录</p>
          ) : (
            <div className="space-y-2 mt-2">
              {[...expenseHistory].reverse().map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium tabular-nums">
                        {r.year}.{r.month.replace("月", "")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{r.type}</span>
                    </div>
                    {r.note && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-semibold tabular-nums text-rose-600">
                      -{formatMoney(r.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-600 hover:text-rose-700"
                      onClick={() => {
                        if (confirm("删除后将回滚账户余额，确定？")) deleteExpenseRecord(r.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
