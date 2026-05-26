"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type {
  FinanceData,
  Accounts,
  IncomeRecord,
  OtherIncomeRecord,
  ExpenseRecord,
  BaseSalaryChange,
  BasicInfo,
  AnnualBudget,
} from "./types";
import { generateId } from "./types";
import {
  DEFAULT_DATA,
  processMonthlyCommission,
  applyCommissionToAccounts,
  rollbackCommissionFromAccounts,
  processOtherIncome,
  applyOtherIncomeToAccounts,
  rollbackOtherIncomeFromAccounts,
  allocationToAccounts,
  calculateInitialAllocation,
} from "./finance-logic";

// ==================== Context 类型 ====================

interface FinanceContextValue {
  data: FinanceData;
  currentYear: string;
  setCurrentYear: (year: string) => void;

  // 基础信息
  saveBasicInfo: (info: BasicInfo) => void;

  // 存量分配
  applyAllocation: (year: string) => void;

  // 月度提成
  addMonthlyCommission: (year: string, month: string, commission: number) => {
    success: boolean;
    deficit?: boolean;
    needed?: number;
    message: string;
  };
  deleteIncomeRecord: (id: string) => void;
  editIncomeRecord: (id: string, newCommission: number) => {
    success: boolean;
    message: string;
  };

  // 其他收入
  addOtherIncome: (
    year: string,
    month: string,
    type: string,
    amount: number,
    note: string
  ) => void;
  deleteOtherIncomeRecord: (id: string) => void;

  // 支出
  addExpense: (
    year: string,
    month: string,
    type: "年度大额支出" | "灵活消费",
    amount: number,
    note: string
  ) => { success: boolean; message: string };
  deleteExpenseRecord: (id: string) => void;

  // 账户余额
  fixAccounts: (newAccounts: Accounts) => void;

  // 导出
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const STORAGE_KEY = "sales_finance_data";

function loadData(): FinanceData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as FinanceData;
      // 兼容性补全
      if (!parsed.otherIncomeHistory) parsed.otherIncomeHistory = [];
      if (!parsed.expenseHistory) parsed.expenseHistory = [];
      if (!parsed.baseSalaryHistory) parsed.baseSalaryHistory = [];
      if (!parsed.incomeHistory) parsed.incomeHistory = [];
      // 补全新增的年度预算字段
      for (const yearKey of Object.keys(parsed.basicInfo.annualExpenses)) {
        const budget = parsed.basicInfo.annualExpenses[yearKey];
        if (budget.renovation === undefined) budget.renovation = 0;
        if (budget.wedding === undefined) budget.wedding = 0;
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_DATA;
}

function saveData(data: FinanceData): void {
  if (typeof window === "undefined") return;
  // 修复负数余额
  for (const key of Object.keys(data.accounts) as (keyof Accounts)[]) {
    if (data.accounts[key] < 0) data.accounts[key] = 0;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<FinanceData>(DEFAULT_DATA);
  const [currentYear, setCurrentYear] = useState(String(new Date().getFullYear()));
  const [loaded, setLoaded] = useState(false);

  // 客户端加载
  useEffect(() => {
    const loadedData = loadData();
    setDataState(loadedData);
    setLoaded(true);
  }, []);

  const updateData = useCallback((updater: (prev: FinanceData) => FinanceData) => {
    setDataState((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // ========== 基础信息 ==========
  const saveBasicInfo = useCallback(
    (info: BasicInfo) => {
      updateData((prev) => {
        const oldBase = prev.basicInfo.baseSalary;
        const newBase = info.baseSalary;
        const salaryHistory = [...prev.baseSalaryHistory];
        if (oldBase !== newBase) {
          salaryHistory.push({
            id: generateId(),
            date: new Date().toLocaleString("zh-CN"),
            old: oldBase,
            new: newBase,
          });
        }
        return { ...prev, basicInfo: info, baseSalaryHistory: salaryHistory };
      });
    },
    [updateData]
  );

  // ========== 存量分配 ==========
  const applyAllocation = useCallback(
    (year: string) => {
      updateData((prev) => {
        const allocation = calculateInitialAllocation(prev.basicInfo, year);
        const newAccounts = allocationToAccounts(allocation);
        return { ...prev, accounts: newAccounts };
      });
    },
    [updateData]
  );

  // ========== 月度提成 ==========
  const addMonthlyCommission = useCallback(
    (year: string, month: string, commission: number) => {
      let result: { success: boolean; deficit?: boolean; needed?: number; message: string } = {
        success: false,
        message: "",
      };

      updateData((prev) => {
        const res = processMonthlyCommission(commission, prev.basicInfo, prev.accounts, year);
        if (!res.success) {
          result = {
            success: false,
            needed: res.needed,
            message: `提成不足以覆盖支出！需要从收入平滑基金支取：${res.needed!.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} 元，当前平滑基金余额不足。`,
          };
          return prev;
        }

        const newAccounts = applyCommissionToAccounts(prev.accounts, res.allocation);
        const record: IncomeRecord = {
          id: generateId(),
          year,
          month,
          baseSalary: prev.basicInfo.baseSalary,
          commission,
          totalIncome: prev.basicInfo.baseSalary + commission,
          expenseShortfall: Math.max(prev.basicInfo.monthlyExpenses - prev.basicInfo.baseSalary, 0),
          toEmergency: res.allocation.toEmergency,
          toAnnual: res.allocation.toAnnual,
          smoothAmount: res.allocation.smoothAmount,
          stableAmount: res.allocation.stableAmount,
          growthAmount: res.allocation.growthAmount,
          flexibleAmount: res.allocation.flexibleAmount,
        };

        if (res.deficit) {
          result = {
            success: true,
            deficit: true,
            needed: res.needed,
            message: `提成不足，从平滑基金支取 ${res.needed!.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} 元`,
          };
        } else {
          result = {
            success: true,
            deficit: false,
            message: `提成已分配：紧急备用金 ${res.allocation.toEmergency.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} / 年度准备金 ${res.allocation.toAnnual.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} / 平滑基金 ${res.allocation.smoothAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} / 稳健 ${res.allocation.stableAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} / 进取 ${res.allocation.growthAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} / 灵活 ${res.allocation.flexibleAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`,
          };
        }

        return {
          ...prev,
          accounts: newAccounts,
          incomeHistory: [...prev.incomeHistory, record],
        };
      });

      return result;
    },
    [updateData]
  );

  const deleteIncomeRecord = useCallback(
    (id: string) => {
      updateData((prev) => {
        const record = prev.incomeHistory.find((r) => r.id === id);
        if (!record) return prev;
        const newAccounts = rollbackCommissionFromAccounts(prev.accounts, {
          toEmergency: record.toEmergency,
          toAnnual: record.toAnnual,
          smoothAmount: record.smoothAmount,
          stableAmount: record.stableAmount,
          growthAmount: record.growthAmount,
          flexibleAmount: record.flexibleAmount,
        });
        return {
          ...prev,
          accounts: newAccounts,
          incomeHistory: prev.incomeHistory.filter((r) => r.id !== id),
        };
      });
    },
    [updateData]
  );

  const editIncomeRecord = useCallback(
    (id: string, newCommission: number) => {
      let result: { success: boolean; message: string } = { success: false, message: "" };

      updateData((prev) => {
        const record = prev.incomeHistory.find((r) => r.id === id);
        if (!record) {
          result = { success: false, message: "记录未找到" };
          return prev;
        }

        // 先回滚旧记录
        const afterRollback = rollbackCommissionFromAccounts(prev.accounts, {
          toEmergency: record.toEmergency,
          toAnnual: record.toAnnual,
          smoothAmount: record.smoothAmount,
          stableAmount: record.stableAmount,
          growthAmount: record.growthAmount,
          flexibleAmount: record.flexibleAmount,
        });

        // 计算新分配
        const res = processMonthlyCommission(
          newCommission,
          prev.basicInfo,
          afterRollback,
          record.year
        );
        if (!res.success) {
          result = { success: false, message: "修改后提成不足且平滑基金余额不够" };
          return prev; // 回滚失败，不修改
        }

        const newAccounts = applyCommissionToAccounts(afterRollback, res.allocation);
        const updatedRecord: IncomeRecord = {
          ...record,
          commission: newCommission,
          totalIncome: prev.basicInfo.baseSalary + newCommission,
          expenseShortfall: Math.max(prev.basicInfo.monthlyExpenses - prev.basicInfo.baseSalary, 0),
          toEmergency: res.allocation.toEmergency,
          toAnnual: res.allocation.toAnnual,
          smoothAmount: res.allocation.smoothAmount,
          stableAmount: res.allocation.stableAmount,
          growthAmount: res.allocation.growthAmount,
          flexibleAmount: res.allocation.flexibleAmount,
        };

        result = { success: true, message: "提成记录已修改" };

        return {
          ...prev,
          accounts: newAccounts,
          incomeHistory: prev.incomeHistory.map((r) => (r.id === id ? updatedRecord : r)),
        };
      });

      return result;
    },
    [updateData]
  );

  // ========== 其他收入 ==========
  const addOtherIncome = useCallback(
    (year: string, month: string, type: string, amount: number, note: string) => {
      updateData((prev) => {
        const { stableAmount, flexibleAmount } = processOtherIncome(amount);
        const newAccounts = applyOtherIncomeToAccounts(prev.accounts, stableAmount, flexibleAmount);
        const record: OtherIncomeRecord = {
          id: generateId(),
          year,
          month,
          type,
          amount,
          note,
          stableAmount,
          flexibleAmount,
        };
        return {
          ...prev,
          accounts: newAccounts,
          otherIncomeHistory: [...prev.otherIncomeHistory, record],
        };
      });
    },
    [updateData]
  );

  const deleteOtherIncomeRecord = useCallback(
    (id: string) => {
      updateData((prev) => {
        const record = prev.otherIncomeHistory.find((r) => r.id === id);
        if (!record) return prev;
        const newAccounts = rollbackOtherIncomeFromAccounts(
          prev.accounts,
          record.stableAmount,
          record.flexibleAmount
        );
        return {
          ...prev,
          accounts: newAccounts,
          otherIncomeHistory: prev.otherIncomeHistory.filter((r) => r.id !== id),
        };
      });
    },
    [updateData]
  );

  // ========== 支出 ==========
  const addExpense = useCallback(
    (
      year: string,
      month: string,
      type: "年度大额支出" | "灵活消费",
      amount: number,
      note: string
    ) => {
      let result: { success: boolean; message: string } = { success: false, message: "" };

      updateData((prev) => {
        if (type === "年度大额支出") {
          if (prev.accounts.annual >= amount) {
            const record: ExpenseRecord = {
              id: generateId(),
              year,
              month,
              type,
              amount,
              note,
            };
            result = { success: true, message: "支出已记录" };
            return {
              ...prev,
              accounts: { ...prev.accounts, annual: prev.accounts.annual - amount },
              expenseHistory: [...prev.expenseHistory, record],
            };
          } else {
            const short = amount - prev.accounts.annual;
            if (prev.accounts.flexible >= short) {
              // 从灵活消费划转差额
              const record: ExpenseRecord = {
                id: generateId(),
                year,
                month,
                type,
                amount,
                note,
              };
              result = {
                success: true,
                message: `年度准备金不足，已从灵活消费划转 ${short.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} 元`,
              };
              return {
                ...prev,
                accounts: {
                  ...prev.accounts,
                  annual: 0,
                  flexible: prev.accounts.flexible - short,
                },
                expenseHistory: [...prev.expenseHistory, record],
              };
            }
            result = { success: false, message: "年度准备金和灵活消费余额都不足" };
            return prev;
          }
        } else {
          if (prev.accounts.flexible >= amount) {
            const record: ExpenseRecord = {
              id: generateId(),
              year,
              month,
              type,
              amount,
              note,
            };
            result = { success: true, message: "支出已记录" };
            return {
              ...prev,
              accounts: { ...prev.accounts, flexible: prev.accounts.flexible - amount },
              expenseHistory: [...prev.expenseHistory, record],
            };
          }
          result = { success: false, message: "灵活消费账户余额不足" };
          return prev;
        }
      });

      return result;
    },
    [updateData]
  );

  const deleteExpenseRecord = useCallback(
    (id: string) => {
      updateData((prev) => {
        const record = prev.expenseHistory.find((r) => r.id === id);
        if (!record) return prev;
        const newAccounts = { ...prev.accounts };
        if (record.type === "年度大额支出") {
          newAccounts.annual += record.amount;
        } else {
          newAccounts.flexible += record.amount;
        }
        return {
          ...prev,
          accounts: newAccounts,
          expenseHistory: prev.expenseHistory.filter((r) => r.id !== id),
        };
      });
    },
    [updateData]
  );

  // ========== 账户修正 ==========
  const fixAccounts = useCallback(
    (newAccounts: Accounts) => {
      updateData((prev) => ({ ...prev, accounts: newAccounts }));
    },
    [updateData]
  );

  // ========== 导入导出 ==========
  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback(
    (jsonStr: string) => {
      try {
        const imported = JSON.parse(jsonStr) as FinanceData;
        if (!imported.basicInfo || !imported.accounts) return false;
        updateData(() => imported);
        return true;
      } catch {
        return false;
      }
    },
    [updateData]
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      data,
      currentYear,
      setCurrentYear,
      saveBasicInfo,
      applyAllocation,
      addMonthlyCommission,
      deleteIncomeRecord,
      editIncomeRecord,
      addOtherIncome,
      deleteOtherIncomeRecord,
      addExpense,
      deleteExpenseRecord,
      fixAccounts,
      exportData,
      importData,
    }),
    [
      data,
      currentYear,
      saveBasicInfo,
      applyAllocation,
      addMonthlyCommission,
      deleteIncomeRecord,
      editIncomeRecord,
      addOtherIncome,
      deleteOtherIncomeRecord,
      addExpense,
      deleteExpenseRecord,
      fixAccounts,
      exportData,
      importData,
    ]
  );

  // 服务端渲染时不渲染子内容（避免 hydration 不匹配）
  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
