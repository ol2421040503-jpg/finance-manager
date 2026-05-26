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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil, Info } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">月度工资提成</h1>
        <p className="text-sm text-muted-foreground mt-1">
          记录每月提成，系统按优先级自动分配到各账户
        </p>
      </div>

      {/* 分配说明 */}
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          分配优先级：紧急备用金 → 年度准备金 → 平滑基金 → 投资消费。三项均满后按 5:3:2 分配至稳健/进取/灵活
        </span>
      </div>

      {/* 输入表单 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>年份</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_RANGE.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>月份</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_LIST.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>提成(元)</Label>
              <Input
                type="number"
                step="any"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="输入提成金额"
                className="w-40 tabular-nums"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!commission}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              计算并记录
            </Button>
          </div>

          {/* 结果提示 */}
          {resultMsg && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm ${
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

      {/* 提成记录表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">提成记录</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableHead className="w-20">操作</TableHead>
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
                  [...incomeHistory]
                    .reverse()
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="tabular-nums">{record.year}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatMoney(record.totalIncome)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(record.baseSalary)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatMoney(record.commission)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(record.toEmergency)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(record.toAnnual)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span
                            className={
                              record.smoothAmount < 0
                                ? "text-rose-600"
                                : ""
                            }
                          >
                            {formatMoney(record.smoothAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(record.stableAmount)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(record.growthAmount)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatMoney(record.flexibleAmount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditStart(record.id, record.commission)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
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
                className="tabular-nums"
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
