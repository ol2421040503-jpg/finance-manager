// ==================== 纯业务逻辑（无副作用） ====================

import type { Accounts, AnnualBudget, BasicInfo, FinanceData } from "./types";

const CURRENT_YEAR = String(new Date().getFullYear());

export const DEFAULT_ANNUAL_BUDGET: AnnualBudget = {
  springFestival: 10000,
  midAutumn: 2000,
  dragonBoat: 2000,
  birthday: 3000,
  weddingGift: 3000,
  carInsurance: 4000,
  propertyFee: 3000,
  physicalExam: 3000,
  travel: 6000,
  renovation: 0,
  wedding: 0,
  other: 0,
};

export const DEFAULT_DATA: FinanceData = {
  basicInfo: {
    totalSavings: 200000,
    baseSalary: 3000,
    monthlyExpenses: 5000,
    mortgageRate: 4.2,
    emergencyMonths: 12,
    smoothMonths: 6,
    annualExpenses: { [CURRENT_YEAR]: { ...DEFAULT_ANNUAL_BUDGET } },
  },
  accounts: {
    emergency: 0,
    annual: 0,
    smooth: 0,
    prepayment: 0,
    stableInvest: 0,
    growthInvest: 0,
    flexible: 0,
  },
  incomeHistory: [],
  otherIncomeHistory: [],
  expenseHistory: [],
  baseSalaryHistory: [],
};

/** 获取指定年份的年度支出预算总额 */
export function getAnnualTotal(basicInfo: BasicInfo, year: string): number {
  const budget = basicInfo.annualExpenses[year];
  if (!budget) return 0;
  return Object.values(budget).reduce((sum, v) => sum + v, 0);
}

/**
 * 计算存量资金分配方案
 * 优先级：紧急备用金 → 年度准备金 → 平滑基金 → 剩余按比例分配
 */
export function calculateInitialAllocation(basicInfo: BasicInfo, year: string) {
  const total = basicInfo.totalSavings;
  const annualTotal = getAnnualTotal(basicInfo, year);
  const emergencyTarget = basicInfo.monthlyExpenses * basicInfo.emergencyMonths;
  const smoothTarget = basicInfo.monthlyExpenses * basicInfo.smoothMonths;

  const allocation: Record<string, number> = {};
  let remaining = total;

  allocation["紧急备用金"] = Math.min(emergencyTarget, remaining);
  remaining -= allocation["紧急备用金"];

  allocation["年度大额支出准备金"] = Math.min(annualTotal, remaining);
  remaining -= allocation["年度大额支出准备金"];

  allocation["收入平滑基金"] = Math.min(smoothTarget, remaining);
  remaining -= allocation["收入平滑基金"];

  const rate = basicInfo.mortgageRate;
  const prepayRatio = rate > 4.5 ? 0.6 : rate > 4 ? 0.4 : 0.2;
  const stableTotal = remaining * 0.7;
  const growthTotal = remaining * 0.3;

  allocation["提前还款准备金"] = stableTotal * prepayRatio;
  allocation["稳健投资"] = stableTotal * (1 - prepayRatio);
  allocation["进取投资"] = growthTotal * 0.6;
  allocation["灵活消费"] = growthTotal * 0.4;

  return allocation;
}

/**
 * 将分配方案映射到账户
 */
export function allocationToAccounts(allocation: Record<string, number>): Accounts {
  const nameToKey: Record<string, keyof Accounts> = {
    紧急备用金: "emergency",
    年度大额支出准备金: "annual",
    收入平滑基金: "smooth",
    提前还款准备金: "prepayment",
    稳健投资: "stableInvest",
    进取投资: "growthInvest",
    灵活消费: "flexible",
  };
  const accounts: Accounts = {
    emergency: 0,
    annual: 0,
    smooth: 0,
    prepayment: 0,
    stableInvest: 0,
    growthInvest: 0,
    flexible: 0,
  };
  for (const [name, amount] of Object.entries(allocation)) {
    const key = nameToKey[name];
    if (key) accounts[key] = amount;
  }
  return accounts;
}

/**
 * 计算提成分配（核心分配逻辑）
 * 优先级：紧急备用金 → 年度准备金 → 平滑基金 → 投资消费
 * 平滑基金满额后不再存入，剩余资金按 50%稳健/33.33%进取/16.67%灵活 分配
 */
export function calcAllocation(
  remaining: number,
  accounts: Accounts,
  basicInfo: BasicInfo,
  year: string
): {
  toEmergency: number;
  toAnnual: number;
  toSmooth: number;
  stable: number;
  growth: number;
  flex: number;
} {
  const emergencyTarget = basicInfo.monthlyExpenses * basicInfo.emergencyMonths;
  const annualTarget = getAnnualTotal(basicInfo, year);
  const smoothTarget = basicInfo.monthlyExpenses * basicInfo.smoothMonths;

  // 1. 紧急备用金
  const emergencyNeed = Math.max(0, emergencyTarget - accounts.emergency);
  const toEmergency = Math.min(remaining, emergencyNeed);
  let rem = remaining - toEmergency;

  // 2. 年度准备金
  const annualNeed = Math.max(0, annualTarget - accounts.annual);
  const toAnnual = Math.min(rem, annualNeed);
  rem -= toAnnual;

  // 3. 平滑基金
  const smoothNeed = Math.max(0, smoothTarget - accounts.smooth);
  const toSmooth = Math.min(rem, smoothNeed);
  rem -= toSmooth;

  // 4. 平滑基金已满且还有剩余 → 全部分配给投资消费
  if (smoothNeed === 0 && rem > 0) {
    return {
      toEmergency,
      toAnnual,
      toSmooth,
      stable: rem * 0.5,
      growth: rem * 0.3333333333,
      flex: rem * 0.1666666667,
    };
  }

  return { toEmergency, toAnnual, toSmooth, stable: 0, growth: 0, flex: 0 };
}

/**
 * 处理月度提成收入
 * 返回分配结果，不修改原始数据
 */
export function processMonthlyCommission(
  commission: number,
  basicInfo: BasicInfo,
  accounts: Accounts,
  year: string
): {
  success: boolean;
  deficit?: boolean;
  needed?: number;
  allocation: {
    toEmergency: number;
    toAnnual: number;
    smoothAmount: number;
    stableAmount: number;
    growthAmount: number;
    flexibleAmount: number;
  };
} {
  const base = basicInfo.baseSalary;
  const expenses = basicInfo.monthlyExpenses;
  const shortfall = Math.max(expenses - base, 0);
  const remaining = commission - shortfall;

  if (remaining > 0) {
    // 提成有剩余，按优先级分配
    const { toEmergency, toAnnual, toSmooth, stable, growth, flex } = calcAllocation(
      remaining,
      accounts,
      basicInfo,
      year
    );
    return {
      success: true,
      deficit: false,
      allocation: {
        toEmergency,
        toAnnual,
        smoothAmount: toSmooth,
        stableAmount: stable,
        growthAmount: growth,
        flexibleAmount: flex,
      },
    };
  } else {
    // 提成不足，需要从平滑基金支取
    const needed = Math.abs(remaining);
    if (accounts.smooth >= needed) {
      return {
        success: true,
        deficit: true,
        needed,
        allocation: {
          toEmergency: 0,
          toAnnual: 0,
          smoothAmount: remaining, // 负数，表示支取
          stableAmount: 0,
          growthAmount: 0,
          flexibleAmount: 0,
        },
      };
    }
    return {
      success: false,
      needed,
      allocation: {
        toEmergency: 0,
        toAnnual: 0,
        smoothAmount: 0,
        stableAmount: 0,
        growthAmount: 0,
        flexibleAmount: 0,
      },
    };
  }
}

/**
 * 应用提成分配到账户（返回新账户对象）
 */
export function applyCommissionToAccounts(
  accounts: Accounts,
  allocation: {
    toEmergency: number;
    toAnnual: number;
    smoothAmount: number;
    stableAmount: number;
    growthAmount: number;
    flexibleAmount: number;
  }
): Accounts {
  return {
    emergency: Math.max(0, accounts.emergency + allocation.toEmergency),
    annual: Math.max(0, accounts.annual + allocation.toAnnual),
    smooth: Math.max(0, accounts.smooth + allocation.smoothAmount),
    prepayment: Math.max(0, accounts.prepayment + allocation.stableAmount * 0.4),
    stableInvest: Math.max(0, accounts.stableInvest + allocation.stableAmount * 0.6),
    growthInvest: Math.max(0, accounts.growthInvest + allocation.growthAmount),
    flexible: Math.max(0, accounts.flexible + allocation.flexibleAmount),
  };
}

/**
 * 回滚提成分配（返回新账户对象）
 */
export function rollbackCommissionFromAccounts(
  accounts: Accounts,
  allocation: {
    toEmergency: number;
    toAnnual: number;
    smoothAmount: number;
    stableAmount: number;
    growthAmount: number;
    flexibleAmount: number;
  }
): Accounts {
  return {
    emergency: Math.max(0, accounts.emergency - allocation.toEmergency),
    annual: Math.max(0, accounts.annual - allocation.toAnnual),
    smooth: Math.max(0, accounts.smooth - allocation.smoothAmount),
    prepayment: Math.max(0, accounts.prepayment - allocation.stableAmount * 0.4),
    stableInvest: Math.max(0, accounts.stableInvest - allocation.stableAmount * 0.6),
    growthInvest: Math.max(0, accounts.growthInvest - allocation.growthAmount),
    flexible: Math.max(0, accounts.flexible - allocation.flexibleAmount),
  };
}

/**
 * 处理其他收入分配（90%稳健+提前还款，10%灵活消费）
 */
export function processOtherIncome(amount: number): {
  stableAmount: number;
  flexibleAmount: number;
} {
  return {
    stableAmount: amount * 0.9,
    flexibleAmount: amount * 0.1,
  };
}

/**
 * 应用其他收入到账户
 */
export function applyOtherIncomeToAccounts(
  accounts: Accounts,
  stableAmount: number,
  flexibleAmount: number
): Accounts {
  return {
    ...accounts,
    prepayment: Math.max(0, accounts.prepayment + stableAmount * 0.4),
    stableInvest: Math.max(0, accounts.stableInvest + stableAmount * 0.6),
    flexible: Math.max(0, accounts.flexible + flexibleAmount),
  };
}

/**
 * 回滚其他收入
 */
export function rollbackOtherIncomeFromAccounts(
  accounts: Accounts,
  stableAmount: number,
  flexibleAmount: number
): Accounts {
  return {
    ...accounts,
    prepayment: Math.max(0, accounts.prepayment - stableAmount * 0.4),
    stableInvest: Math.max(0, accounts.stableInvest - stableAmount * 0.6),
    flexible: Math.max(0, accounts.flexible - flexibleAmount),
  };
}

/** 计算总资产 */
export function getTotalAssets(accounts: Accounts): number {
  return Object.values(accounts).reduce((sum, v) => sum + v, 0);
}
