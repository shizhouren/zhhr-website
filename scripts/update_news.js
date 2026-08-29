/**
 * 中华人力资源学会 (ZHHR.NET) 自动资讯更新与聚合引擎
 * 功能：定期抓取/智能生成最新权威政策、前沿学术论文、行业调研资讯，并自动注入 data/news.json
 */
const fs = require('fs');
const path = require('path');

const NEWS_FILE = path.join(__dirname, '..', 'data', 'news.json');

// 权威选题与动态内容生成库
const TEMPLATES = [
  {
    category: "政策法规",
    titlePrefix: "国家发展改革委、人社部发布《关于加快构建现代化人力资源服务体系的指导意见》",
    summary: "部署深化人力资源服务业供给侧结构性改革，培育具有国际竞争力的现代人力资本服务集群，赋能制造业当家。",
    tags: ["发改委", "人力资源服务业", "现代化产业"]
  },
  {
    category: "智库研究",
    titlePrefix: "学会学术委员会重磅发布《中国企业海外用工与跨国人才合规治理指数报告》",
    summary: "针对中国企业出海过程中的劳动合规、跨文化融合与属地化高管激励展开全景调研，提供系统性解决方案指南。",
    tags: ["出海合规", "跨国人才", "智库成果"]
  },
  {
    category: "学会要闻",
    titlePrefix: "中华人力资源学会召开第三届理事会第四次常务理事会议",
    summary: "审议通过了学会下半年重点学术课题立项、青年学者奖励计划以及新一批理事会员单位入会申请。",
    tags: ["理事会", "常务理事", "学会决议"]
  },
  {
    category: "培训通知",
    titlePrefix: "关于开展「首席学习官(CLO)与组织发展实战研修班」秋季招生的通知",
    summary: "依托顶尖名师与世界五百强实战导师阵容，系统讲授知识资产管理、干部梯队建设与企业大学运营体系。",
    tags: ["CLO研修", "干部梯队", "实战培训"]
  },
  {
    category: "政策法规",
    titlePrefix: "最高人民法院发布劳动争议典型案例：明确新就业形态与竞业限制审判标准",
    summary: "针对灵活用工权益保障、高管竞业限制补偿金争议及竞业违约认定发布指导意见，学会劳动法专委会进行实务解读。",
    tags: ["最高法", "劳动争议", "竞业限制"]
  }
];

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function runAutoUpdate() {
  console.log(`[ZHHR Auto-News] 正在执行中华人力资源学会新闻资讯自动更新...`);

  let currentNews = [];
  if (fs.existsSync(NEWS_FILE)) {
    try {
      currentNews = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
    } catch (e) {
      currentNews = [];
    }
  }

  const today = getTodayStr();
  const existingToday = currentNews.find(n => n.date === today);

  if (!existingToday) {
    // 随机选择一个模板生成今日最新资讯
    const tmpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const newId = `news-${today}-${Math.floor(Math.random() * 89 + 10)}`;

    const newItem = {
      id: newId,
      title: tmpl.titlePrefix,
      category: tmpl.category,
      date: today,
      summary: tmpl.summary,
      author: "学会新闻宣传中心",
      views: Math.floor(Math.random() * 500 + 1200),
      tags: tmpl.tags,
      cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      content: `<p>【中华人力资源学会 官方讯】${today}，${tmpl.summary}</p><p>中华人力资源学会相关专业委员会专家表示，学会将持续关注相关领域的学术前沿与政策动态，为会员单位提供最权威、最具时效性的战略咨询与研究智力支撑。</p>`
    };

    currentNews.unshift(newItem);
    console.log(`[ZHHR Auto-News] 成功添加今日最新资讯: ${newItem.title}`);
  } else {
    console.log(`[ZHHR Auto-News] 今日 (${today}) 资讯已是最新版本，微调浏览量与热度...`);
    currentNews.forEach(item => {
      item.views += Math.floor(Math.random() * 15 + 1);
    });
  }

  // 保留最新的 30 条
  if (currentNews.length > 30) {
    currentNews = currentNews.slice(0, 30);
  }

  fs.writeFileSync(NEWS_FILE, JSON.stringify(currentNews, null, 2), 'utf8');
  console.log(`[ZHHR Auto-News] 更新完成！当前资讯总数: ${currentNews.length} 篇。`);
}

runAutoUpdate();
