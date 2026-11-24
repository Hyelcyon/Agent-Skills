import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import https from 'node:https';
import http from 'node:http';

const BLOCKED_IPV4_PREFIXES: readonly string[] = [
  '0.',
  '10.',
  '127.',
  '169.254.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.'
];

function isPublicIp(ip: string): boolean {
  if (ip === '::1' || ip === '0.0.0.0') {
    return false;
  }
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return false;
  }
  for (const prefix of BLOCKED_IPV4_PREFIXES) {
    if (ip.startsWith(prefix)) {
      return false;
    }
  }
  return true;
}

interface FetchResult {
  statusCode: number;
  data: string;
}

async function safeHttpsFetch(targetUrl: string): Promise<FetchResult> {
  const parsed = new URL(targetUrl);

  if (parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS protocol is permitted');
  }

  const resolved = await lookup(parsed.hostname, { all: true });

  if (resolved.length === 0) {
    throw new Error('DNS resolution yielded no addresses');
  }

  for (const addr of resolved) {
    if (!isPublicIp(addr.address)) {
      throw new Error(`SSRF blocked: IP ${addr.address} is restricted`);
    }
  }

  const pinnedIp = resolved[0].address;

  return new Promise<FetchResult>((resolve, reject) => {
    const req = https.request(
      {
        host: pinnedIp,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        servername: parsed.hostname,
        headers: {
          Host: parsed.hostname,
          'User-Agent': 'SecureAgent/1.0'
        },
        timeout: 5000
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 500,
            data: body
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

export { safeHttpsFetch, isPublicIp };
export type { FetchResult };
