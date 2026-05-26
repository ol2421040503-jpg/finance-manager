"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import {
  ANNUAL_BUDGET_FIELDS,
  YEAR_RANGE,
  formatMoney,
} from "@/lib/types";
import type { BasicInfo, AnnualBudget } from "@/lib/types";
import { DEFAULT_ANNUAL_BUDGET, getAnnualTotal } from "@/lib/finance-logic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Save, RotateCcw, Download, Upload } from "lucide-react";

const BASIC_FIELDS: { label: string; key: keyof Omit<BasicInfo, "annualExpenses">; help: string }[] = [
  { label: "现有总存款(元)", key: "totalSavings", help: "所有存款总和" },
  { label: "月底薪(元)", key: "baseSalary", help: "不含提成的固定工资" },
  { label: "安全月支出(元)", key: "monthlyExpenses", help: "房贷+水电+伙食等必要支出" },
  { label: "房贷利率(%)", key: "mortgageRate", help: "公积金填3.1%" },
  { label: "紧急备用金月数", key: "emergencyMonths", help: "建议9-12个月" },
  { label: "收入平滑基金月数", key: "smoothMonths", help: "建议6-12个月" },
];

export default function BasicInfoPage() {
  const { data, currentYear, setCurrentYear, saveBasicInfo, exportData, importData } = useFinance();
  const { basicInfo } = data;

  const [formData, setFormData] = useState<Omit<BasicInfo, "annualExpenses">>({
    totalSavings: basicInfo.totalSavings,
    baseSalary: basicInfo.baseSalary,
    monthlyExpenses: basicInfo.monthlyExpenses,
    mortgageRate: basicInfo.mortgageRate,
    emergencyMonths: basicInfo.emergencyMonths,
    smoothMonths: basicInfo.smoothMonths,
  });

  const [annualBudgets, setAnnualBudgets] = useState<Record<string, AnnualBudget>>(
    basicInfo.annualExpenses
  );
  const [saved, setSaved] = useState(false);

  const currentBudget = annualBudgets[currentYear] || { ...DEFAULT_ANNUAL_BUDGET };
  const annualTotal = getAnnualTotal({ ...basicInfo, annualExpenses: annualBudgets }, currentYear);

  function handleFieldChange(key: keyof Omit<BasicInfo, "annualExpenses">, value: string) {
    const num = value === "" ? 0 : parseFloat(value);
    if (!isNaN(num)) {
      setFormData((prev) => ({ ...prev, [key]: num }));
    }
  }

  function handleAnnualChange(key: keyof AnnualBudget, value: string) {
    const num = value === "" ? 0 : parseFloat(value);
    if (!isNaN(num)) {
      setAnnualBudgets((prev) => ({
        ...prev,
        [currentYear]: { ...(prev[currentYear] || DEFAULT_ANNUAL_BUDGET), [key]: num },
      }));
    }
  }

  function changeYear(delta: number) {
    const idx = YEAR_RANGE.indexOf(currentYear);
    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < YEAR_RANGE.length) {
      setCurrentYear(YEAR_RANGE[newIdx]);
    }
  }

  function handleSave() {
    const updatedInfo: BasicInfo = {
      ...formData,
      annualExpenses: annualBudgets,
    };
    saveBasicInfo(updatedInfo);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (importData(content)) {
          window.location.reload();
        } else {
          alert("导入失败，请检查文件格式");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">基础信息</h1>
        <p className="text-xs text-muted-foreground mt-0.5">设置基本财务参数和年度大额支出预算</p>
      </div>

      {/* 基本财务信息 */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">基本财务信息</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {BASIC_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={field.key} className="text-xs">
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  type="number"
                  step={field.key === "mortgageRate" ? "0.1" : "any"}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="tabular-nums h-10"
                />
                <p className="text-[10px] text-muted-foreground">{field.help}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 年度大额支出预算 */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">年度大额支出预算</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeYear(-1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-xs font-semibold tabular-nums w-10 text-center">{currentYear}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeYear(1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-1.5"
                onClick={() => setCurrentYear(String(new Date().getFullYear()))}
              >
                <RotateCcw className="h-3 w-3 mr-0.5" />
                今年
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {ANNUAL_BUDGET_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`annual-${field.key}`} className="text-xs">
                  {field.label}
                </Label>
                <Input
                  id={`annual-${field.key}`}
                  type="number"
                  step="any"
                  value={currentBudget[field.key] || ""}
                  onChange={(e) => handleAnnualChange(field.key, e.target.value)}
                  className="tabular-nums h-10"
                />
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">年度支出总计：</span>
            <span className="text-base font-bold tabular-nums text-rose-600">
              {formatMoney(annualTotal)} 元
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          onClick={handleSave}
          className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saved ? "已保存" : "保存设置"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleExport} className="h-10 text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            导出备份
          </Button>
          <Button variant="outline" onClick={handleImport} className="h-10 text-xs">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            导入备份
          </Button>
        </div>
      </div>
    </div>
  );
}
