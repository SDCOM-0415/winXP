const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

const TARGET_ORIGIN_CACHE = new Map();

function getProtocolModule(protocol) {
  return protocol === 'https:' ? https : http;
}

function buildTargetUrl(reqUrl) {
  const match = reqUrl.match(/^\/proxy\/(https?:\/\/.+)/);
  if (!match) return null;
  try {
    return new URL(match[1]);
  } catch {
    return null;
  }
}

function extractOriginFromReferer(referer) {
  if (!referer) return null;
  const cached = TARGET_ORIGIN_CACHE.get(referer);
  if (cached) return cached;
  const match = referer.match(/\/proxy\/((https?:\/\/)[^/]+)/);
  if (match) {
    const origin = match[1];
    TARGET_ORIGIN_CACHE.set(referer, origin);
    return origin;
  }
  return null;
}

function buildUrlFromReferer(reqUrl, referer) {
  const origin = extractOriginFromReferer(referer);
  if (!origin) return null;
  try {
    return new URL(reqUrl, origin + '/');
  } catch {
    return null;
  }
}

function setCorsHeaders(res, origin) {
  const allowOrigin =
    ALLOWED_ORIGINS[0] === '*' ? '*' : ALLOWED_ORIGINS.includes(origin) ? origin : '';
  if (!allowOrigin) return false;
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return true;
}

function rewriteUrls(body, targetUrl) {
  const origin = targetUrl.origin;
  const proxyBase = '/proxy/' + origin;

  body = body.replace(
    /((?:src|href|action|poster|data-src|data-original|data-lazy)\s*=\s*)(["'])(\/\/[^"']+)\2/gi,
    (m, attr, q, url) => attr + q + '/proxy/https:' + url + q,
  );

  body = body.replace(
    /((?:src|href|action|poster|data-src|data-original|data-lazy)\s*=\s*)(["'])(\/[^/"'][^"']*)\2/gi,
    (m, attr, q, path) => attr + q + proxyBase + path + q,
  );

  body = body.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (m, open, css, close) => open + rewriteCssUrls(css, targetUrl) + close,
  );

  body = body.replace(
    /(style\s*=\s*)(["'])([\s\S]*?)\2/gi,
    (m, prefix, q, css) => prefix + q + rewriteCssUrls(css, targetUrl) + q,
  );

  body = body.replace(
    /(srcset\s*=\s*)(["'])([^"']+)\2/gi,
    (m, attr, q, value) => {
      const resolved = value.replace(/(\S+)(\s+[\d.]+[wx])?/g, (mm, url, desc) => {
        url = resolveProxyUrl(url, targetUrl);
        return url + (desc || '');
      });
      return attr + q + resolved + q;
    },
  );

  return body;
}

function rewriteCssUrls(css, targetUrl) {
  const origin = targetUrl.origin;
  css = css.replace(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi, (m, q, url) => {
    if (/^(data:|blob:|https?:\/\/)/i.test(url)) {
      if (/^https?:\/\//i.test(url)) return 'url(' + q + '/proxy/' + url + q + ')';
      return m;
    }
    if (url.startsWith('//')) return 'url(' + q + '/proxy/https:' + url + q + ')';
    if (url.startsWith('/')) return 'url(' + q + '/proxy/' + origin + url + q + ')';
    const base = targetUrl.href.substring(0, targetUrl.href.lastIndexOf('/') + 1);
    return 'url(' + q + '/proxy/' + base + url + q + ')';
  });

  css = css.replace(/@import\s+(['"])([^'"]+)\1/gi, (m, q, url) => {
    url = resolveProxyUrl(url, targetUrl);
    return '@import ' + q + url + q;
  });

  return css;
}

function resolveProxyUrl(url, targetUrl) {
  if (/^(data:|blob:|javascript:|mailto:)/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return '/proxy/' + url;
  if (url.startsWith('//')) return '/proxy/https:' + url;
  if (url.startsWith('/')) return '/proxy/' + targetUrl.origin + url;
  const base = targetUrl.href.substring(0, targetUrl.href.lastIndexOf('/') + 1);
  return '/proxy/' + base + url;
}

function handleProxy(req, res, targetUrl) {
  const mod = getProtocolModule(targetUrl.protocol);
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: req.headers.accept || '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'identity',
    Referer: targetUrl.origin + '/',
  };

  if (req.headers.cookie) {
    headers.Cookie = req.headers.cookie;
  }

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers,
    timeout: 15000,
  };

  const proxyReq = mod.request(options, proxyRes => {
    const statusCode = proxyRes.statusCode;
    const contentType = (proxyRes.headers['content-type'] || '').toLowerCase();

    if ([301, 302, 303, 307, 308].includes(statusCode) && proxyRes.headers.location) {
      let location = proxyRes.headers.location;
      try {
        const redirectUrl = new URL(location, targetUrl.href);
        location = '/proxy/' + redirectUrl.href;
      } catch {}
      res.writeHead(statusCode, { Location: location });
      res.end();
      return;
    }

    const responseHeaders = {};
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      const lk = key.toLowerCase();
      if (
        lk === 'x-frame-options' ||
        lk === 'content-security-policy' ||
        lk === 'content-security-policy-report-only' ||
        lk === 'x-content-type-options' ||
        lk === 'strict-transport-security' ||
        lk === 'content-encoding' ||
        lk === 'transfer-encoding' ||
        lk === 'content-length'
      ) {
        continue;
      }
      responseHeaders[key] = value;
    }

    const isHtml = contentType.includes('text/html');
    const isCss = contentType.includes('text/css');

    if (!isHtml && !isCss) {
      responseHeaders['Cache-Control'] = 'public, max-age=86400';
      res.writeHead(statusCode, responseHeaders);
      proxyRes.pipe(res);
      return;
    }

    const chunks = [];
    proxyRes.on('data', chunk => chunks.push(chunk));
    proxyRes.on('end', () => {
      let body = Buffer.concat(chunks).toString('utf-8');

      if (isHtml) {
        body = rewriteUrls(body, targetUrl);

        const injectScript = `<script>(function(){
  document.addEventListener("click", function(e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    if (a.target === "_blank") {
      e.preventDefault();
      var fullUrl = href;
      if (href.startsWith("/proxy/")) fullUrl = href.replace("/proxy/", "");
      else if (/^https?:\\/\\//.test(href)) fullUrl = href;
      else return;
      window.parent.postMessage({type:"ie-open-window",url:fullUrl},"*");
    }
  }, true);
  var origOpen = window.open;
  window.open = function(url) {
    if (url) {
      var fullUrl = url;
      if (url.startsWith("/proxy/")) fullUrl = url.replace("/proxy/", "");
      window.parent.postMessage({type:"ie-open-window",url:fullUrl},"*");
    }
    return null;
  };
})()<\/script>`;

        if (/<head/i.test(body)) {
          body = body.replace(/(<head[^>]*>)/i, '$1' + injectScript);
        } else {
          body = injectScript + body;
        }
      }

      if (isCss) {
        body = rewriteCssUrls(body, targetUrl);
      }

      responseHeaders['Content-Type'] = contentType.includes('charset')
        ? contentType
        : contentType + '; charset=utf-8';
      responseHeaders['Content-Length'] = Buffer.byteLength(body);
      res.writeHead(statusCode, responseHeaders);
      res.end(body);
    });
  });

  proxyReq.on('error', err => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h3>无法访问该网页</h3><p>' + err.message + '</p>');
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.writeHead(504, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h3>请求超时</h3>');
  });

  if (req.method === 'POST') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url.startsWith('/proxy/')) {
    const targetUrl = buildTargetUrl(req.url);
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid proxy URL');
      return;
    }
    handleProxy(req, res, targetUrl);
    return;
  }

  const referer = req.headers.referer || req.headers.referrer || '';
  const targetUrl = buildUrlFromReferer(req.url, referer);
  if (targetUrl) {
    handleProxy(req, res, targetUrl);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log('Proxy server running on port ' + PORT);
});
