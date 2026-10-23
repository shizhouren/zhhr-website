# 中华人力资源学会 (ZHHR.NET) 官网免费托管部署与域名绑定全指南

本项目为纯静态官网 + Cloudflare Pages Function（入会表单），支持**零成本永久免费托管**，并绑定域名 `zhhr.net` 公开访问。

---

## 方案一：Cloudflare Pages 部署（推荐，选定方案）

### 第 1 步：将代码推送到 GitHub

```bash
cd D:\vibecoding\hrsite
git add .
git commit -m "feat: 中华人力资源学会官网全量上线"
git push   # 仓库已由助手创建并推送，此步仅在后续更新时使用
```

### 第 2 步：在 Cloudflare Pages 中导入并一键部署

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com)（没有账号先免费注册）。
2. 左侧 **Workers 和 Pages** → **Pages** → **连接到 Git (Connect to Git)**。
3. 授权并选择本项目的 GitHub 仓库（如 `shizhouren/zhhr-website`）。
4. 构建配置保持默认：
   * **框架预设**：`None`
   * **构建命令**：留空
   * **构建输出目录**：`.`（根目录）
5. 点击 **保存并部署**。1 分钟内获得 `https://<项目名>.pages.dev` 访问地址。

> Pages 会自动识别根目录 `functions/`，入会表单接口 `/api/apply` 即刻生效（无需任何构建）。

### 第 3 步：配置入会表单环境变量（申请自动存入 GitHub Issue）

在 Pages 项目 → **设置** → **变量和机密 (Variables)** → 添加两个生产环境变量：

| 变量名 | 值 | 说明 |
| --- | --- | --- |
| `GH_TOKEN` | GitHub Personal Access Token（勾选 `repo` 权限） | 用于以你的身份创建 Issue |
| `GH_REPO` | `shizhouren/zhhr-website` | 接收入会申请的仓库 |

> Token 生成：GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens，仅授权本仓库的 Issues 读写权限即可。
> 添加变量后需点击 **重新部署** 一次才会生效。未配置时表单仍可提交（返回受理编号），申请内容打印在 Pages 的 Functions 日志中。

### 第 4 步：绑定自定义域名 `zhhr.net`

1. Pages 项目 → **自定义域 (Custom domains)** → **设置自定义域**，依次添加 `zhhr.net` 和 `www.zhhr.net`。
2. **若域名 DNS 已托管在 Cloudflare**：系统全自动配置解析与 SSL 证书，等待几分钟生效。
3. **若域名在阿里云/腾讯云/GoDaddy 等注册商**（推荐直接把 DNS 托管迁移到 Cloudflare，免费且生效最快）：
   * 添加 CNAME 记录：主机记录 `www` → `你的项目名.pages.dev`
   * 根域 `@` 添加 CNAME（部分注册商支持 CNAME flattening，如不支持则用 ALIAS/显性 URL 转发到 www）
4. SSL 证书由 Cloudflare 自动签发，全站 HTTPS。

---

## 方案二：Vercel 部署（备用）

1. [Vercel](https://vercel.com) → Add New Project → 导入仓库 → Deploy（配置已含 `vercel.json`）。
2. Settings → Domains 添加 `zhhr.net`，按提示加解析记录。
3. 表单接口需在 Vercel 项目同样配置 `GH_TOKEN`、`GH_REPO` 环境变量（`api/` 目录方案待接入时补充，当前表单会走前端降级受理）。

## 方案三：容器托管（Render / Zeabur / Railway 等，备用）

项目根目录已含 `Dockerfile`（纯 Node 零依赖，秒级构建）：

```
EXPOSE 3000 → CMD node server.js
```

导入仓库后平台自动识别 Dockerfile 部署，注意**此方案表单数据仅写入容器本地 `data/applications.json`**，重启即失，建议仅作演示。

---

## 自动化内容更新机制

`.github/workflows/auto_update.yml`（已配置 `contents: write` 权限）：

* 每周一、周四北京时间 08:00，GitHub Actions 自动运行 `scripts/update_news.js`
* 新资讯写入 `data/news.json` 并由 Bot 自动提交推送
* 推送触发 Cloudflare Pages 自动重新构建发布——**官网内容无人值守定期更新**
* 也可在仓库 Actions 页面手动 Run workflow 立即更新

---

## 上线前需替换的占位信息清单

| 位置 | 当前占位内容 | 替换为 |
| --- | --- | --- |
| `assets/qr-wechat.png`、`assets/qr-alipay.png` | 占位样式（未上传） | 真实微信/支付宝收款码图片 |
| `data/membership.json` → `bankInfo` | 示例对公账户 | 真实对公账户信息 |
| `index.html` 页脚 / `contact.html` | 示例电话、地址、邮箱 | 真实联系方式 |
| `index.html` 页脚 | "京ICP备案申请中" | 取得备案号后替换（中国大陆服务器才需备案，Cloudflare 海外节点可不备案） |
| 首页统计数据、专家名单 | 示例数据 | 真实数据 |

---

## 本地极速启动与测试

```bash
cd D:\vibecoding\hrsite
node server.js
# 访问 http://localhost:3000
```
