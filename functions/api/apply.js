/**
 * Cloudflare Pages Function: POST /api/apply
 * 中华人力资源学会入会申请接收端点
 * 申请数据自动写入 GitHub Issue（在 Pages 项目环境变量中配置 GH_TOKEN / GH_REPO）
 * 未配置或 GitHub 异常时优雅降级：仍返回受理编号，申请信息打印到 Function 日志
 */

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const PAY_LABELS = { wechat: '微信扫码', alipay: '支付宝扫码', bank: '对公银行转账' };

function makeApplicationId() {
  return 'ZHHR-' + Date.now().toString(36).toUpperCase() + '-' + String(Math.floor(Math.random() * 900) + 100);
}

async function createGithubIssue(payload, appId, env) {
  const token = env.GH_TOKEN;
  const repo = env.GH_REPO; // 格式: 用户名/仓库名
  if (!token || !repo) return null;

  const who = payload.companyName || payload.applicantName || '未知申请人';
  const title = `【入会申请】${payload.tierName} - ${who} (${appId})`;
  const body = [
    `## 入会申请回执 ${appId}`,
    '',
    '| 字段 | 内容 |',
    '| --- | --- |',
    `| 申请编号 | \`${appId}\` |`,
    `| 会员类别 | ${esc(payload.tierName)} (${esc(payload.tierType === 'enterprise' ? '企业会员' : '个人会员')}) |`,
    `| 应缴会费 | ¥${Number(payload.fee || 0).toLocaleString()} |`,
    `| 支付方式 | ${PAY_LABELS[payload.payMethod] || esc(payload.payMethod)} |`,
    payload.companyName ? `| 企业名称 | ${esc(payload.companyName)} |` : '',
    payload.creditCode ? `| 统一社会信用代码 | ${esc(payload.creditCode)} |` : '',
    payload.legalPerson ? `| 法定代表人 | ${esc(payload.legalPerson)} |` : '',
    payload.applicantName ? `| 申请人 | ${esc(payload.applicantName)} |` : '',
    payload.jobTitle ? `| 单位与职务 | ${esc(payload.jobTitle)} |` : '',
    `| 手机 | ${esc(payload.phone)} |`,
    `| 邮箱 | ${esc(payload.email)} |`,
    payload.remarks ? `| 备注 | ${esc(payload.remarks)} |` : '',
    '',
    `> 提交时间：${new Date().toISOString()} · 请秘书处核实缴费凭证后回复审核结果`
  ].filter(Boolean).join('\n');

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'zhhr-website',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, body })
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return data.html_url;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return jsonResponse({ success: false, error: '请求数据格式错误' }, 400);
  }

  // 蜜罐防机器人：隐藏字段被填写则静默丢弃
  if (payload.website) return jsonResponse({ success: true, applicationId: makeApplicationId() });

  if (!payload.phone || !payload.email || !payload.tierName) {
    return jsonResponse({ success: false, error: '请完整填写联系手机、邮箱与会员类别' }, 400);
  }

  const appId = makeApplicationId();

  try {
    const issueUrl = await createGithubIssue(payload, appId, env);
    console.log(`[ZHHR] 入会申请 ${appId} 已受理 -> ${issueUrl || '(未配置 GitHub，仅日志登记)'}`, JSON.stringify(payload));
    return jsonResponse({ success: true, applicationId: appId, issueUrl: issueUrl || undefined });
  } catch (err) {
    console.error(`[ZHHR] 入会申请 ${appId} GitHub 写入失败:`, err, JSON.stringify(payload));
    return jsonResponse({ success: true, applicationId: appId });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
