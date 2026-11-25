import http from 'node:http';

interface ServerConfig {
  host?: string;
  port: number;
  shutdownTimeoutMs: number;
}

function startGracefulServer(config: ServerConfig): http.Server {
  const server = http.createServer((req, res) => {
    const pathname = (req.url ?? '/').split('?')[0];
    if (pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Operational');
  });

  const bindHost = config.host ?? process.env.HOST ?? '127.0.0.1';
  server.listen(config.port, bindHost);

  let isShuttingDown = false;

  const handleTermination = (_signal: string) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    server.close(() => {
      process.exit(0);
    });
    // Drop idle keep-alive sockets immediately so server.close does not stall until timeout
    server.closeIdleConnections();

    const forceTimer = setTimeout(() => {
      server.closeAllConnections();
      process.exit(1);
    }, config.shutdownTimeoutMs);

    forceTimer.unref();
  };

  process.on('SIGTERM', () => handleTermination('SIGTERM'));
  process.on('SIGINT', () => handleTermination('SIGINT'));

  return server;
}

export { startGracefulServer };
export type { ServerConfig };
