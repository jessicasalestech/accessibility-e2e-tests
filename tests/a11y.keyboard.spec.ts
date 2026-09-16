import { expect, test, type Page } from '@playwright/test';

/**
 * Keyboard accessibility checks on the demo page (`index.html`).
 *
 * A screen-reader / keyboard-only user must be able to reach every
 * interactive element with the Tab key, in a sensible order, with no
 * focus trap, and with a visible focus indicator on every focused element.
 *
 * Note on radio groups: browsers expose only the *first* (or checked)
 * radio of a group to the Tab order; the others are reached with the arrow
 * keys. So we walk the real browser Tab order rather than assuming every
 * DOM-matching element is independently Tab-reachable.
 */

interface FocusInfo {
  tag: string;
  id: string | null;
  text: string | null;
  inDom: boolean;
  outlineStyle: string;
  outlineWidth: string;
}

async function currentFocus(page: Page): Promise<FocusInfo | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      text: (el.textContent || '').trim().slice(0, 30) || el.getAttribute('aria-label') || null,
      inDom: document.body.contains(el),
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth
    };
  });
}

test('Tab reaches every interactive element in order with visible focus', async ({ page }) => {
  await page.goto('/index.html');

  // Blur everything so the next Tab lands on the first element in the page.
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur?.());

  const sequence: FocusInfo[] = [];
  let guard = 0;
  const MAX_TABS = 60;

  while (guard < MAX_TABS) {
    guard++;
    await page.keyboard.press('Tab');
    const f = await currentFocus(page);
    // Focus returned to body -> we cycled back to the start (no focus trap).
    if (!f) break;
    sequence.push(f);
  }

  expect(sequence.length, 'Expected at least one focusable, keyboard-reachable element').toBeGreaterThan(0);

  // The sequence must contain all key interactive controls (happy path proof
  // that nothing is skipped), in the order they appear.
  const expected = [
    { tag: 'a', text: 'Skip to main content' },
    { tag: 'a', text: 'Home' },
    { tag: 'a', text: 'Menu' },
    { tag: 'a', text: 'Contact' },
    { tag: 'input', id: 'email-opt' },
    { tag: 'input', id: 'name' },
    { tag: 'input', id: 'email' },
    { tag: 'select', id: 'newsletter' },
    { tag: 'textarea', id: 'message' },
    { tag: 'button', text: 'Send message' }
  ];

  for (let i = 0; i < expected.length; i++) {
    const exp = expected[i];
    const got = sequence[i];
    expect(got, `Sequence ended before reaching expected #${i} (${exp.tag} ${exp.id ?? exp.text})`)
      .toBeDefined();
    expect(got.tag, `Expected step #${i} to be <${exp.tag}> but got <${got.tag}>`).toBe(exp.tag);
    if (exp.id) expect(got.id).toBe(exp.id);
  }

  // No duplicate focus targets -> each element visited exactly once in the pass
  // (prevents an infinite/short-circuited cycle masking a focus trap).
  const keys = sequence.map((f) => `${f.tag}:${f.id ?? f.text}`);
  expect(new Set(keys).size, 'Tab order contained repeated elements').toBe(keys.length);

  // Every focused element must show a visible focus indicator.
  for (let i = 0; i < sequence.length; i++) {
    const f = sequence[i];
    expect(f.inDom, `Step #${i} focused element must be attached to the DOM`).toBe(true);
    expect(f.outlineStyle, `Step #${i} (<${f.tag}>) has no visible focus outline`).not.toBe('none');
  }
});