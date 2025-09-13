import createDebug from 'debug';

const debug = createDebug('google-play-scraper');

// Simple CookieJar implementation
class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setCookie(cookieString, url) {
    if (!cookieString) return;
    
    const cookies = cookieString.split(',').map(cookie => cookie.trim());
    
    for (const cookie of cookies) {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      
      if (name && value) {
        this.cookies.set(name.trim(), value.trim());
      }
    }
  }

  getCookieString(url) {
    if (this.cookies.size === 0) return '';
    
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
}

const cookieJar = new CookieJar();

async function doRequest(opts, limit) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };

  // Add cookies if available
  const cookieString = cookieJar.getCookieString(opts.url);
  if (cookieString) {
    headers.Cookie = cookieString;
  }

  // Merge with custom headers
  if (opts.headers) {
    Object.assign(headers, opts.headers);
  }

  const fetchOptions = {
    method: opts.method || 'GET',
    headers,
    redirect: opts.followRedirect ? 'follow' : 'manual'
  };

  if (opts.body) {
    fetchOptions.body = opts.body;
  }

  // Handle throttling
  if (limit && limit > 0) {
    await new Promise(resolve => setTimeout(resolve, limit));
  }

  const response = await fetch(opts.url, fetchOptions);

  // Handle cookies from response
  const setCookieHeader = response.headers.get('Set-Cookie');
  if (setCookieHeader) {
    cookieJar.setCookie(setCookieHeader, opts.url);
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return await response.text();
}

async function request (opts, limit) {
  debug('Making request: %j', opts);
  try {
    const response = await doRequest(opts, limit);
    debug('Request finished');
    return response;
  } catch (reason) {
    debug('Request error:', reason.message, reason.status);

    let message = 'Error requesting Google Play:' + reason.message;
    if (reason.status === 404) {
      message = 'App not found (404)';
    }
    const err = Error(message);
    err.status = reason.status;
    throw err;
  }
}

export default request;
