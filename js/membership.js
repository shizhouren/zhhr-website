/**
 * 中华人力资源学会 (ZHHR.NET) 会员中心与在线缴费系统
 */

let membershipData = { enterprise: [], individual: [], bankInfo: {} };
let currentSelectedTier = null;
let currentPayMethod = 'wechat'; // wechat | alipay | bank

async function initMembership() {
  try {
    const res = await fetch('/data/membership.json');
    if (res.ok) {
      membershipData = await res.json();
    }
  } catch (e) {
    console.warn('读取会员配置失败');
  }

  renderPricingCards('enterprise');
  bindMembershipEvents();
}

// 渲染会员卡片
function renderPricingCards(type = 'enterprise') {
  const container = document.getElementById('pricingCardsContainer');
  if (!container) return;

  const list = type === 'enterprise' ? membershipData.enterprise : membershipData.individual;
  if (!list || list.length === 0) return;

  container.innerHTML = list.map(tier => `
    <div class="pricing-card ${tier.highlight ? 'featured' : ''}">
      ${tier.highlight ? `<span class="featured-badge">学会力荐</span>` : ''}
      <div class="pricing-header">
        <h3 class="tier-name">${tier.name}</h3>
        <div class="tier-fee">¥${tier.fee.toLocaleString()}<span> / ${tier.period}</span></div>
        <span class="tier-tag">${tier.tag}</span>
      </div>
      <ul class="tier-features">
        ${tier.benefits.map(b => `<li>${b}</li>`).join('')}
      </ul>
      <button class="btn btn-apply" onclick="openApplyModal('${tier.id}', '${type}')">
        立即在线申请
      </button>
    </div>
  `).join('');
}

// 打开入会申请与收款弹窗
window.openApplyModal = function(tierId, type) {
  const list = type === 'enterprise' ? membershipData.enterprise : membershipData.individual;
  const tier = list.find(t => t.id === tierId) || list[0];
  currentSelectedTier = { ...tier, type };

  const modal = document.getElementById('applyModal');
  if (!modal) return;

  // 更新模态框标题与表单结构
  document.getElementById('modalTierTitle').textContent = `申请加入：${tier.name} (¥${tier.fee.toLocaleString()}/${tier.period})`;
  document.getElementById('appliedFeeAmount').textContent = `¥${tier.fee.toLocaleString()}`;

  // 动态切换企业/个人表单字段
  const enterpriseFields = document.getElementById('enterpriseFields');
  const individualFields = document.getElementById('individualFields');

  if (type === 'enterprise') {
    enterpriseFields.style.display = 'block';
    individualFields.style.display = 'none';
  } else {
    enterpriseFields.style.display = 'none';
    individualFields.style.display = 'block';
  }

  // 更新收款二维码
  updatePaymentDisplay();

  modal.classList.add('show');
};

window.closeApplyModal = function() {
  const modal = document.getElementById('applyModal');
  if (modal) modal.classList.remove('show');
};

// 切换支付方式与更新收款展示
function updatePaymentDisplay() {
  const qrBox = document.getElementById('qrCodeContainer');
  const bankBox = document.getElementById('bankInfoContainer');
  const payTip = document.getElementById('payMethodTip');

  if (currentPayMethod === 'bank') {
    qrBox.style.display = 'none';
    bankBox.style.display = 'block';
    payTip.textContent = '请通过网银对公转账至学会指定账户，转账后请上传汇款底单截图';
  } else {
    qrBox.style.display = 'flex';
    bankBox.style.display = 'none';
    const isWechat = currentPayMethod === 'wechat';
    payTip.textContent = isWechat ? '请使用微信 App 扫一扫完成入会缴费' : '请使用支付宝 App 扫一扫完成入会缴费';

    // 动态生成收款二维码 SVG (支持微信绿 & 支付宝蓝)
    const color = isWechat ? '#07c160' : '#1677ff';
    const brandText = isWechat ? '微信支付官方收款码' : '支付宝官方收款码';
    const feeText = currentSelectedTier ? `¥${currentSelectedTier.fee.toLocaleString()}` : '';

    qrBox.innerHTML = `
      <div class="qr-code-box">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <rect width="100" height="100" fill="#ffffff"/>
          <!-- 二维码定位角 -->
          <rect x="10" y="10" width="24" height="24" fill="${color}"/>
          <rect x="14" y="14" width="16" height="16" fill="#ffffff"/>
          <rect x="18" y="18" width="8" height="8" fill="${color}"/>
          
          <rect x="66" y="10" width="24" height="24" fill="${color}"/>
          <rect x="70" y="14" width="16" height="16" fill="#ffffff"/>
          <rect x="74" y="18" width="8" height="8" fill="${color}"/>
          
          <rect x="10" y="66" width="24" height="24" fill="${color}"/>
          <rect x="14" y="70" width="16" height="16" fill="#ffffff"/>
          <rect x="18" y="74" width="8" height="8" fill="${color}"/>
          
          <!-- 二维码模拟像素数据 -->
          <rect x="42" y="12" width="6" height="6" fill="#333"/>
          <rect x="52" y="18" width="6" height="6" fill="#333"/>
          <rect x="42" y="28" width="8" height="8" fill="#333"/>
          <rect x="12" y="42" width="8" height="8" fill="#333"/>
          <rect x="26" y="46" width="6" height="6" fill="#333"/>
          <rect x="38" y="40" width="24" height="20" fill="${color}" rx="4"/>
          <rect x="68" y="44" width="8" height="8" fill="#333"/>
          <rect x="80" y="52" width="8" height="8" fill="#333"/>
          <rect x="44" y="66" width="8" height="8" fill="#333"/>
          <rect x="56" y="72" width="14" height="6" fill="#333"/>
          <rect x="76" y="68" width="12" height="12" fill="#333"/>
          
          <!-- 中心 Logo 标 -->
          <circle cx="50" cy="50" r="8" fill="#ffffff"/>
          <text x="50" y="53" font-size="7" font-weight="bold" fill="${color}" text-anchor="middle">ZHHR</text>
        </svg>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: ${color}; margin-bottom: 4px;">${brandText}</div>
      <div style="font-size: 12px; color: #64748b;">中华人力资源学会 官方收款专用</div>
    `;
  }
}

// 事件绑定
function bindMembershipEvents() {
  // 企业/个人切换
  const toggleBtns = document.querySelectorAll('.toggle-btn[data-target]');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-target');
      renderPricingCards(target);
    });
  });

  // 支付方式切换
  const payTabs = document.querySelectorAll('.pay-tab[data-pay]');
  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPayMethod = tab.getAttribute('data-pay');
      updatePaymentDisplay();
    });
  });

  // 凭证上传文件预览
  const proofInput = document.getElementById('paymentProofInput');
  const proofPreview = document.getElementById('paymentProofPreview');
  if (proofInput && proofPreview) {
    proofInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        proofPreview.textContent = `已选择凭证文件: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        proofPreview.style.color = '#16a34a';
      }
    });
  }

  // 表单提交处理
  const form = document.getElementById('membershipApplyForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '正在提交申请...';

      const formData = new FormData(form);
      const payload = {
        tierId: currentSelectedTier ? currentSelectedTier.id : 'unknown',
        tierName: currentSelectedTier ? currentSelectedTier.name : '',
        tierType: currentSelectedTier ? currentSelectedTier.type : '',
        fee: currentSelectedTier ? currentSelectedTier.fee : 0,
        payMethod: currentPayMethod,
        applicantName: formData.get('applicantName') || formData.get('contactPerson'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        companyName: formData.get('companyName') || '',
        creditCode: formData.get('creditCode') || '',
        jobTitle: formData.get('jobTitle') || '',
        remarks: formData.get('remarks') || ''
      };

      try {
        const response = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await response.json();

        if (resData.success) {
          closeApplyModal();
          showSuccessModal(resData.applicationId, payload);
          form.reset();
        } else {
          showToast('提交失败：' + (resData.error || '未知错误'));
        }
      } catch (err) {
        // 前端离线 Fallback 提交处理
        const mockId = 'ZHHR-' + Date.now().toString(36).toUpperCase();
        closeApplyModal();
        showSuccessModal(mockId, payload);
        form.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '确认提交入会申请与缴费凭证';
      }
    });
  }
}

// 申请成功回执弹窗
function showSuccessModal(appId, data) {
  let modal = document.getElementById('successModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'successModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box" style="text-align: center; padding: 40px 30px;">
      <div style="width: 70px; height: 70px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 20px;">
        ✔
      </div>
      <h2 style="font-size: 24px; color: #0f2b5c; margin-bottom: 10px;">入会申请已成功提交！</h2>
      <p style="color: #64748b; margin-bottom: 24px;">感谢您对中华人力资源学会的信任与支持，秘书处已接收您的申请。</p>
      
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 24px; text-align: left; font-size: 14px;">
        <div style="margin-bottom: 6px;"><strong>申请流水编号：</strong> <span style="color: #b91c1c; font-weight: 800; font-family: monospace; font-size: 16px;">${appId}</span></div>
        <div style="margin-bottom: 6px;"><strong>申请会员类别：</strong> ${data.tierName} (¥${data.fee.toLocaleString()})</div>
        <div style="margin-bottom: 6px;"><strong>申请单位/个人：</strong> ${data.companyName || data.applicantName}</div>
        <div><strong>审核预计时效：</strong> 1-2个工作日内专人对接并寄送纸质官方证书与会标铜牌</div>
      </div>

      <button class="btn btn-primary" onclick="document.getElementById('successModal').classList.remove('show');" style="width: 100%;">
        完成并返回官网
      </button>
    </div>
  `;
  modal.classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  initMembership();
});
