"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney, YEAR_RANGE, MONTH_LIST } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2 } from "lucide-react";

const EXPENSE_TYPES = ["年度大额支出", "灵活消费"] as const;

export default function ExpensesPage() {
  const { data, addExpense, deleteExpenseRecord } = useFinance();
  const { expenseHistory } = data;

  const currentYear = String(new Date().getFullYear());
  const currentMonth = `${String(new Date().getMonth() + 1).padStart(2, "0")}月`;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [type, setType] = useState<string>(EXPENSE_TYPES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [resultMsg, setResultMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleSubmit() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    const result = addExpense(
      year,
      month,
      type as "年度大额支出" | "灵活消费",
      num,
      note
    );
    setResultMsg(
      result.success
        ? { type: "success", message: result.message }
        : { type: "error", message: result.message }
    );
    if (result.success) {
      setAmount("");
      setNote("");
    }
    setTimeout(() => setResultMsg(null), 4000);
  }

  function handleDelete(id: string) {
    if (confirm("删除后将回滚账户余额，确定？")) {
      deleteExpenseRecord(id);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">支出记录</h1>
        <p className="text-sm text-muted-foreground mt-1">
          记录支出，从年度准备金或灵活消费账户扣款
        </p>
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
                    <SelectItem key={y} value={y}>{y}</SelectItem>
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
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>类型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>金额(元)</Label>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="输入金额"
                className="w-32 tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label>用途</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="支出用途"
                className="w-40"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!amount}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加支出
            </Button>
          </div>

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

      {/* 支出记录表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">支出记录</CardTitle>
        </CardHeader>
        <CardContent>
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
                  [...expenseHistory]
                    .reverse()
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="tabular-nums">{record.year}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              record.type === "年度大额支出"
                                ? "bg-violet-100 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300"
                            }`}
                          >
                            {record.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-rose-600">
                          -{formatMoney(record.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{record.note || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600 hover:text-rose-700"
                            onClick={() => handleDelete(record.id)}
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
    </div>
  );
}
