// ==================== 财务管理器类型定义 ====================

/** 年度大额支出预算 */
export interface AnnualBudget {
  springFestival: number;
  midAutumn: number;
  dragonBoat: number;
  birthday: number;
  weddingGift: number;
  carInsurance: number;
  propertyFee: number;
  physicalExam: number;
  travel: number;
  renovation: number;
  wedding: number;
  other: number;
}

/** 基础财务信息 */
export interface BasicInfo {
  totalSavings: number;
  baseSalary: number;
  monthlyExpenses: number;
  mortgageRate: number;
  emergencyMonths: number;
  smoothMonths: number;
  annualExpenses: Record<string, AnnualBudget>;
}

/** 账户余额 */
export interface Accounts {
  emergency: number;
  annual: number;
  smooth: number;
  prepayment: number;
  stableInvest: number;
  growthInvest: number;
  flexible: number;
}

/** 月度工资提成记录 */
export interface IncomeRecord {
  id: string;
  year: string;
  month: string;
  baseSalary: number;
  commission: number;
  totalIncome: number;
  expenseShortfall: number;
  toEmergency: number;
  toAnnual: number;
  smoothAmount: number;
  stableAmount: number;
  growthAmount: number;
  flexibleAmount: number;
}

/** 其他收入记录 */
export interface OtherIncomeRecord {
  id: string;
  year: string;
  month: string;
  type: string;
  amount: number;
  note: string;
  stableAmount: number;
  flexibleAmount: number;
}

/** 支出记录 */
export interface ExpenseRecord {
  id: string;
  year: string;
  month: string;
  type: "年度大额支出" | "灵活消费";
  amount: number;
  note: string;
}

/** 底薪变化记录 */
export interface BaseSalaryChange {
  id: string;
  date: string;
  old: number;
  new: number;
}

/** 完整财务数据 */
export interface FinanceData {
  basicInfo: BasicInfo;
  accounts: Accounts;
  incomeHistory: IncomeRecord[];
  otherIncomeHistory: OtherIncomeRecord[];
  expenseHistory: ExpenseRecord[];
  baseSalaryHistory: BaseSalaryChange[];
}

// ==================== 常量映射 ====================

export const ACCOUNT_CN: Record<keyof Accounts, string> = {
  emergency: "紧急备用金",
  annual: "年度大额支出准备金",
  smooth: "收入平滑基金",
  prepayment: "提前还款准备金",
  stableInvest: "稳健投资",
  growthInvest: "进取投资",
  flexible: "灵活消费",
};

export const ACCOUNT_KEYS: (keyof Accounts)[] = [
  "emergency",
  "annual",
  "smooth",
  "prepayment",
  "stableInvest",
  "growthInvest",
  "flexible",
];

export const ACCOUNT_COLORS: Record<keyof Accounts, string> = {
  emergency: "sky",
  annual: "violet",
  smooth: "amber",
  prepayment: "rose",
  stableInvest: "emerald",
  growthInvest: "blue",
  flexible: "orange",
};

export const ANNUAL_BUDGET_FIELDS: { label: string; key: keyof AnnualBudget }[] = [
  { label: "春节红包+年货", key: "springFestival" },
  { label: "中秋节礼物", key: "midAutumn" },
  { label: "端午节礼物", key: "dragonBoat" },
  { label: "生日礼金", key: "birthday" },
  { label: "随礼", key: "weddingGift" },
  { label: "车辆保险+保养", key: "carInsurance" },
  { label: "物业费+宽带", key: "propertyFee" },
  { label: "全家体检", key: "physicalExam" },
  { label: "旅游度假", key: "travel" },
  { label: "装修", key: "renovation" },
  { label: "婚礼", key: "wedding" },
  { label: "其他", key: "other" },
];

export const OTHER_INCOME_TYPES = [
  "兼职收入",
  "红包礼金",
  "退税",
  "年终奖",
  "季度奖",
  "变卖资产",
  "其他",
];

export const YEAR_RANGE = Array.from({ length: 16 }, (_, i) => String(2020 + i));
export const MONTH_LIST = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, "0")}月`);

/** 格式化金额（千分位+两位小数） */
export function formatMoney(amount: number): string {
  return amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 生成简单 ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
