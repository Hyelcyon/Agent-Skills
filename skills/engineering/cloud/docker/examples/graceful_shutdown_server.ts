import http from 'node:http';

interface ServerConfig {
  port: number;
  shutdownTimeoutMs: number;
}

function startGracefulServer(config: ServerConfig): http.Server {
  const server = http.createServer((req, res) => {
    if (req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Operational');
  });

  server.listen(config.port);

  let isShuttingDown = false;

  const handleTermination = (signal: string) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    server.close(() => {
      process.exit(0);
    });

    const forceTimer = setTimeout(() => {
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
