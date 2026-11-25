import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

const RESTRICTED_IP_BLOCKLIST = new BlockList();
RESTRICTED_IP_BLOCKLIST.addSubnet('0.0.0.0', 8, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('10.0.0.0', 8, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('100.64.0.0', 10, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('127.0.0.0', 8, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('169.254.0.0', 16, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('172.16.0.0', 12, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('192.0.0.0', 24, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('192.0.2.0', 24, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('192.168.0.0', 16, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('198.18.0.0', 15, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('198.51.100.0', 24, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('203.0.113.0', 24, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('224.0.0.0', 4, 'ipv4');
RESTRICTED_IP_BLOCKLIST.addSubnet('240.0.0.0', 4, 'ipv4');

RESTRICTED_IP_BLOCKLIST.addAddress('::', 'ipv6');
RESTRICTED_IP_BLOCKLIST.addAddress('::1', 'ipv6');
RESTRICTED_IP_BLOCKLIST.addSubnet('::ffff:0:0', 96, 'ipv6');
RESTRICTED_IP_BLOCKLIST.addSubnet('64:ff9b::', 96, 'ipv6');
RESTRICTED_IP_BLOCKLIST.addSubnet('fc00::', 7, 'ipv6');
RESTRICTED_IP_BLOCKLIST.addSubnet('fe80::', 10, 'ipv6');
RESTRICTED_IP_BLOCKLIST.addSubnet('ff00::', 8, 'ipv6');

function isPublicIp(rawIp: string): boolean {
  const zoneIndex = rawIp.indexOf('%');
  const ip = zoneIndex === -1 ? rawIp : rawIp.slice(0, zoneIndex);
  const family = isIP(ip);
  if (family === 4) {
    return !RESTRICTED_IP_BLOCKLIST.check(ip, 'ipv4');
  }
  if (family === 6) {
    return !RESTRICTED_IP_BLOCKLIST.check(ip, 'ipv6');
  }
  return false;
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

  const pinned = resolved[0];
  if (!pinned) {
    throw new Error('No verified address resolved');
  }

  return new Promise<FetchResult>((resolve, reject) => {
    const req = https.request(
      {
        host: pinned.address,
        family: pinned.family,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: 'GET',
        servername: parsed.hostname,
        headers: {
          Host: parsed.hostname,
          'User-Agent': 'SecureAgent/1.0'
        },
        timeout: 5000
      },
      (res: http.IncomingMessage) => {
        const statusCode = res.statusCode ?? 500;
        if (statusCode >= 300 && statusCode < 400) {
          req.destroy();
          reject(new Error(`Blocked unvalidated redirect status ${statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on('data', (chunk: Buffer | string) => {
          const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
          totalBytes += buf.length;
          if (totalBytes > MAX_RESPONSE_BYTES) {
            req.destroy(new Error(`Response exceeded ${MAX_RESPONSE_BYTES} byte limit`));
            return;
          }
          chunks.push(buf);
        });

        res.on('end', () => {
          resolve({
            statusCode,
            data: Buffer.concat(chunks).toString('utf8')
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.on('error', (err: Error) => {
      reject(err);
    });

    req.end();
  });
}

export { safeHttpsFetch, isPublicIp };
export type { FetchResult };
