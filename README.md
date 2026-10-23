# 中华人力资源学会 (ZHHR) 官方网站 · zhhr.net

全国性人力资源管理学术与产业赋能社团官方网站，纯静态架构 + Serverless 表单，**零成本永久免费托管**于 Cloudflare Pages。

## 网站栏目

| 栏目 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 学会形象、数据看板、核心业务、最新动态、会员价格、学术委员会 |
| 学会概况 | `/about.html` | 学会简介、章程架构、专业委员会 |
| 学术动态 | `/news.html` | 资讯中心（分类筛选），详情页 `/news-detail.html?id=...` |
| 智库研究 | `/research.html` | 白皮书与课题成果 |
| 培训认证 | `/training.html` | CHO 研修、CDHRM 认证 |
| 联系我们 | `/contact.html` | 秘书处联系方式 |
| 会员中心 | `/join/` | 企业/个人会员在线入会 + 扫码缴费 + 申请提交 |

## 技术架构

- **纯静态 HTML/CSS/JS**，无构建流程，任何静态托管平台可直接部署
- **`functions/api/apply.js`**：Cloudflare Pages Function，接收入会申请并自动写入 GitHub Issue（环境变量 `GH_TOKEN`、`GH_REPO`）
- **自动内容更新**：`.github/workflows/auto_update.yml` 每周一/四由 GitHub Actions 运行 `scripts/update_news.js` 更新 `data/news.json` 并自动推送，触发 Cloudflare Pages 重新部署
- **收款码**：上传 `assets/qr-wechat.png`、`assets/qr-alipay.png` 后页面自动展示真实收款码（见 `assets/README.md`）

## 本地预览

```bash
node server.js   # http://localhost:3000
```

## 部署

见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)（Cloudflare Pages 一键部署 + 绑定 zhhr.net 域名全流程）。
