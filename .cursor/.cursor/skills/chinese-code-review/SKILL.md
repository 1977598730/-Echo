---
name: chinese-code-review
description: >-
  中文代码审查沟通参考——三级标注（必须修复/建议修改/仅供参考）、单条意见的三段式话术、
  本项目 Vue3 + SCSS + Cesium 审查清单、国内团队常见反模式应对。
  仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
---

# 中文代码审查

## 何时使用

- 收到"帮我 review 这次改动 / 这个 PR"的显式请求
- 合并前自查（配合 `requesting-code-review`）
- 收到他人审查意见需要回复时（转 `receiving-code-review`）

## 三级标注（每条意见必须带）

| 标注           | 含义                                         | 是否阻塞合并                 |
| -------------- | -------------------------------------------- | ---------------------------- |
| `【必须修复】` | 逻辑错误、数据丢失、安全风险、质量门禁不通过 | 阻塞                         |
| `【建议修改】` | 可维护性、性能、与既有约定不一致             | 不阻塞，作者说明理由后可保留 |
| `【仅供参考】` | 个人风格偏好、命名口味                       | 不阻塞，默认不改             |

标注的作用是把"阻塞项"和"口味项"分开，避免作者被一堆同级意见淹没。

## 单条意见的三段式

**事实** → **影响** → **方案**

```
【必须修复】surround-analysis.vue:167 用了 ref<HTMLElement | null>(null) 做模板引用。
影响：与 .qoder/rules/vue3-cursorrules.md L24 冲突，同目录 task-dispatch.vue:99 已是 useTemplateRef，
     一个模块两种写法后续维护会踩坑。
方案：改 useTemplateRef<HTMLElement>('chartRef')，同时把 useEchart 入参放宽为 Readonly<Ref<...>>。
```

禁止：只说"这样不好"、人身评价、反问句施压（"这也能提交？"）、贴一堆问题不给改法。

## 输出模板

```markdown
## 审查结论：可合并 / 需修改后合并 / 打回

### 必须修复（N 条）

1. [文件:行] 事实 → 影响 → 方案

### 建议修改（N 条）

### 仅供参考（N 条）

### 验证情况

- pnpm lint / lint:style / vue-tsc / vitest 各自结果（命令 + 输出摘要）
```

## 本项目审查清单

- **Vue3**：`<script setup lang="ts">`；泛型 `defineProps`/`defineEmits`；双向绑定用 `defineModel`；
  函数一律箭头函数；模板引用用 `useTemplateRef`；稳定 ID 用 `useId()`（禁 `Math.random()`）
- **样式**：`<style lang="scss" scoped>`；属性序符合 recess-order；Element Plus 覆盖只进
  `light-element.scss` / `dark-element.scss`，禁止散落在业务组件；跨模块复用值走 `screen-token.scss` 变量
- **结构**：views / stores / api / hooks 按模块组织；枚举进 `src/enums`；模块私有类型就地定义
- **数据**：mock 字段与接口文档一致，禁止 `buildDetailFromVO` 这类 VO→ViewModel 映射层
- **地图**：`src/jo-components/CesiumMap` 是跨页面共享实例，禁止业务组件 `new Viewer` 或改全局图层后不还原
- **门禁**：四项都要跑（`pnpm lint`、`pnpm lint:style`、`vue-tsc --noEmit`、`pnpm test`）。
  注意 `.husky/*` 被 gitignore，钩子在本机可能根本没生成，**不能指望提交时自动拦**。

## 国内团队常见反模式应对

| 反模式                | 应对                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| review 变成格式化战争 | 缩进/换行/引号一律交给 `eslint --fix` / `stylelint --fix`，人只看语义 |
| "以前就是这样写的"    | 要求给出 blame 链接；确属历史债就登记待办，本次不扩大改动面           |
| 单个 PR 上千行 diff   | 要求拆分，或先只审接口与数据结构，再审实现                            |
| 口头 review 不留痕    | 结论必须落到 PR 评论或 `docs/` 记录，否则视为未审查                   |
| 领导拍板跳过 review   | 记录决策内容、理由、风险承担人，写入决策记录                          |
| 只报问题不给方案      | 自己先给出可执行改法，作者不接受再讨论                                |

## 自检

提交审查意见前问自己三句：这条属于哪一级？影响说清楚了吗？对方照着能直接改吗？
