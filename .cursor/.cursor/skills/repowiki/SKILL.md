---
name: repowiki
description: >-
  Looks up this repo's Qoder-exported knowledge base under .qoder/repowiki
  (architecture, Axios/ElMessage, SCSS tokens, Vite/pnpm, env config).
  Use when the user asks about project architecture, conventions, error handling,
  styling tokens, build/env setup, or says 查知识库 / repowiki / qoder wiki.
---

# RepoWiki 知识库

## 路径

- 知识卡：`.qoder/repowiki/knowledge/zh/`
- 模块文档：`.qoder/repowiki/zh/content/`
- 索引：`.qoder/repowiki/knowledge/zh/_index.yaml`

## 使用步骤

1. 先读 `_index.yaml` 或列出 `knowledge/zh/`、`zh/content/` 定位主题
2. 再 `Read` 对应 `.md` 全文，用其中约定回答或改代码
3. 知识卡与源码冲突时：**以当前源码为准**，并提醒知识卡可能过期

## 常见主题（目录名可能含中文）

- Axios 拦截器 / ElMessage 统一错误提示
- SCSS Token + Element Plus 暗色体系
- Vite + pnpm 工程与私有 npm 源
- `.env` 与运行时 `app-config.json`
- 项目概览、安全基线、状态管理、地图可视化等（见 `zh/content/`）

## 注意

- 不要把整本 wiki 复制进 `.cursor/rules`（过长）；需要时按主题按需读取
- 回答用中文，引用时给出相对路径
