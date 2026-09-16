/**
 * Report generator — scans the demo pages and writes a human-readable
 * HTML + JSON accessibility report.
 *
 * Fully standalone: it launches its own Chromium via Playwright, runs an
 * axe-core scan on both demo pages, and writes:
 *   - report/a11y-scan.json   (raw machine-readable results)
 *   - report/a11y-report.html (human-readable summary)
 *
 * Requires the Playwright Chromium browser to be installed
 * (`npx playwright install chromium`).
 */

import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

interface AxeNode {
  target: unknown[];
  html: string;
  impact?: string | null;
  failureSummary?: string;
}

interface AxeViolation {
  id: string;
  impact?: string | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

interface PageResult {
  url: string;
  file: string;
  violations: AxeViolation[];
}

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const REPORT_DIR = path.join(ROOT, 'report');
const JSON_OUT = path.join(REPORT_DIR, 'a11y-scan.json');
const HTML_OUT = path.join(REPORT_DIR, 'a11y-report.html');

const PAGES: Array<{ name: string; file: string }> = [
  { name: 'index.html', file: 'index.html' },
  { name: 'inaccessible.html', file: 'inaccessible.html' }
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function impactClass(impact?: string | null): string {
  return ['critical', 'serious', 'moderate', 'minor'].includes(impact ?? '') ? impact! : 'minor';
}

const IMPACT_ORDER = ['minor', 'moderate', 'serious', 'critical'];

function worstImpact(violations: AxeViolation[]): string | undefined {
  return violations.reduce<string | undefined>((acc, v) => {
    const cur = v.impact ?? 'minor';
    if (!acc) return cur;
    return IMPACT_ORDER.indexOf(cur) > IMPACT_ORDER.indexOf(acc) ? cur : acc;
  }, undefined);
}

function renderHtml(pages: PageResult[]): string {
  const rows = pages
    .map((p) => {
      const count = p.violations.reduce((n, v) => n + v.nodes.length, 0);
      const worst = worstImpact(p.violations);
      const ok = count === 0;
      return `<tr>
        <td><code>${escapeHtml(p.file)}</code></td>
        <td>${count}</td>
        <td><span class="pill ${impactClass(ok ? undefined : worst)}">${ok ? '—' : worst}</span></td>
        <td class="${ok ? 'clear' : ''}">${ok ? '✓ PASS' : '✗ FAIL'}</td>
      </tr>`;
    })
    .join('');

  const details = pages
    .map((p) => {
      const cards = p.violations.map(
        (v) => `
        <div class="page">
          <h3><code>${escapeHtml(v.id)}</code> <span class="pill ${impactClass(v.impact)}">${escapeHtml(v.impact ?? 'minor')}</span></h3>
          <p>${escapeHtml(v.help)}</p>
          <p><a href="${escapeHtml(v.helpUrl)}">Rule reference</a> · Tags: ${v.tags.map(escapeHtml).join(', ')}</p>
          <p>${escapeHtml(v.description)}</p>
          <table>
            <thead><tr><th>Target</th><th>HTML</th><th>Impact</th><th>Why it fails</th></tr></thead>
            <tbody>
              ${v.nodes
                .map(
                  (n) => `<tr>
                  <td><code>${escapeHtml(n.target.join(' '))}</code></td>
                  <td><code>${escapeHtml(n.html)}</code></td>
                  <td>${escapeHtml(n.impact ?? v.impact ?? 'minor')}</td>
                  <td>${escapeHtml(n.failureSummary ?? '—')}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`
      );
      const count = p.violations.reduce((n, v) => n + v.nodes.length, 0);
      const cardBlock = cards.length ? cards.join('') : '<p class="clear">✓ No violations.</p>';
      return `<section class="page"><h2>${escapeHtml(p.file)} — ${count} violation(s)</h2>${cardBlock}</section>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report — axe-core + Playwright</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }
    h1 { border-bottom: 2px solid #0b5bd3; padding-bottom: 0.5rem; }
    .page { background: #f7f7f7; border: 1px solid #ddd; border-radius: 6px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
    .page h2 { margin-top: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; vertical-align: top; }
    th { background: #eef; }
    .pill { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.8rem; }
    .critical { background: #c62828; color: #fff; }
    .serious { background: #e65100; color: #fff; }
    .moderate { background: #f9a825; color: #1a1a1a; }
    .minor { background: #9e9e9e; color: #fff; }
    code { background: #eee; padding: 0.1rem 0.4rem; border-radius: 3px; }
    .clear { color: #2e7d32; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Accessibility Report — axe-core + Playwright</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <h2>Summary</h2>
  <table>
    <thead><tr><th>Page</th><th>Violation nodes</th><th>Highest impact</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <h2>Details</h2>
  ${details}
</body>
</html>`;
}

async function scanPage(_browserPath: string, file: string): Promise<PageResult> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const fileUrl = 'file:///' + path.resolve(PUBLIC, file).replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    return {
      url: fileUrl,
      file,
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        tags: v.tags,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          html: n.html,
          impact: n.impact,
          failureSummary: n.failureSummary
        }))
      }))
    };
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  mkdirSync(REPORT_DIR, { recursive: true });
  console.log(`[report] Launching Chromium to scan ${PAGES.length} page(s)…`);

  const pages: PageResult[] = [];
  for (const p of PAGES) {
    const result = await scanPage(process.argv[2] ?? '', p.file);
    const nodeCount = result.violations.reduce((n, v) => n + v.nodes.length, 0);
    console.log(`[report] ${p.file}: ${result.violations.length} rule(s), ${nodeCount} violation node(s)`);
    pages.push(result);
  }

  writeFileSync(JSON_OUT, JSON.stringify({ generated: new Date().toISOString(), pages }, null, 2), 'utf8');
  writeFileSync(HTML_OUT, renderHtml(pages), 'utf8');

  const total = pages.reduce((n, p) => n + p.violations.reduce((x, v) => x + v.nodes.length, 0), 0);
  console.log(`[report] JSON written: ${JSON_OUT}`);
  console.log(`[report] HTML written: ${HTML_OUT}`);
  console.log(`[report] Total violation nodes across pages: ${total}`);
  console.log(`[report] Done.`);
}

main().catch((err) => {
  console.error('[report] Failed:', err);
  process.exitCode = 1;
});