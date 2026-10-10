---
name: bigscreen-panel
description: >-
  Guides building and refactoring big-screen side panels in this Vue project
  (JoScreenPanel, ScreenOverlay, Element Plus dark UI, mock-first data).
  Use when creating or modifying fire-response / inspection / warning side
  panels, converting MasterGo HTML to components, or wiring panel tabs.
---

# 大屏侧栏面板

## 何时使用

- 新建/改造左右悬浮面板
- 把 MasterGo 硬编码 HTML 改成组件化实现
- 右侧多 Tab 面板拆分与假数据接入

## 推荐结构

1. **壳**：`ScreenOverlay` 定位 + 可选 `JoCollapseRail` 收起
2. **标题栏**：左侧列表类用 `JoScreenPanel`；右侧窄栏可用自定义头 + `ElTabs`
3. **内容**：按业务拆子组件；数据 `types.ts` + `mock.ts`（或 API）
4. **浮层**：下拉/日期依赖全局 `dark-element.scss`；弹窗用 `JoScreenDialog`

## 步骤清单

```
- [ ] 确认面板属于左壳(JoScreenPanel)还是右窄栏(自定义+ElTabs)
- [ ] 按 Tab/区块拆子组件，父组件只做切换与 fireId 下发
- [ ] 控件用 Element Plus；ElMessage 在 script 中 import
- [ ] 样式 scoped；不向 dark-element.scss 塞业务 class
- [ ] 先 mock 跑通 UI，再替换真实接口
```

## 反例

- 在全局样式写 `.xxx-popper` 业务浮层皮肤
- 模板内直接写 `ElMessage.success(...)` 导致类型飘红
- 一个文件里塞多个无关业务 Tab 的全部逻辑且无法复用
