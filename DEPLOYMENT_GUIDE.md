# 中华人力资源学会 (ZHHR.NET) 官网免费托管部署与域名绑定全指南

本项目已完成全套静态与服务化架构设计，支持**零成本永久免费托管**在各大主流容器/Serverless 平台上，并支持将你的域名 `zhhr.net` 绑定为公开访问。

---

## 推荐免费托管平台方案（任选其一，推荐方案一或方案二）

| 平台 | 费用 | 国内外访问速度 | 自动化部署 | 绑定 zhhr.net 难度 |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages** (首选) | 永久免费 | ⭐⭐⭐⭐⭐ (全球 Anycast CDN) | 关联 GitHub 自动部署 | ⭐ (最快，支持免费 SSL) |
| **Vercel** (次选) | 永久免费 | ⭐⭐⭐⭐ | 关联 GitHub 自动部署 | ⭐ (一键添加自定义域名) |
| **Netlify** | 永久免费 | ⭐⭐⭐⭐ | 关联 GitHub 自动部署 | ⭐ (配置简单) |
| **Zeabur / Render (容器)** | 免费层 | ⭐⭐⭐⭐ | 自动拉取 Docker 镜像 | ⭐⭐ (适合跑完整 Node.js) |

---

## 方案一：使用 Cloudflare Pages 部署（最推荐，稳定极速）

### 第 1 步：将代码推送到 GitHub
1. 在 [GitHub.com](https://github.com) 上新建一个私有或公开仓库（例如命名为 `zhhr-website`）。
2. 在本地终端（`D:\vibecoding\hrsite` 路径下）执行：
   ```bash
   git add .
   git commit -m "feat: 中华人力资源学会官网全量上线"
   git branch -M main
   git remote add origin https://github.com/你的用户名/zhhr-website.git
   git push -u origin main
   ```

### 第 2 步：在 Cloudflare Pages 中导入并一键部署
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com)。
2. 点击左侧 **Workers 和 Pages** -> **Pages** -> **连接到 Git (Connect to Git)**。
3. 选择你的 `zhhr-website` 仓库。
4. 在构建配置中保持默认：
   * **框架预设 (Framework preset)**: `None`
   * **构建输出目录 (Build output directory)**: `.` (根目录)
5. 点击 **保存并部署 (Save and Deploy)**。1 分钟内即可获得一个 `https://zhhr-website.pages.dev` 访问地址！

### 第 3 步：绑定自定义域名 `zhhr.net`
1. 在 Pages 项目详情页中，点击 **自定义域 (Custom domains)** -> **设置自定义域**。
2. 输入 `zhhr.net` 和 `www.zhhr.net`。
3. 如果你的域名 DNS 解析在 Cloudflare：系统会**全自动配置 DNS 记录并下发 SSL 证书**。
4. 如果你的域名在阿里云/腾讯云/GoDaddy 等注册商：
   * 按照 Cloudflare 提示，在你的域名控制台添加一条 **CNAME 记录**：
     - 主机记录：`@` 或 `www`
     - 记录类型：`CNAME`
     - 记录值：`zhhr-website.pages.dev`
5. 等待 2-5 分钟解析生效，即可在全球通过 `https://zhhr.net` 和 `https://www.zhhr.net` 访问！

---

## 方案二：使用 Vercel 部署（10 秒上线）

1. 登录 [Vercel 官网](https://vercel.com)。
2. 点击 **Add New...** -> **Project** -> 导入 `zhhr-website` 仓库。
3. 根目录直接点击 **Deploy**。
4. 部署成功后，进入 **Settings** -> **Domains**，输入 `zhhr.net`。
5. 在域名解析平台添加 Vercel 提供的 CNAME / A 记录即可。

---

## 自动化内容更新机制说明

本项目内置了 `.github/workflows/auto_update.yml` 定时任务：
* 每周一与周四早晨，GitHub Actions 会自动运行 `scripts/update_news.js`，向 `data/news.json` 写入最新的政策与行业资讯。
* 提交后触发托管平台（Cloudflare/Vercel）自动重新构建发布，**实现无人值守的官网定期自动更新**！

---

## 本地极速启动与测试

在本地也可以随时启动 Node.js 完整服务进行预览：
```bash
cd D:\vibecoding\hrsite
node server.js
```
访问本地地址：`http://localhost:3000`
