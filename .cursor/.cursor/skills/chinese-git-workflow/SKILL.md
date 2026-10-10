---
name: chinese-git-workflow
description: >-
  国内 Git 平台配置参考——本项目 Gitee 远端与子模块、私有 npm 源、凭据与 CI 接入，
  以及 Gitee / Coding.net / 极狐 GitLab / CNB 的差异对照与镜像同步。
  仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
---

# 国内 Git 平台工作流

## 本项目事实（先核对再操作）

| 项        | 值                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------- |
| 远端      | `origin` → `https://gitee.com/as-dpt/jo-smart-forest-defense-web.git`（HTTPS）                          |
| 子模块    | `src/jo-components` → `https://gitee.com/as-dpt/jo-public-component-web.git`，跟踪分支 `release-v1.0.0` |
| npm 源    | `.npmrc` → `registry=http://47.92.86.16:4873/`（内网 Verdaccio，**HTTP 非 HTTPS**）                     |
| pnpm 配置 | `shamefully-hoist=true`、`auto-install-peers=true`、`strict-peer-dependencies=false`                    |
| 包管理    | 强制 pnpm（`preinstall: npx only-allow pnpm`），有 `pnpm-workspace.yaml`                                |
| 钩子      | `.husky/*` 被 gitignore → 每台机器本地生成，见 `chinese-commit-conventions`                             |

## 首次克隆

```bash
# 必须带子模块，否则 src/jo-components（CesiumMap / ThreeMap）为空，构建直接失败
git clone --recurse-submodules https://gitee.com/as-dpt/jo-smart-forest-defense-web.git

# 已经克隆过的补拉子模块
git submodule update --init --recursive

pnpm install   # 不要用 npm / yarn，会被 only-allow 拦下
```

## 改子模块（地图组件）的正确顺序

1. `cd src/jo-components` → 切到 `release-v1.0.0` 分支（默认是 detached HEAD）
2. 改代码、提交、推送**子模块仓库**
3. 回主库 `git add src/jo-components` → 提交指针变更
4. 主库 PR 说明里写清子模块 commit，否则同事拉下来还是旧指针

反例：只在主库改了子模块目录内容却没推子模块仓库 → 别人 `submodule update` 后改动消失。

## 私有 npm 源相关

- 依赖装不上先确认能否访问 `http://47.92.86.16:4873/`（内网源，换网络/在家办公会失败）
- 源是 HTTP，若 npm 报 `http` 协议被拒，检查是否被全局 `.npmrc` 或代理覆盖
- 需要临时用公网源：`pnpm install --registry=https://registry.npmmirror.com`（注意 `pnpm-lock.yaml` 的 resolved 地址会变，**不要把这种改动提交**）

## 凭据管理

```bash
# HTTPS + Gitee 私人令牌（Gitee → 设置 → 私人令牌，勾 projects / pull_requests）
# Windows 下由 Git Credential Manager 存进"凭据管理器"

# 换账号 / 令牌失效时清掉旧凭据
git credential-manager erase   # 然后按提示输入 protocol=https host=gitee.com

# 改用 SSH
ssh-keygen -t ed25519 -C "your-mail@example.com"
# 把 ~/.ssh/id_ed25519.pub 贴到 Gitee → 设置 → SSH 公钥
ssh -T git@gitee.com
git remote set-url origin git@gitee.com:as-dpt/jo-smart-forest-defense-web.git
```

子模块地址是独立配置的，主库切 SSH 后记得同步 `.gitmodules` 与 `git submodule sync`。

## 平台差异对照

| 维度         | Gitee                      | Coding.net           | 极狐 GitLab                     | CNB                        |
| ------------ | -------------------------- | -------------------- | ------------------------------- | -------------------------- |
| 合并请求术语 | Pull Request               | Merge Request        | Merge Request                   | Pull Request               |
| CI 产品      | Gitee Go（企业版）         | CODING CI / 构建计划 | 极狐 Runner（`.gitlab-ci.yml`） | CNB Pipeline（`.cnb.yml`） |
| 单文件限制   | 50 MB（超限需 LFS）        | 100 MB               | 取决于自建实例                  | 平台配额                   |
| 仓库容量     | 免费版 500 MB / 单库       | 按套餐               | 自建无硬限                      | 按套餐                     |
| 分支保护     | 仓库设置 → 分支设置        | 分支管理             | Settings → Repository           | 分支策略                   |
| Webhook 签名 | 密码 / 签名（HMAC-SHA256） | 令牌                 | Secret Token                    | 签名密钥                   |
| 企业内网自建 | Gitee 企业版               | CODING 私有化        | 极狐私有化                      | —                          |

## 镜像同步（GitHub ↔ Gitee）

- Gitee 提供「从 GitHub 导入 / 定期同步」，企业版可配双向；同步时注意：
  - 子模块 URL 需一并替换为对应平台地址
  - LFS 对象不随镜像同步，要单独迁移
  - 分支保护与 CI 配置不会同步，需在新平台重配
- 本地手动双推：

```bash
git remote add github https://github.com/<org>/<repo>.git
git push github feature
```

## 常见坑

- **大文件**：`dist/`、`public/decoder/*.wasm`、地图贴图容易超 Gitee 限制；`dist/` 已在 `.gitignore`，不要 `git add -f`
- **强制推送**：`master` 通常有保护；确需 force push 先用 `--force-with-lease`，并知会团队
- **换行符**：Windows 开发建议 `git config core.autocrlf input`，避免整文件 diff 全是 CRLF
- **CI 拉依赖**：国内 CI 里内网源不可达，需在流水线中改用 `registry.npmmirror.com`
- **钩子不入库**：`.husky/*` 被忽略，新同事环境没有 lint 拦截，需在 README 或入职文档里写明手动跑 `pnpm lint`
