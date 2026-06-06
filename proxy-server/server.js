const http = require('http');
const { execFile } = require('child_process');
const { URL } = require('url');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

// 【核心修复】智能探针：自动寻找容器内真实的 Chrome 路径
function getChromePath() {
  const possiblePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome',
    // 部分新版 Puppeteer 镜像会将 Chromium 软链接到全局路径中
    'google-chrome',
    'chromium'
  ];

  for (const path of possiblePaths) {
    try {
      // 如果是绝对路径，检查文件是否存在
      if (path.startsWith('/') && fs.existsSync(path)) {
        console.log(`🎯 成功锁定容器内 Chrome 路径: ${path}`);
        return path;
      }
    } catch (e) {}
  }

  // 兜底：如果都找不到，直接返回 'google-chrome' 尝试让系统环境变量去查找
  console.log(`⚠️ 未找到常规绝对路径，使用系统全局命令 'google-chrome' 兜底`);
  return 'google-chrome';
}

const CHROME_PATH = getChromePath();

// 统一设置完全放开的 CORS 跨域响应头
function setAllowAllCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

const server = http.createServer((req, res) => {
  // 1. 处理跨域预检
  setAllowAllCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  // 2. 健康检查
  if (reqUrl.pathname === '/' || reqUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', engine: 'native_chrome_cli', chrome: CHROME_PATH }));
    return;
  }

  // 3. 核心中转渲染路由
  if (reqUrl.pathname === '/render') {
    const targetUrl = reqUrl.searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('缺少关键参数：?url=');
      return;
    }

    console.log(`正在调取系统原生 Chrome 渲染: ${targetUrl}`);

    const chromeArgs = [
      '--headless',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--dump-dom', 
      targetUrl
    ];

    // 使用探针定位到的真实 CHROME_PATH 执行
    execFile(CHROME_PATH, chromeArgs, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error('Chrome 渲染失败:', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
        }
        res.end(`<h3>Windows XP 远程浏览器中转失败</h3><p>${err.message}</p>`);
        return;
      }

      let content = stdout;

      // 路径补全机制
      try {
        const urlObj = new URL(targetUrl);
        const baseHref = urlObj.origin;
        if (!/<base/i.test(content)) {
          content = content.replace(/(<head[^>]*>)/i, `$1<base href="${baseHref}/">`);
        }
      } catch (e) {}

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 纯原生免依赖影子后端启动成功！监听端口: ${PORT}`);
  console.log(`当前采用的 Chrome 核心: ${CHROME_PATH}`);
  console.log(`====================================================`);
});