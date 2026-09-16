[![English](https://img.shields.io/badge/English-blue?style=plastic&logo=openbadges&logoColor=white)](README.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-green?style=plastic&logo=openbadges&logoColor=white)](README-pt-BR.md)

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white) ![axe-core](https://img.shields.io/badge/axe--core-5290EA?style=for-the-badge&logo=axe&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-35495e?style=for-the-badge&logo=accessibility&logoColor=white) ![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

# Accessibility E2E Tests — axe-core + Playwright

Automated **accessibility (a11y) testing** for web applications using the industry-standard combination of [axe-core](https://www.deque.com/axe/) and [Playwright](https://playwright.dev/). The suite runs a real browser, scans pages against **WCAG 2.1/2.2** rules, verifies keyboard-only navigation, and produces a human-readable HTML report.

This is a practical accessibility QA portfolio project by **Jessica Sales**.

## What is accessibility testing?

Accessibility testing verifies that a website is usable by people with disabilities — including users who rely on a **screen reader** (VoiceOver, NVDA, TalkBack), operate the interface **keyboard-only**, or need **sufficient colour contrast**. Automated testing (with axe-core) catches a large class of hard failures quickly, and complements manual testing with assistive technology.

## What this repository demonstrates

- **Automated axe-core scans** — Playwright drives Chromium and runs axe against each page using the `wcag2a`, `wcag2aa`, and `best-practice` rule tags.
- **Pass / fail proof** — an **accessible** demo page (`index.html`) that complies with WCAG 2.1 AA, and an **inaccessible** demo page (`inaccessible.html`) with real, verifiable violations: missing `alt` text, unlabelled inputs, skipped heading levels, buttons with no name, and low-contrast text.
- **Keyboard & focus verification** — Tab-driven checks that every interactive element receives focus, that focus moves in the correct order, and that a **visible focus indicator** is always shown (no focus traps).
- **HTML + JSON report generator** — a standalone script that scans the pages and writes `report/a11y-report.html` and `report/a11y-scan.json`.
- **Green CI pipeline** — GitHub Actions runs the suite on every push / pull request and uploads the reports as build artifacts.

## Project structure

```
.
├── public/
│   ├── index.html          # Accessible demo page (WCAG 2.1 AA compliant)
│   └── inaccessible.html   # Intentionally broken page (real violations)
├── tests/
│   ├── a11y.accessible.spec.ts    # axe scan: zero serious/critical on index.html
│   ├── a11y.inaccessible.spec.ts  # axe scan: detects the known violations
│   └── a11y.keyboard.spec.ts      # keyboard-only focus & focus-visibility checks
├── scripts/
│   └── generate-report.ts         # standalone HTML + JSON report generator
├── .github/workflows/ci.yml       # CI: push/PR → test → report → artifacts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Requirements

- Node.js 20+ (tested on Node 24)
- npm

## How to run

```bash
# 1. Install dependencies
npm install

# 2. Install the Playwright Chromium browser
npx playwright install chromium

# 3. Run the full accessibility test suite
npm test

# 4. Generate the HTML + JSON report
npm run report
```

### Expected test outcome

| Spec | Expectation |
|------|-------------|
| `a11y.accessible.spec.ts` | `index.html` passes — **zero** serious/critical axe violations |
| `a11y.inaccessible.spec.ts` | `inaccessible.html` **fails** — the suite detects the seeded violations (`image-alt`, `label`, `button-name`, `heading-order`, `link-name`) |
| `a11y.keyboard.spec.ts` | every element is reachable by Tab with a visible focus indicator |

### Report output

After `npm run report`:

- `report/a11y-report.html` — human-readable table of violations per page (rule id, impact, affected nodes, failure summary).
- `report/a11y-scan.json` — machine-readable results for CI dashboards or further analysis.

## WCAG references

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — Web Content Accessibility Guidelines.
- [axe-core](https://github.com/dequelabs/axe-core) — the accessibility rule engine.
- [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) — the Playwright integration.

## What this demonstrates

As a QA engineer, this project shows hands-on skill with **accessibility automation**: configuring axe with the right rule sets, writing assertions that fail realistically when a page is broken, verifying keyboard semantics that automated scans alone cannot prove, generating build artifacts for stakeholders, and wiring all of it into a green CI pipeline. This complements screen-reader testing experience with **VoiceOver** and **TalkBack**.

## License

MIT.