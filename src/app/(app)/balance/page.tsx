"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { ACCOUNT_CN, ACCOUNT_KEYS, formatMoney } from "@/lib/types";
import type { Accounts } from "@/lib/types";
import { getTotalAssets } from "@/lib/finance-logic";
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
import { Separator } from "@/components/ui/separator";
import { Pencil, CheckCircle2, AlertTriangle } from "lucide-react";

export default function BalancePage() {
  const { data, fixAccounts } = useFinance();
  const { accounts } = data;
  const totalAssets = getTotalAssets(accounts);

  const [editOpen, setEditOpen] = useState(false);
  const [editAccounts, setEditAccounts] = useState<Accounts>({ ...accounts });

  function handleEditStart() {
    setEditAccounts({ ...accounts });
    setEditOpen(true);
  }

  function handleEditSave() {
    fixAccounts(editAccounts);
    setEditOpen(false);
  }

  const hasNegative = ACCOUNT_KEYS.some((key) => accounts[key] < 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">账户余额</h1>
          <p className="text-sm text-muted-foreground mt-1">查看并管理各账户当前余额</p>
        </div>
        <Button onClick={handleEditStart} variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          手动修正余额
        </Button>
      </div>

      {/* 总资产 */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">总资产</p>
          <p className="text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
            {formatMoney(totalAssets)}
            <span className="text-base font-normal ml-1">元</span>
          </p>
        </CardContent>
      </Card>

      {hasNegative && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>检测到部分账户余额为负数，已自动归零。请检查账户余额是否正确。</span>
        </div>
      )}

      {/* 各账户余额 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ACCOUNT_KEYS.map((key) => {
          const balance = accounts[key];
          return (
            <Card key={key} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{ACCOUNT_CN[key]}</span>
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      balance < 0 ? "text-rose-600" : ""
                    }`}
                  >
                    {formatMoney(balance)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">元</span>
                  </span>
                </div>
                {balance < 0 && (
                  <p className="mt-1 text-xs text-rose-600">余额为负数</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底薪变化历史 */}
      {data.baseSalaryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">底薪变化历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...data.baseSalaryHistory].reverse().map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{record.date}</span>
                  <span className="text-sm tabular-nums">
                    <span className="text-muted-foreground">{formatMoney(record.old)}</span>
                    <span className="mx-2 text-foreground">→</span>
                    <span className="font-medium text-emerald-600">{formatMoney(record.new)}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 手动修正对话框 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手动修正账户余额</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {ACCOUNT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-4">
                <Label className="w-36 shrink-0 text-sm">{ACCOUNT_CN[key]}</Label>
                <Input
                  type="number"
                  step="any"
                  value={editAccounts[key] || ""}
                  onChange={(e) =>
                    setEditAccounts((prev) => ({
                      ...prev,
                      [key]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="tabular-nums"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditSave} className="bg-amber-600 hover:bg-amber-700 text-white">
              保存修正
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
