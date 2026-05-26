"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, CalendarDays, TrendingUp, Landmark, BarChart3, Rocket, Coffee, BookOpen } from "lucide-react";

const rules = [
  {
    icon: Shield,
    title: "1. 紧急备用金",
    content:
      "等于安全月支出 × 紧急备用金月数。\n只能用于：失业、重大疾病、意外事故。\n平时绝对不动，存放于货币基金或活期理财。",
    color: "text-sky-600",
  },
  {
    icon: CalendarDays,
    title: "2. 年度大额支出准备金",
    content:
      "按选定年份的预算总和计提。\n专门用于支付春节红包、生日礼金、保险费、体检等年度固定开销。\n存放于货币基金或7天通知存款，专款专用。",
    color: "text-violet-600",
  },
  {
    icon: TrendingUp,
    title: "3. 收入平滑基金",
    content:
      "等于安全月支出 × 平滑月数。\n销售旺季提成高时存入，淡季提成不足时自动支取补足月支出。\n存放于货币基金或3个月定期存款。",
    color: "text-amber-600",
  },
  {
    icon: BookOpen,
    title: "4. 月度提成分配优先级",
    content:
      "① 补足当月必要支出（底薪不够的部分）\n② 紧急备用金未满 → 全部存入紧急备用金\n③ 紧急备用金已满、年度准备金未满 → 全部存入年度准备金\n④ 年度准备金已满、平滑基金未满 → 全部存入平滑基金\n⑤ 以上三项均满 → 按 5:3:2 分配至稳健/进取/灵活（平滑基金不再存入）",
    color: "text-emerald-600",
  },
  {
    icon: Coffee,
    title: "5. 其他收入分配",
    content:
      "兼职、红包、退税等额外收入按 90% 进入「稳健投资+提前还款」，10% 进入「灵活消费」。",
    color: "text-orange-600",
  },
  {
    icon: Landmark,
    title: "6. 提前还款准备金",
    content:
      "当累计达到5万元以上时，建议选择「缩短贷款期限」方式提前还房贷。\n房贷利率 >4.5% 时优先多还，<4% 时少还多投。",
    color: "text-rose-600",
  },
  {
    icon: BarChart3,
    title: "7. 稳健投资",
    content:
      "目标年化收益 3%-4%，风险较低。\n可配置大额存单、国债、纯债基金、R2级银行理财。",
    color: "text-emerald-600",
  },
  {
    icon: Rocket,
    title: "8. 进取投资",
    content:
      "目标年化收益 8%-12%，波动较大。\n建议定投沪深300/中证500等宽基指数基金。\n投资比例不超过总资产的20%，切忌加杠杆。",
    color: "text-blue-600",
  },
  {
    icon: Coffee,
    title: "9. 灵活消费",
    content:
      "完全由你自由支配，可用于购物、旅行、大餐等一切非必要开销。\n心理意义：适当奖励自己，才能让理财计划长期坚持下去。",
    color: "text-orange-600",
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">规则说明</h1>
        <p className="text-sm text-muted-foreground mt-1">了解各账户用途与资金分配规则</p>
      </div>

      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <rule.icon className={`h-5 w-5 ${rule.color}`} />
                {rule.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {rule.content}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* 年份切换说明 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">10. 年份切换</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              在基础信息页通过年份选择器可切换不同年份的预算，每年预算独立管理。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
