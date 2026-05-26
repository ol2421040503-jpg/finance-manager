# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **数据持久化**: localStorage (客户端)

## 项目概述

销售专属理财管理器 Web 版——从 Python/Tkinter 桌面应用改造为现代 Web 应用。
核心功能：7 个资金账户的智能分配管理，按优先级自动将提成收入分配到各账户。

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── layout.tsx      # 根布局
│   │   ├── globals.css     # 全局样式（琥珀金主题）
│   │   └── (app)/          # 应用路由组（移动端布局）
│   │       ├── layout.tsx  # 应用布局（底部 TabBar + 更多 Sheet + 主内容）
│   │       ├── page.tsx    # 总览仪表盘
│   │       ├── basic-info/ # 基础信息设置
│   │       ├── allocation/ # 存量资金分配
│   │       ├── monthly-income/ # 月度工资提成
│   │       ├── other-income/   # 其他收入
│   │       ├── expenses/       # 支出记录
│   │       ├── balance/        # 账户余额
│   │       ├── history/        # 综合历史
│   │       └── rules/          # 规则说明
│   ├── components/ui/      # shadcn/ui 组件库
│   └── lib/
│       ├── utils.ts        # 通用工具 (cn)
│       ├── types.ts        # 类型定义 + 常量映射
│       ├── finance-logic.ts # 纯业务逻辑（分配计算）
│       └── finance-store.tsx # React Context + localStorage 状态管理
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 核心业务逻辑

### 7 个资金账户
紧急备用金 → 年度大额支出准备金 → 收入平滑基金 → 提前还款准备金 → 稳健投资 → 进取投资 → 灵活消费

### 提成分配优先级
1. 补足月支出（底薪不够的部分）
2. 紧急备用金未满 → 全部存入
3. 年度准备金未满 → 全部存入
4. 平滑基金未满 → 全部存入
5. 三项均满 → 按 5:3:2 分配至稳健/进取/灵活

### 其他收入分配
90% 进入稳健投资+提前还款，10% 进入灵活消费

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，严禁使用 npm 或 yarn。

## 开发规范

### 编码规范

- TypeScript strict 模式；禁止隐式 any
- 所有页面组件使用 'use client' 指令
- 金额数字使用 tabular-nums 等宽对齐
- 金融计算使用纯函数（finance-logic.ts），与 UI 解耦

### Hydration 问题防范

- 严禁在 JSX 中直接使用 Date.now()、Math.random() 等动态数据
- 使用 'use client' + useEffect + useState 确保客户端渲染
- FinanceProvider 在客户端加载完成后才渲染子组件

## UI 设计与组件规范

- shadcn/ui 组件库，位于 src/components/ui/
- 琥珀金主色调（amber-600/700），温暖可信赖的金融风格
- 移动端优先设计，底部 TabBar 导航 + 更多功能 Sheet
- iOS/Android 适配：safe area insets、触摸优化（44px 最小点击区域）
- 卡片圆角 rounded-xl，金额右对齐千分位格式
- 宽表格用可折叠卡片列表替代，表单全宽纵向排列
