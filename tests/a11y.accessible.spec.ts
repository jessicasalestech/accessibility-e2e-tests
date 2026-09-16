import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility scan of the DEMO PAGE (`index.html`) which is built to comply
 * with WCAG 2.1 AA.
 *
 * We fail the build if axe reports any violation with an impact of
 * `critical` or `serious` for the WCAG 2 A, WCAG 2 AA, and best-practice
 * rule categories. Minor/moderate wins the team consciously accepts may be
 * surfaced without blocking the pipeline.
 */
const BLOCKING_IMPACT = ['critical', 'serious'];

test('accessible page has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/index.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    .analyze();

  expect(results.violations).toBeDefined();

  const blocking = results.violations.filter((v) => BLOCKING_IMPACT.includes(v.impact ?? ''));

  const summary = blocking.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.length
  }));
  expect(summary, `Expected zero serious/critical violations. Got:\n${JSON.stringify(summary, null, 2)}`)
    .toEqual([]);
});