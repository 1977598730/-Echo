---
name: mcp-builder
description: >-
  MCP 服务器构建与接入方法论——工具边界划分、schema 优先、传输选择、大结果 artifact 化、
  超时降级与调试，含本项目 .qoder/mcp.json（MasterGo vibe-mcp / magic-mcp）实践。
  当需要新建 MCP server、给客户端加外部能力，或排查 MCP 工具调用失败时使用。
---

# MCP 服务器构建

## 何时使用

- 要给 AI 客户端接入新能力：本地设计工具（MasterGo / Figma）、内网接口、数据库、CI
- 已有 MCP 工具调用失败、超时、返回内容过大需要治理
- 评审别人写的 MCP server

## 五步方法论

### 1. 定边界

一个 server 只服务一类资源，工具保持单一职责。**不要把整套 REST API 平铺成几十个工具** ——
模型选错工具的概率随工具数量上升。优先提供少量高内聚工具：

| 好                                      | 坏                                                                    |
| --------------------------------------- | --------------------------------------------------------------------- |
| `get_selection_node`（拿当前选中图层）  | `get_node` / `get_children` / `get_styles` / `get_texts` … 拆成 10 个 |
| `get_frontend_code`（一次拿到可用代码） | 让模型自己拼 20 次调用还原一棵树                                      |

### 2. Schema 优先

先写输入 JSON Schema 再写实现：必填字段、类型、枚举、示例、字段含义。

- 用 `zod` / `valibot` 做运行时校验，非法入参立刻返回可读错误，而不是抛栈
- **调用方（含 AI）必须先读到真实 schema**，不要凭工具名猜参数。本项目做法：
  MCP 工具定义缓存在 `mcps/<server>/tools/<tool>.json`，调用前 `Read` 一次

### 3. 传输选择

| 场景                   | 传输       | 配置形态                                                                   |
| ---------------------- | ---------- | -------------------------------------------------------------------------- |
| 本地进程、随客户端启停 | stdio      | `"command": "npx", "args": ["-y", "包名", "--url=http://localhost:30678"]` |
| 常驻服务、多客户端共享 | HTTP / SSE | `"url": "https://...", "headers": {...}`                                   |

本项目 `.qoder/mcp.json`（该文件被 `.gitignore` 的 `.qoder/*` 覆盖，属个人本机配置）：

```json
{
  "mcpServers": {
    "mastergo": {
      "command": "npx",
      "args": ["-y", "@mastergo/vibe-mcp@latest", "--url=http://localhost:30678"]
    },
    "mastergo-magic-mcp": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@mastergo/magic-mcp",
        "--token=<TOKEN>",
        "--url=https://mastergo.com"
      ]
    }
  }
}
```

两个 server 的差异要记牢：`vibe-mcp` 走本地客户端端口（30678），无需 token，能读当前选中图层；
`magic-mcp` 走远程，需要 token，`mcp__extractSvg` 之类必须显式传 `fileId` + `layerId`。

### 4. 结果设计

- 返回**结构化 JSON**，字段名自解释；不要返回整页 HTML 让调用方自己找
- 大结果 artifact 化：超过几千行就写临时文件并返回路径 + 摘要，由调用方按需 `Read` 分段
  （MasterGo `get_selection_node` 就是这么做的：4000+ 行快照落缓存文件，只回节点概要）
- 错误返回三要素：**发生了什么 / 为什么 / 建议的下一步动作**
- 幂等性：读操作可重试；写操作要带幂等键，避免重试造成重复副作用

### 5. 超时与降级

- 每个工具设显式超时；超时错误码要可识别（MasterGo `get_screenshot` 会返回 40504 超时）
- 有降级路径：截图拿不到 → 改用节点快照里的几何/样式数值推导，并**明确告知未能做视觉验证**
- 长任务返回进度或任务 ID，不要让调用方干等

## 调试

```bash
# 官方 Inspector（本地 stdio server）
npx @modelcontextprotocol/inspector npx -y <你的包>

# 客户端侧：看 MCP 日志目录与工具清单是否刷新；改完 mcp.json 通常要重启客户端
```

排查顺序：进程能否启动（`npx -y` 首次要联网下载）→ 端口/URL 是否可达 → token 是否有效 →
schema 是否匹配 → 结果是否超限。

## 安全与凭据

- token **不要**写进被版本库跟踪的文件；本项目 `.qoder/*` 已 gitignore，但仍不要贴到聊天、文档、截图里
- 需要入库的配置用占位符（`--token=<TOKEN>`）或环境变量，并在 README 说明获取方式
- server 侧不要记录完整凭据到日志；日志脱敏
- 只申请最小权限范围的 token

## 自检清单

```
- [ ] 工具数量克制，每个工具单一职责，命名能让模型不读文档就选对
- [ ] 输入 schema 有必填/类型/示例，且有运行时校验
- [ ] 输出结构化；大结果落盘返回路径
- [ ] 错误信息含原因与建议动作
- [ ] 有超时设置与降级路径
- [ ] 凭据不入库、不进日志
- [ ] 在目标客户端里实跑过一次，留了证据
```

## 反例

- 一个 server 塞 40 个工具，模型频繁选错
- 返回 base64 大图或整棵 DOM 树，撑爆上下文
- 无超时，工具挂死拖垮整个会话
- schema 写 `object` 不带 properties，调用方只能靠猜
- 把 token 提交进仓库或写进对外文档
