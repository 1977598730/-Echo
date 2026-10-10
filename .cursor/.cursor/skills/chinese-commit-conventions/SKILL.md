---
name: chinese-commit-conventions
description: >-
  中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、本项目 commitlint/cz-git 现状、
  husky 钩子接线步骤、conventional-changelog 中文配置。
  仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
---

# 中文 Commit 规范

## 本项目现状（动手前先核对，别按通用教程照抄）

| 项                      | 状态                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `commitlint.config.cjs` | 已配置：`extends: @commitlint/config-conventional`；`type-enum` 11 类；`subject-case` 关闭（中文可直书）；`subject-max-length` 100 |
| `commitizen` + `cz-git` | **已安装但未接线**：`package.json` 无 `commit` 脚本、无 `config.commitizen`                                                        |
| husky                   | `prepare: husky` 已配，但 `.husky/` 下只有 `_`，**没有 pre-commit / commit-msg 钩子**                                              |
| lint-staged             | 配置齐全（`*.{vue,ts,js}` → `eslint --fix` + `prettier --write`；`*.{css,scss,vue}` → `stylelint --fix`），但没钩子触发            |
| `.gitignore`            | 忽略 `.husky/*`、`.qoder/*`、`.cursor/` → 钩子与规则都是**个人本机配置，不入库**                                                   |

结论：本项目的提交质量门禁目前靠人工执行 `pnpm lint` / `pnpm lint:style`，**不能假设提交时会被自动拦下**。

## 提交信息模板

```
<type>(<scope>): <中文动宾短语，≤100 字，结尾不加句号>

背景：为什么改（关联需求 / 缺陷现象）
改动：改了什么（按文件或模块列举要点）
影响：影响面与验证方式（跑了哪些门禁、是否涉及共享地图实例）
```

## type 中文对照（与 commitlint.config.cjs 一致）

| type       | 用途                                                     |
| ---------- | -------------------------------------------------------- |
| `feat`     | 新功能                                                   |
| `fix`      | 修复 bug                                                 |
| `docs`     | 文档变更                                                 |
| `style`    | 代码格式（不影响功能，含 prettier/stylelint 批量格式化） |
| `refactor` | 重构（不改外部行为）                                     |
| `perf`     | 性能优化                                                 |
| `test`     | 测试相关                                                 |
| `build`    | 构建系统或外部依赖                                       |
| `ci`       | CI 配置                                                  |
| `chore`    | 其他杂项                                                 |
| `revert`   | 回退                                                     |

## scope 建议取值

用模块目录名，便于 changelog 归类：`fire-response`、`inspection`、`home`、`collaboration`、
`data-management`、`fire-warning`、`cesium-map`、`three-map`、`layouts`、`hooks`、`styles`、`api`、`build`。

## 示例

```
fix(fire-response): 修正火情周边分析面板页签与设计稿错位

背景：MasterGo 129:66988 展开态页签底线应在 41px，实际渲染在 40px
改动：index.vue 页签区 padding-top 改 13px，header 左外边距 14px，页签盒宽固定 108/76
影响：仅样式，vue-tsc / vitest / stylelint 通过
```

## 接线步骤（钩子不入库，每台机器各自执行一次）

```bash
# 1. 生成 .husky/_ （prepare 已做，缺失时补）
npx husky init

# 2. 提交前跑 lint-staged
echo 'npx lint-staged' > .husky/pre-commit

# 3. 提交信息交给 commitlint 校验
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

Git Bash / Windows 下 husky 9 不要求 `chmod +x`。

## cz-git 中文交互式提交（可选）

`package.json` 追加：

```json
{
  "scripts": { "commit": "git-cz" },
  "config": { "commitizen": { "path": "node_modules/cz-git" } }
}
```

`.cz-config.cjs` 可把 type 提示改成中文（`{ value: 'feat', name: 'feat:  新功能' }`），
并配置 `scopes` 为上面那组模块名，`allowCustomScopes: true`、`useEmoji: false`（本项目未用 emoji）。

## conventional-changelog 中文配置（本项目未安装）

如需自动生成中文 CHANGELOG：

```bash
pnpm add -D conventional-changelog-cli conventional-changelog-conventionalcommits
```

`.versionrc.cjs` 里映射中文标题：

```js
module.exports = {
  types: [
    { type: 'feat', section: '✨ 新功能' },
    { type: 'fix', section: '🐛 缺陷修复' },
    { type: 'perf', section: '⚡ 性能优化' },
    { type: 'refactor', section: '♻️ 重构' },
  ],
  skip: { chore: true, style: true, ci: true },
}
```

生成：`npx conventional-changelog -p conventionalcommits -i CHANGELOG.md -s`。
注意 `skip` 掉 chore/style/ci，否则中文 CHANGELOG 会被格式化提交淹没。

## 分支与远端

- 远端：Gitee `as-dpt/jo-smart-forest-defense-web`，走 Pull Request 合并，禁止直推 `master`
- 当前常用工作分支：`feature`；一个需求一条分支，命名 `feat/<模块>-<简述>`、`fix/<模块>-<简述>`

## 反例

- `update`、`修改样式`、`fix bug` 这类无 type 无 scope 的信息（commitlint 会拦，但钩子没接时能溜进去）
- 一次提交里混功能 + 全库格式化（应拆成 `feat(...)` 与 `style(...)` 两次）
- 用 emoji 代替 type
- 把生成物（`dist/`、`pnpm-lock` 无关变更）夹带进功能提交
