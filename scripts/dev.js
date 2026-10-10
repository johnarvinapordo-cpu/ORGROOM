import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import process from 'node:process';
import { createServer } from 'vite';

const ROOT = process.cwd();
const BACKEND_PORT = Number(process.env.AUTH_PORT || 3001);
const FRONTEND_PORT = Number(process.env.VITE_PORT || 5173);

function getLanIPv4() {
  const interfaces = networkInterfaces();
  const preferred = [];
  const fallback = [];
  const virtualPattern = /(virtual|vmware|virtualbox|hyper-v|vEthernet|wsl|docker|loopback|bluetooth|tailscale|zerotier|vpn|wireguard)/i;

  for (const [name, entries] of Object.entries(interfaces)) {
    for (const info of entries || []) {
      if (info.family !== 'IPv4' || info.internal || info.address.startsWith('127.')) continue;
      const item = { name, address: info.address };
      const isPrivate = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(info.address);
      if (isPrivate && !virtualPattern.test(name)) preferred.push(item);
      else if (isPrivate) fallback.push(item);
    }
  }
  return (preferred[0] || fallback[0] || null)?.address || null;
}

function printBanner(port, lanIP, backendStarted) {
  const line = '='.repeat(58);
  console.log(`\n${line}`);
  console.log('              ORGROOM — DEVELOPMENT SERVER');
  console.log(line);
  console.log('');
  console.log('Frontend:');
  console.log(`  PC / Local:       http://localhost:${port}`);
  if (lanIP) console.log(`  Phone / Network:  http://${lanIP}:${port}`);
  else console.log('  Phone / Network:  LAN IPv4 address could not be detected.');
  console.log('');
  console.log(`Backend:            ${backendStarted ? `Running on port ${BACKEND_PORT}` : 'STARTUP FAILED'}`);
  console.log(`Status:             ${backendStarted ? 'ORGROOM is ready' : 'Check the backend output above.'}`);
  console.log('');
  if (lanIP) {
    console.log('Phone access requires the phone and PC to be on the same reachable Wi-Fi/LAN.');
  } else {
    console.log('If you are on Wi-Fi/Ethernet, check the active network adapter and Windows Firewall.');
  }
  console.log(line + '\n');
}

let backend;
let vite;
let shuttingDown = false;

async function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;
  try { if (vite) await vite.close(); } catch {}
  if (backend && !backend.killed) backend.kill(signal);
}

for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => shutdown(signal).finally(() => process.exit(0)));

try {
  backend = spawn(process.execPath, ['server/auth-server.js'], {
    cwd: ROOT,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env
  });
  backend.stdout.on('data', chunk => process.stdout.write(`[BACKEND] ${chunk}`));
  backend.stderr.on('data', chunk => process.stderr.write(`[BACKEND] ${chunk}`));

  const backendExited = new Promise((resolve) => {
    backend.once('exit', (code, signal) => resolve({ code, signal }));
  });

  vite = await createServer({
    root: ROOT,
    configFile: `${ROOT}/vite.config.js`,
    server: {
      host: '0.0.0.0',
      port: FRONTEND_PORT,
      strictPort: false,
      open: false
    }
  });

  await vite.listen();
  const address = vite.httpServer?.address();
  const actualPort = typeof address === 'object' && address ? address.port : FRONTEND_PORT;
  const lanIP = getLanIPv4();
  const backendState = await Promise.race([
    new Promise(resolve => setTimeout(() => resolve(true), 900)),
    backendExited.then(() => false)
  ]);

  printBanner(actualPort, lanIP, backendState);

  if (backendState) {
    try { await vite.openBrowser(); } catch {}
  }

  backendExited.then(async ({ code, signal }) => {
    if (shuttingDown) return;
    console.error(`\n[BACKEND] Backend stopped${signal ? ` (${signal})` : ''}${code !== null ? ` with exit code ${code}` : ''}.`);
    await shutdown();
    process.exit(code || 1);
  });
} catch (error) {
  console.error('\n[ORGROOM] Startup failed.');
  console.error(error?.message || error);
  await shutdown();
  process.exit(1);
}
