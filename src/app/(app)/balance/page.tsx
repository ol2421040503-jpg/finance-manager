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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">账户余额</h1>
          <p className="text-xs text-muted-foreground mt-0.5">查看并管理各账户余额</p>
        </div>
        <Button onClick={handleEditStart} variant="outline" size="sm" className="h-8 text-xs">
          <Pencil className="h-3 w-3 mr-1" />
          修正
        </Button>
      </div>

      {/* 总资产 */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">总资产</p>
          <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
            {formatMoney(totalAssets)}
            <span className="text-sm font-normal ml-0.5">元</span>
          </p>
        </CardContent>
      </Card>

      {hasNegative && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>检测到部分账户余额为负数，已自动归零。</span>
        </div>
      )}

      {/* 各账户余额 */}
      <div className="space-y-2">
        {ACCOUNT_KEYS.map((key) => {
          const balance = accounts[key];
          return (
            <Card key={key}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{ACCOUNT_CN[key]}</span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      balance < 0 ? "text-rose-600" : ""
                    }`}
                  >
                    {formatMoney(balance)}
                    <span className="text-[10px] font-normal text-muted-foreground ml-0.5">元</span>
                  </span>
                </div>
                {balance < 0 && (
                  <p className="mt-0.5 text-[10px] text-rose-600">余额为负数</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底薪变化历史 */}
      {data.baseSalaryHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm">底薪变化历史</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1.5">
              {[...data.baseSalaryHistory].reverse().map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{record.date}</span>
                  <span className="tabular-nums">
                    <span className="text-muted-foreground">{formatMoney(record.old)}</span>
                    <span className="mx-1 text-foreground">→</span>
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
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {ACCOUNT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <Label className="w-28 shrink-0 text-xs">{ACCOUNT_CN[key]}</Label>
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
                  className="tabular-nums h-10"
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
