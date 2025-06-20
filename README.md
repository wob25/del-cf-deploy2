# 🧹 Cloudflare Pages 全自动部署清理工具

全自动发现并清理您 Cloudflare 账户下**所有** Pages 项目的旧部署，每个项目仅保留最新的 3 个版本，让您的 Pages 管理后台永远保持整洁。

---

## ✨ 核心特性 Highlights

- 🤖 **全自动发现**：无需手动配置项目列表，自动获取并清理账户下的所有 Pages 项目。
- 🧹 **定时清理**：默认每天凌晨 2 点（UTC）自动执行，也支持随时手动触发。
- 🔐 **安全可靠**：自动跳过当前正在使用的生产（Production）部署，防止任何服务中断。
- ☁️ **云端托管**：完全基于 GitHub Actions，零成本，无需您自己的服务器。

---

## 🚀 一步完成设置 (One-Step Setup)

整个过程极其简单，只需 **Fork 仓库并添加密钥** 即可。

### 唯一的步骤：Fork 仓库并添加 Secrets

1.  **Fork** 本仓库到你自己的 GitHub 账号下。

2.  进入你 Fork 后的仓库，前往 `Settings` → `Secrets and variables` → `Actions` → `Repository secrets`，点击 `New repository secret` 添加以下两个密钥：

| 名称             | 说明                                |
|------------------|-------------------------------------|
| `CF_API_TOKEN`   | Cloudflare 的 API Token，需具有 Pages 读写权限 |
| `CF_ACCOUNT_ID`  | 你的 Cloudflare 账户 ID               |

> **不知道如何获取？** [可以参考这篇详细教程](https://wobshare.us.kg/del-cf-deploy)

**✨ 完成！**

现在一切就绪。GitHub Actions 将会根据预设的计划（或您的手动触发）自动开始工作。您无需再进行任何其他配置。

---

## 🔰 手动运行

如果您想立即执行一次清理，可以进入仓库的 `Actions` 页面，在左侧选择 `Cleanup All Cloudflare Pages Projects` 工作流，然后点击 `Run workflow` 按钮手动触发。

![手动运行示意图](https://gcore.jsdelivr.net/gh/wob-21/Cloud-storage@main/image/34.png)
