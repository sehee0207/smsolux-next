#!/usr/bin/env node
/**
 * UI 회귀 검증 — 손으로 확인하던 항목을 자동으로 돌린다.
 *
 *   node scripts/verify-ui.mjs [--base-url http://localhost:3000] [--update]
 *
 * 각 페이지를 모바일·태블릿·데스크톱 뷰포트로 열어 다음을 확인한다.
 *
 *   1. 가로 스크롤     문서가 뷰포트보다 넓어지면 실패. 모바일에서 줄바꿈이
 *                      깨지거나 고정 폭 요소가 삐져나오면 여기서 잡힌다.
 *   2. 넘치는 요소     뷰포트보다 넓은 개별 요소를 이름과 함께 보고한다.
 *   3. 콘솔 에러       로드 중 발생한 에러와 페이지 예외를 수집한다.
 *   4. 빈 화면         본문 텍스트가 거의 없으면 데이터 조회 실패로 본다.
 *
 * 스크린샷은 .ui-snapshots/ 에 남는다. 눈으로 볼 때 쓴다.
 *
 * 의존성 없이 Chrome DevTools Protocol을 직접 쓴다. Node 22의 전역
 * WebSocket을 사용하므로 puppeteer를 설치하지 않는다.
 */

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROUTES = ['/', '/activity', '/project', '/recruit'];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, scale: 2, mobile: true },
  { name: 'tablet', width: 768, height: 1024, scale: 2, mobile: true },
  { name: 'desktop', width: 1440, height: 900, scale: 1, mobile: false },
];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

const SNAPSHOT_DIR = '.ui-snapshots';
const args = process.argv.slice(2);
const baseUrl = readFlag('--base-url') ?? 'http://localhost:3000';
const port = 9222 + (process.pid % 500);

function readFlag(name) {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
}

function findChrome() {
  for (const c of CHROME_CANDIDATES) if (c && existsSync(c)) return c;
  throw new Error('Chrome을 찾지 못했습니다. CHROME_PATH 환경변수를 지정하세요.');
}

async function waitFor(fn, { timeout = 60_000, interval = 300, label }) {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {
      /* 아직 안 뜬 상태 */
    }
    if (Date.now() > deadline) throw new Error(`${label} 대기 시간 초과`);
    await new Promise((r) => setTimeout(r, interval));
  }
}

/** 최소 CDP 클라이언트. id로 요청과 응답을 잇고, 이벤트는 리스너로 흘린다. */
class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== undefined) {
        const slot = this.pending.get(msg.id);
        if (!slot) return;
        this.pending.delete(msg.id);
        if (msg.error) slot.reject(new Error(msg.error.message));
        else slot.resolve(msg.result);
      } else {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`${method} 응답 없음`));
      }, 30_000);
    });
  }

  on(fn) {
    this.listeners.push(fn);
  }
}

// 페이지 안에서 실행되는 검사. 문자열로 넘긴다.
const PROBE = `(() => {
  const de = document.documentElement;
  const limit = de.clientWidth;
  const wide = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.height <= 0 && r.width <= 0) continue;
    if (r.width > limit + 1 || r.right > limit + 1) {
      const cls = typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\\s+/)[0] : '';
      const name = el.tagName.toLowerCase() + cls;
      if (!wide.includes(name)) wide.push(name);
    }
  }
  return JSON.stringify({
    overflowX: Math.round(de.scrollWidth - limit),
    wide: wide.slice(0, 6),
    textLength: (document.body.innerText || '').trim().length,
    title: document.title,
  });
})()`;

async function main() {
  const chrome = findChrome();
  console.log(`대상   ${baseUrl}`);
  console.log(`브라우저 ${chrome}`);

  await waitFor(() => fetch(baseUrl).then((r) => r.status < 500), {
    label: `${baseUrl} 응답`,
  });

  await rm(SNAPSHOT_DIR, { recursive: true, force: true });
  await mkdir(SNAPSHOT_DIR, { recursive: true });

  // 프로필은 절대 경로의 임시 폴더에 둔다. 저장소 안 상대 경로를 쓰면
  // 스냅샷 정리와 Chrome의 프로필 생성이 겹쳐 기동이 불안정하다.
  const profileDir = await mkdtemp(path.join(os.tmpdir(), 'solux-ui-'));

  const proc = spawn(chrome, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  const failures = [];
  let ws;
  try {
    const target = await waitFor(async () => {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      // 새 헤드리스는 최초 about:blank 탭을 type "other"로 내려준다. 둘 다 받는다.
      return list.find(
        (t) => t.webSocketDebuggerUrl && (t.type === 'page' || t.type === 'other'),
      );
    }, { label: 'Chrome 디버깅 포트' });

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error('CDP 연결 실패')), { once: true });
    });

    const cdp = new Session(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    let consoleErrors = [];
    cdp.on((msg) => {
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text ?? '예외 발생');
      }
    });

    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        consoleErrors = [];
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: vp.scale,
          mobile: vp.mobile,
        });

        const loaded = new Promise((resolve) => {
          const off = (msg) => {
            if (msg.method === 'Page.loadEventFired') resolve();
          };
          cdp.on(off);
        });
        await cdp.send('Page.navigate', { url: new URL(route, baseUrl).href });
        await Promise.race([loaded, new Promise((r) => setTimeout(r, 20_000))]);
        await new Promise((r) => setTimeout(r, 900)); // 폰트·이미지 안정화

        const { result } = await cdp.send('Runtime.evaluate', {
          expression: PROBE,
          returnByValue: true,
        });
        const report = JSON.parse(result.value);

        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const file = path.join(
          SNAPSHOT_DIR,
          `${route === '/' ? 'home' : route.replace(/\//g, '')}-${vp.name}.png`,
        );
        await writeFile(file, Buffer.from(shot.data, 'base64'));

        const where = `${route} @ ${vp.name}(${vp.width}px)`;
        const problems = [];
        if (report.overflowX > 1) {
          problems.push(
            `가로로 ${report.overflowX}px 넘침` +
            (report.wide.length ? ` — ${report.wide.join(', ')}` : ''),
          );
        }
        if (report.textLength < 40) problems.push(`본문이 비어 있음(${report.textLength}자)`);
        if (consoleErrors.length) problems.push(`콘솔 에러 ${consoleErrors.length}건: ${consoleErrors[0].slice(0, 120)}`);

        if (problems.length) {
          failures.push(`${where}\n      ${problems.join('\n      ')}`);
          console.log(`FAIL  ${where}`);
          for (const p of problems) console.log(`      ${p}`);
        } else {
          console.log(`OK    ${where}  ${report.textLength}자`);
        }
      }
    }
  } finally {
    try { ws?.close(); } catch { /* 이미 닫힘 */ }
    proc.kill();
    await rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }

  console.log('-'.repeat(64));
  console.log(`스크린샷  ${SNAPSHOT_DIR}/`);
  if (failures.length) {
    console.log(`RESULT  실패 ${failures.length}건`);
    process.exit(1);
  }
  console.log(`RESULT  통과 — ${ROUTES.length * VIEWPORTS.length}개 조합`);
}

main().catch((err) => {
  console.error(`RESULT  실행 실패 — ${err.message}`);
  process.exit(1);
});
