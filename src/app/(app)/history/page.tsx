"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Download, BarChart3 } from "lucide-react";

export default function HistoryPage() {
  const { data, deleteIncomeRecord, deleteOtherIncomeRecord, deleteExpenseRecord } = useFinance();
  const { incomeHistory, otherIncomeHistory, expenseHistory } = data;

  function handleExportCSV() {
    const rows: string[][] = [];
    // 工资提成
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">综合历史</h1>
          <p className="text-sm text-muted-foreground mt-1">查看所有收支记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            导出CSV
          </Button>
        </div>
      </div>

      {/* 提成统计 */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              提成统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">月份数</p>
                <p className="text-lg font-bold tabular-nums">{commissions.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">平均提成</p>
                <p className="text-lg font-bold tabular-nums">{formatMoney(avgCommission)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">最高</p>
                <p className="text-lg font-bold tabular-nums text-emerald-600">
                  {formatMoney(Math.max(...commissions))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">最低</p>
                <p className="text-lg font-bold tabular-nums text-amber-600">
                  {formatMoney(Math.min(...commissions))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 三类历史记录 */}
      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">工资提成</TabsTrigger>
          <TabsTrigger value="other">其他收入</TabsTrigger>
          <TabsTrigger value="expense">支出记录</TabsTrigger>
        </TabsList>

        {/* 工资提成 */}
        <TabsContent value="income">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">年份</TableHead>
                      <TableHead className="w-16">月份</TableHead>
                      <TableHead className="text-right">总收入</TableHead>
                      <TableHead className="text-right">底薪</TableHead>
                      <TableHead className="text-right">提成</TableHead>
                      <TableHead className="text-right">紧急</TableHead>
                      <TableHead className="text-right">年度</TableHead>
                      <TableHead className="text-right">平滑</TableHead>
                      <TableHead className="text-right">稳健</TableHead>
                      <TableHead className="text-right">进取</TableHead>
                      <TableHead className="text-right">灵活</TableHead>
                      <TableHead className="w-16">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                          暂无记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...incomeHistory].reverse().map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="tabular-nums">{r.year}</TableCell>
                          <TableCell>{r.month}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatMoney(r.totalIncome)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(r.baseSalary)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatMoney(r.commission)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(r.toEmergency)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(r.toAnnual)}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className={r.smoothAmount < 0 ? "text-rose-600" : ""}>
                              {formatMoney(r.smoothAmount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(r.stableAmount)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(r.growthAmount)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(r.flexibleAmount)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-600 hover:text-rose-700"
                              onClick={() => {
                                if (confirm("删除后将回滚账户余额，确定？")) deleteIncomeRecord(r.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 其他收入 */}
        <TabsContent value="other">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">年份</TableHead>
                      <TableHead className="w-16">月份</TableHead>
                      <TableHead className="w-24">类型</TableHead>
                      <TableHead className="text-right">金额(元)</TableHead>
                      <TableHead>备注</TableHead>
                      <TableHead className="w-16">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherIncomeHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          暂无记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...otherIncomeHistory].reverse().map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="tabular-nums">{r.year}</TableCell>
                          <TableCell>{r.month}</TableCell>
                          <TableCell>{r.type}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatMoney(r.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.note || "-"}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 支出记录 */}
        <TabsContent value="expense">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">年份</TableHead>
                      <TableHead className="w-16">月份</TableHead>
                      <TableHead className="w-28">类型</TableHead>
                      <TableHead className="text-right">金额(元)</TableHead>
                      <TableHead>用途</TableHead>
                      <TableHead className="w-16">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          暂无记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...expenseHistory].reverse().map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="tabular-nums">{r.year}</TableCell>
                          <TableCell>{r.month}</TableCell>
                          <TableCell>{r.type}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium text-rose-600">
                            -{formatMoney(r.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.note || "-"}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
