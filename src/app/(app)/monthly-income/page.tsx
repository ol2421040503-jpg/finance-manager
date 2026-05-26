"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney, YEAR_RANGE, MONTH_LIST } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil, Info, ChevronDown, ChevronUp } from "lucide-react";

export default function MonthlyIncomePage() {
  const { data, addMonthlyCommission, deleteIncomeRecord, editIncomeRecord } = useFinance();
  const { incomeHistory } = data;

  const currentYear = String(new Date().getFullYear());
  const currentMonth = `${String(new Date().getMonth() + 1).padStart(2, "0")}月`;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [commission, setCommission] = useState("");
  const [resultMsg, setResultMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 编辑对话框
  const [editId, setEditId] = useState<string | null>(null);
  const [editCommission, setEditCommission] = useState("");

  // 展开的记录详情
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleSubmit() {
    const amount = parseFloat(commission);
    if (isNaN(amount)) return;
    const result = addMonthlyCommission(year, month, amount);
    setResultMsg(
      result.success
        ? { type: "success", message: result.message }
        : { type: "error", message: result.message }
    );
    if (result.success) setCommission("");
    setTimeout(() => setResultMsg(null), 4000);
  }

  function handleDelete(id: string) {
    if (confirm("删除后将回滚账户余额，确定？")) {
      deleteIncomeRecord(id);
    }
  }

  function handleEditStart(id: string, currentCommission: number) {
    setEditId(id);
    setEditCommission(String(currentCommission));
  }

  function handleEditSave() {
    if (!editId) return;
    const amount = parseFloat(editCommission);
    if (isNaN(amount)) return;
    const result = editIncomeRecord(editId, amount);
    if (result.success) {
      setEditId(null);
    } else {
      alert(result.message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">月度工资提成</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          记录每月提成，系统按优先级自动分配
        </p>
      </div>

      {/* 分配说明 */}
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2.5 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          优先级：紧急备用金 → 年度准备金 → 平滑基金 → 投资消费。三项均满后按 5:3:2 分配
        </span>
      </div>

      {/* 输入表单 - 移动端纵向排列 */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">年份</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_RANGE.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">月份</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_LIST.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">提成(元)</Label>
              <Input
                type="number"
                step="any"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="输入提成金额"
                className="tabular-nums h-10"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!commission}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              计算并记录
            </Button>
          </div>

          {/* 结果提示 */}
          {resultMsg && (
            <div
              className={`mt-3 rounded-lg p-2.5 text-xs ${
                resultMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
              }`}
            >
              {resultMsg.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提成记录 - 卡片列表 */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">提成记录</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {incomeHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">暂无记录</p>
          ) : (
            <div className="space-y-2">
              {[...incomeHistory].reverse().map((record) => {
                const isExpanded = expandedId === record.id;
                return (
                  <div
                    key={record.id}
                    className="rounded-lg border border-border/50 overflow-hidden"
                  >
                    {/* 折叠头部 */}
                    <button
                      className="w-full flex items-center justify-between p-3 text-left active:bg-muted/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium tabular-nums">
                          {record.year}.{record.month.replace("月", "")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          提成 {formatMoney(record.commission)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums text-emerald-600">
                          +{formatMoney(record.totalIncome)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* 展开详情 */}
                    {isExpanded && (
                      <div className="border-t border-border/50 px-3 pb-3 pt-2 space-y-1.5">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">底薪</span>
                            <span className="tabular-nums">{formatMoney(record.baseSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">提成</span>
                            <span className="tabular-nums font-medium">{formatMoney(record.commission)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">紧急</span>
                            <span className="tabular-nums">{formatMoney(record.toEmergency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">年度</span>
                            <span className="tabular-nums">{formatMoney(record.toAnnual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">平滑</span>
                            <span className={`tabular-nums ${record.smoothAmount < 0 ? "text-rose-600" : ""}`}>
                              {formatMoney(record.smoothAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">稳健</span>
                            <span className="tabular-nums">{formatMoney(record.stableAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">进取</span>
                            <span className="tabular-nums">{formatMoney(record.growthAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">灵活</span>
                            <span className="tabular-nums">{formatMoney(record.flexibleAmount)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] flex-1"
                            onClick={() => handleEditStart(record.id, record.commission)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            修改
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] text-rose-600 hover:text-rose-700 flex-1"
                            onClick={() => handleDelete(record.id)}
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
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改提成记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>提成(元)</Label>
              <Input
                type="number"
                step="any"
                value={editCommission}
                onChange={(e) => setEditCommission(e.target.value)}
                className="tabular-nums h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              取消
            </Button>
            <Button onClick={handleEditSave} className="bg-amber-600 hover:bg-amber-700 text-white">
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
