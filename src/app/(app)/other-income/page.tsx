"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { formatMoney, YEAR_RANGE, MONTH_LIST, OTHER_INCOME_TYPES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">其他收入</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          记录兼职、红包、退税等额外收入
        </p>
      </div>

      {/* 分配说明 */}
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2.5 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>90% 进入稳健投资+提前还款，10% 进入灵活消费</span>
      </div>

      {/* 输入表单 */}
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
              <Label className="text-xs">类型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OTHER_INCOME_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">金额(元)</Label>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="输入金额"
                className="tabular-nums h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">备注</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="可选"
                className="h-10"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!amount}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>
          {saved && (
            <p className="mt-2 text-xs text-emerald-600">其他收入已记录</p>
          )}
        </CardContent>
      </Card>

      {/* 记录列表 */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">其他收入记录</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {otherIncomeHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">暂无记录</p>
          ) : (
            <div className="space-y-2">
              {[...otherIncomeHistory].reverse().map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium tabular-nums">
                        {record.year}.{record.month.replace("月", "")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{record.type}</span>
                    </div>
                    {record.note && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{record.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-semibold tabular-nums text-emerald-600">
                      +{formatMoney(record.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-600 hover:text-rose-700"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
