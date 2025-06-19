# 🧹 del-cf-deploy — Cloudflare Pages 自动部署清理工具

[![Cleanup Workflow](https://github.com/QiaoGT/del-cf-deploy/actions/workflows/cleanup.yml/badge.svg)](https://github.com/QiaoGT/del-cf-deploy/actions/workflows/cleanup.yml)

清理你的 Cloudflare Pages 项目旧部署，只保留最新 3 个版本，让项目整洁如新。  
Keep your Cloudflare Pages tidy by automatically deleting older deployments and keeping only the latest 3.

---

## ✨ 特性 Highlights

- 🔁 支持多个项目，统一清理
- 🧹 每日自动执行，也支持手动触发
- 🔐 跳过当前激活版本，防止误删
- 🛠️ 全程托管，无需服务器

---

## 🚀 快速上手 Setup

### 1️⃣ 添加 GitHub Secrets

Fork本仓库，然后前往仓库 → Settings → Secrets and variables → Actions → Repository secrets 添加以下两个 secrets：

| 名称             | 说明                                |
|------------------|-------------------------------------|
| `CF_API_TOKEN`   | Cloudflare 的 API Token，需具有 Pages 权限 |
| `CF_ACCOUNT_ID`  | 你的 Cloudflare 账户 ID               |

---
[点击查看：如何获取这两个 secrets](https://wobshare.us.kg/del-cf-deploy)

### 2️⃣ 配置项目列表

在项目根目录下修改 `projects.json` 文件，选择要删除的项目：

```json
[
  "项目1",
  "项目2",
  "项目..."
]
```

---

## 🔰 手动运行

![手动运行示意图](https://gcore.jsdelivr.net/gh/wob-21/Cloud-storage@main/image/34.png)
