import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility scan of the DEMO BAD PAGE (`inaccessible.html`).
 *
 * The page is intentionally broken so that we can prove the automation
 * actually DETECTS real violations. We assert that specific, well-known
 * axe rule IDs are present and that the report reaches `serious` impact —
 * this demonstrates that the tooling is not a no-op.
 */
const EXPECTED_VIOLATIONS = [
  'image-alt',      // image without alternate text
  'label',          // form field without a <label>
  'button-name',    // button with no accessible name
  'heading-order',  // heading levels skipped (h1 -> h3)
  'link-name'       // link with no accessible text
];

test('inaccessible page triggers known WCAG violations', async ({ page }) => {
  await page.goto('/inaccessible.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    .analyze();

  const violationIds = results.violations.map((v) => v.id);

  for (const id of EXPECTED_VIOLATIONS) {
    expect(
      violationIds,
      `Expected axe rule '${id}' to be among the detected violations. Found: [${violationIds.join(', ')}]`
    ).toContain(id);
  }
});

test('inaccessible page reports at least serious impact', async ({ page }) => {
  await page.goto('/inaccessible.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    .analyze();

  const impacts = new Set(
    results.violations
      .map((v) => v.impact)
      .filter((i) => i !== undefined && i !== null)
  );

  expect(impacts.has('serious') || impacts.has('critical'),
    `Expected a serious/critical violation. Impacts found: [${[...impacts].join(', ')}]`
  ).toBe(true);
});