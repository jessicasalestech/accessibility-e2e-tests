[![Português](https://img.shields.io/badge/Portugu%C3%AAs-green?style=plastic&logo=openbadges&logoColor=white)](README-pt-BR.md) [![English](https://img.shields.io/badge/English-blue?style=plastic&logo=openbadges&logoColor=white)](README.md)

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white) ![axe-core](https://img.shields.io/badge/axe--core-5290EA?style=for-the-badge&logo=axe&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-35495e?style=for-the-badge&logo=accessibility&logoColor=white) ![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

# Testes E2E de Acessibilidade — axe-core + Playwright

**Testes automatizados de acessibilidade (a11y)** para aplicações web usando a combinação padrão da indústria [axe-core](https://www.deque.com/axe/) com [Playwright](https://playwright.dev/). A suíte executa um navegador real, verifica as páginas contra as regras **WCAG 2.1/2.2**, valida a navegação somente por teclado e gera um relatório HTML legível.

Este é um projeto de portfólio de QA de acessibilidade por **Jessica Sales**.

## O que é teste de acessibilidade?

O teste de acessibilidade verifica se um site é utilizável por pessoas com deficiência — incluindo usuários que dependem de um **leitor de tela** (VoiceOver, NVDA, TalkBack), operam a interface **somente pelo teclado**, ou precisam de **contraste de cores suficiente**. O teste automatizado (com axe-core) detecta rapidamente uma grande classe de falhas críticas e complementa o teste manual com tecnologia assistiva.

## O que este repositório demonstra

- **Escaneamentos automatizados com axe-core** — o Playwright controla o Chromium e executa o axe em cada página usando as tags de regras `wcag2a`, `wcag2aa` e `best-practice`.
- **Prova de passar / falhar** — uma página de demonstração **acessível** (`index.html`) em conformidade com WCAG 2.1 AA, e uma página de demonstração **inacessível** (`inaccessible.html`) com violações reais e verificáveis: falta de texto `alt`, campos sem rótulo, níveis de título pulados, botões sem nome e texto com baixo contraste.
- **Verificação de teclado e foco** — checagens via Tab garantindo que cada elemento interativo recebe foco, que o foco se move na ordem correta e que um **indicador de foco visível** é sempre exibido (sem "focus traps").
- **Gerador de relatório HTML + JSON** — um script independente que escaneia as páginas e escreve `report/a11y-report.html` e `report/a11y-scan.json`.
- **Pipeline de CI verde** — GitHub Actions executa a suíte em cada push / pull request e publica os relatórios como artefatos de build.

## Estrutura do projeto

```
.
├── public/
│   ├── index.html          # Página de demonstração acessível (WCAG 2.1 AA)
│   └── inaccessible.html   # Página intencionalmente quebrada (violações reais)
├── tests/
│   ├── a11y.accessible.spec.ts    # axe: zero serious/critical em index.html
│   ├── a11y.inaccessible.spec.ts  # axe: detecta as violações conhecidas
│   └── a11y.keyboard.spec.ts      # checagens de foco e foco visível somente por teclado
├── scripts/
│   └── generate-report.ts         # gerador de relatório HTML + JSON independente
├── .github/workflows/ci.yml       # CI: push/PR → teste → relatório → artefatos
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Requisitos

- Node.js 20+ (testado no Node 24)
- npm

## Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Instalar o navegador Chromium do Playwright
npx playwright install chromium

# 3. Executar a suíte completa de testes de acessibilidade
npm test

# 4. Gerar o relatório HTML + JSON
npm run report
```

### Resultado esperado dos testes

| Spec | Expectativa |
|------|-------------|
| `a11y.accessible.spec.ts` | `index.html` passa — **zero** violações serious/critical no axe |
| `a11y.inaccessible.spec.ts` | `inaccessible.html` **falha** — a suíte detecta as violações semeadas (`image-alt`, `label`, `button-name`, `heading-order`, `link-name`) |
| `a11y.keyboard.spec.ts` | todo elemento é alcançável via Tab com indicador de foco visível |

### Saída do relatório

Após `npm run report`:

- `report/a11y-report.html` — tabela legível das violações por página (id da regra, impacto, nós afetados, resumo do motivo da falha).
- `report/a11y-scan.json` — resultados legíveis por máquina para dashboards de CI ou análise posterior.

## Referências WCAG

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) e [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — Diretrizes de Acessibilidade para Conteúdo Web.
- [axe-core](https://github.com/dequelabs/axe-core) — o motor de regras de acessibilidade.
- [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) — a integração com o Playwright.

## O que isso demonstra

Como engenheira de QA, este projeto mostra habilidade prática em **automação de acessibilidade**: configurar o axe com os conjuntos de regras certos, escrever asserções que falham de forma realista quando a página está quebrada, verificar semântica de teclado que escaneamentos automáticos sozinhos não conseguem provar, gerar artefatos de build para as partes interessadas e conectar tudo a um pipeline de CI verde. Isso complementa a experiência de teste com leitores de tela como **VoiceOver** e **TalkBack**.

## Licença

MIT.