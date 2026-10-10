---
name: workflow-runner
description: >-
  在当前会话中直接运行 agency-orchestrator 风格的 YAML 工作流——无需 API key，
  用当前会话的 LLM 作为执行引擎，把 role 映射到本项目 skills，逐 stage 落盘产物并在 checkpoint 处停下确认。
  当用户提供 .yaml 工作流文件或要求"多角色协作完成任务"时触发。
---

# YAML 工作流执行器

## 何时使用

- 用户给出 `*.yaml` / `*.yml` 工作流文件（agency-orchestrator、多角色流水线）
- 用户说"按这个流程走一遍""让需求/设计/开发/测试几个角色协作完成"
- 需要把一个多阶段任务固化成可复跑的流程

不需要 API key：执行引擎就是当前会话本身。

## 支持的 YAML 结构

```yaml
workflow:
  name: 火情面板重构
  stages:
    - name: 需求澄清
      role: product-analyst
      checkpoint: true # true = 必须停下等用户确认
      tasks:
        - 明确改动范围与验收标准
      outputs:
        - docs/superpowers/specs/2026-09-09-fire-panel-design.md
    - name: 实施
      role: developer
      depends_on: [需求澄清]
      tasks:
        - 按设计稿逐块对齐样式
      outputs:
        - src/views/fire-response/components/fire-analysis-panel/**
```

字段容错：`stages` / `steps` / `phases` 视作同义；缺 `outputs` 时按 role 推断落盘位置并向用户确认一次。

## 执行流程

1. **解析并列表化**：读完 YAML 后用 `TodoWrite` 把每个 stage 建成待办，标出依赖与 checkpoint。
   不要把整份 YAML 一直挂在上下文里边读边执行。
2. **role → skill 映射**（本项目可用）：

   | role 关键词             | 映射 skill                                                         |
   | ----------------------- | ------------------------------------------------------------------ |
   | 需求 / 产品 / analyst   | `brainstorming`                                                    |
   | 架构 / 设计 / architect | `writing-plans`                                                    |
   | 开发 / developer        | `subagent-driven-development`、`executing-plans`                   |
   | 测试 / QA               | `test-driven-development`                                          |
   | 调试 / debug            | `systematic-debugging`                                             |
   | 审查 / reviewer         | `requesting-code-review`、`chinese-code-review`                    |
   | 收尾 / release          | `verification-before-completion`、`finishing-a-development-branch` |
   | 大屏面板相关            | `bigscreen-panel`                                                  |
   | 查项目约定              | `repowiki`                                                         |

3. **逐 stage 执行**：一次只推进一个 stage，严格按该 skill 的流程走，不跳步。
4. **产物落盘**：stage 结束时把结论写进 `outputs` 指定路径（设计 → `docs/superpowers/specs/`，
   计划 → `docs/superpowers/plans/`，代码 → 对应 `src/` 目录）。**只留在对话里不算完成。**
5. **checkpoint 停下**：`checkpoint: true` 的 stage 结束后，向用户汇报并等待确认，不自动进入下一阶段。
6. **失败处理**：同一 stage 最多重试 2 次；仍失败就记录失败原因、已尝试的方案、需要的输入，
   然后请用户介入 —— 禁止静默跳过或伪造结果。

## 每个 stage 的输出契约

```markdown
### Stage N：<名称>（role: <角色>）

完成：<做了什么>
证据：<命令 + 输出摘要 / 文件路径 + 行号>
产物：<落盘路径>
遗留：<未解决项，或"无">
```

证据是硬要求：说"测试通过"就要给出测试命令与通过数；说"样式已对齐"就要给出设计稿数值与代码数值的对照。

## 本项目补充约定

- 代码类 stage 收尾必须跑四项门禁并附结果：`pnpm lint`、`pnpm lint:style`、`npx vue-tsc --noEmit`、`pnpm test`
- 涉及 `src/jo-components`（git 子模块）的 stage，先说明是否需要在子模块仓库单独提交
- 提交类动作（`git commit` / `push`）必须用户显式要求才执行

## 反例

- 跳过 checkpoint 一口气跑完，用户失去干预机会
- 把 stage 输出只写在回复里，不落盘，下次会话无法接续
- 用 role 名称装样子，实际没走对应 skill 的流程
- 整份 YAML + 全部中间产物一次性塞进上下文，导致后期 stage 丢失细节
- 失败后编造"已完成"继续往下走
