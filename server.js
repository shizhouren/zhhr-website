const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // API Routes
  if (pathname === '/api/news' && req.method === 'GET') {
    const newsFile = path.join(__dirname, 'data', 'news.json');
    if (fs.existsSync(newsFile)) {
      const data = fs.readFileSync(newsFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      res.end(data);
      return;
    }
  }

  if (pathname === '/api/apply' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const application = JSON.parse(body);

        // 蜜罐字段被填写说明是机器人，静默受理丢弃
        if (application.website) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, applicationId: 'ZHHR-' + Date.now().toString(36).toUpperCase() }));
          return;
        }
        if (!application.phone || !application.email || !application.tierName) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: '请完整填写联系手机、邮箱与会员类别' }));
          return;
        }

        application.id = 'ZHHR-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        application.createdAt = new Date().toISOString();
        application.status = 'PENDING_REVIEW'; // 待审核 / 已提交

        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        const appFile = path.join(dataDir, 'applications.json');
        let apps = [];
        if (fs.existsSync(appFile)) {
          try { apps = JSON.parse(fs.readFileSync(appFile, 'utf8')); } catch (e) { apps = []; }
        }
        apps.unshift(application);
        fs.writeFileSync(appFile, JSON.stringify(apps, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, applicationId: application.id, message: '申请已成功提交，请保存申请编号！' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: '请求数据格式错误' }));
      }
    });
    return;
  }

  // Static File Serving
  if (pathname === '/') {
    pathname = '/index.html';
  } else if (pathname === '/join' || pathname === '/join/') {
    pathname = '/join/index.html';
  } else if (!path.extname(pathname)) {
    if (fs.existsSync(path.join(__dirname, pathname + '.html'))) {
      pathname = pathname + '.html';
    } else if (fs.existsSync(path.join(__dirname, pathname, 'index.html'))) {
      pathname = path.join(pathname, 'index.html');
    }
  }

  const filePath = path.join(__dirname, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      const notFoundPath = path.join(__dirname, 'index.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        if (err404) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found - 中华人力资源学会');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data404);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  中华人力资源学会 (ZHHR.NET) 官网服务已启动!`);
  console.log(`  本地访问地址: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
