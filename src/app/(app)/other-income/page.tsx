"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney, YEAR_RANGE, MONTH_LIST, OTHER_INCOME_TYPES } from "@/lib/types";
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
import { Plus, Trash2, Info } from "lucide-react";

export default function OtherIncomePage() {
  const { data, addOtherIncome, deleteOtherIncomeRecord } = useFinance();
  const { otherIncomeHistory } = data;

  const currentYear = String(new Date().getFullYear());
  const currentMonth = `${String(new Date().getMonth() + 1).padStart(2, "0")}月`;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [type, setType] = useState(OTHER_INCOME_TYPES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    addOtherIncome(year, month, type, num, note);
    setAmount("");
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete(id: string) {
    if (confirm("删除后将回滚账户余额，确定？")) {
      deleteOtherIncomeRecord(id);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">其他收入</h1>
        <p className="text-sm text-muted-foreground mt-1">
          记录兼职、红包、退税等额外收入
        </p>
      </div>

      {/* 分配说明 */}
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          其他收入分配：90% 进入稳健投资+提前还款，10% 进入灵活消费
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
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OTHER_INCOME_TYPES.map((t) => (
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
              <Label>备注</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="可选"
                className="w-40"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!amount}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>
          {saved && (
            <p className="mt-3 text-sm text-emerald-600">其他收入已记录</p>
          )}
        </CardContent>
      </Card>

      {/* 记录表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">其他收入记录</CardTitle>
        </CardHeader>
        <CardContent>
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
                  [...otherIncomeHistory]
                    .reverse()
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="tabular-nums">{record.year}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatMoney(record.amount)}
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
