/**
 * 资讯中心与动态加载脚本 (ZHHR News)
 */
let allNewsData = [];

async function loadNewsData() {
  try {
    const res = await fetch('/data/news.json?t=' + Date.now());
    if (res.ok) {
      allNewsData = await res.json();
    }
  } catch (err) {
    console.warn('读取本地新闻数据失败，使用内置数据');
  }

  // 渲染首页或资讯页
  if (document.getElementById('homeNewsList')) {
    renderHomeNews('全部');
  }
  if (document.getElementById('newsPageList')) {
    renderNewsPageList('全部');
  }
  if (document.getElementById('newsDetailContent')) {
    renderNewsDetail();
  }
}

// 渲染首页新闻卡片 (限制6条)
function renderHomeNews(category = '全部') {
  const container = document.getElementById('homeNewsList');
  if (!container) return;

  const filtered = category === '全部' ? allNewsData : allNewsData.filter(item => item.category === category);
  const displayItems = filtered.slice(0, 6);

  if (displayItems.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">暂无该分类资讯</div>`;
    return;
  }

  container.innerHTML = displayItems.map(item => `
    <article class="news-card">
      <div class="news-thumb">
        <img src="${item.cover}" alt="${item.title}" loading="lazy">
        <span class="news-badge">${item.category}</span>
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span>📅 ${item.date}</span>
          <span>👁 ${item.views} 次浏览</span>
        </div>
        <a href="/news-detail.html?id=${item.id}">
          <h3 class="news-title">${item.title}</h3>
        </a>
        <p class="news-summary">${item.summary}</p>
        <div class="news-footer">
          <span>${item.author}</span>
          <a href="/news-detail.html?id=${item.id}">查看详情 →</a>
        </div>
      </div>
    </article>
  `).join('');
}

// 渲染完整新闻列表页 (带分页与分类)
function renderNewsPageList(category = '全部') {
  const container = document.getElementById('newsPageList');
  if (!container) return;

  const filtered = category === '全部' ? allNewsData : allNewsData.filter(item => item.category === category);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 60px;">暂无相关资讯</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <article class="news-card" style="margin-bottom: 24px;">
      <div class="news-thumb">
        <img src="${item.cover}" alt="${item.title}">
        <span class="news-badge">${item.category}</span>
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span>📅 ${item.date}</span>
          <span>✍ ${item.author}</span>
          <span>👁 ${item.views} 次阅读</span>
        </div>
        <a href="/news-detail.html?id=${item.id}">
          <h3 class="news-title" style="font-size: 19px;">${item.title}</h3>
        </a>
        <p class="news-summary">${item.summary}</p>
        <div class="news-footer">
          <div style="display: flex; gap: 6px;">
            ${(item.tags || []).map(t => `<span style="background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 8px; border-radius: 4px;">#${t}</span>`).join('')}
          </div>
          <a href="/news-detail.html?id=${item.id}">阅读全文 →</a>
        </div>
      </div>
    </article>
  `).join('');
}

// 渲染新闻详情页
function renderNewsDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const item = allNewsData.find(n => n.id === id) || allNewsData[0];

  if (!item) return;

  document.title = `${item.title} - 中华人力资源学会`;
  const container = document.getElementById('newsDetailContent');
  if (container) {
    container.innerHTML = `
      <div class="detail-header" style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px;">
        <span class="news-badge" style="position: static; display: inline-block; margin-bottom: 14px;">${item.category}</span>
        <h1 style="font-size: 28px; font-weight: 800; color: #0f2b5c; margin-bottom: 16px; line-height: 1.4;">${item.title}</h1>
        <div style="color: #64748b; font-size: 13px; display: flex; justify-content: center; gap: 20px;">
          <span>📅 发布日期：${item.date}</span>
          <span>✍ 来源：${item.author}</span>
          <span>👁 阅读量：${item.views}</span>
        </div>
      </div>
      <div class="detail-body" style="font-size: 16px; line-height: 1.9; color: #334155;">
        ${item.content || `<p>${item.summary}</p>`}
      </div>
    `;
  }
}

// Tab 切换绑定
document.addEventListener('DOMContentLoaded', () => {
  loadNewsData();

  const tabButtons = document.querySelectorAll('.tab-btn[data-category]');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      if (document.getElementById('homeNewsList')) renderHomeNews(cat);
      if (document.getElementById('newsPageList')) renderNewsPageList(cat);
    });
  });
});
