const http = require('node:http');

const serviceName = process.env.SERVICE_NAME || 'backend-service';
const port = Number(process.env.PORT || 3000);
let requests = 0;
let startedAt = Date.now();

function sendJson(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

function sendMetrics(response) {
  const uptime = Math.floor((Date.now() - startedAt) / 1000);
  const payload = [
    '# HELP service_requests_total Total HTTP requests handled by the service.',
    '# TYPE service_requests_total counter',
    `service_requests_total{service="${serviceName}"} ${requests}`,
    '# HELP service_uptime_seconds Service uptime in seconds.',
    '# TYPE service_uptime_seconds gauge',
    `service_uptime_seconds{service="${serviceName}"} ${uptime}`,
    '',
  ].join('\n');

  response.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
  response.end(payload);
}

const server = http.createServer((request, response) => {
  requests += 1;
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok', service: serviceName });
    return;
  }

  if (url.pathname === '/metrics') {
    sendMetrics(response);
    return;
  }

  sendJson(response, 200, {
    service: serviceName,
    status: 'ready',
    message: 'Service transport is ready for feature implementation.',
    path: url.pathname,
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`${serviceName} listening on port ${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
