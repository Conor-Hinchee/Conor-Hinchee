# Conor-Hinchee

Personal site built with Vite, Tailwind and TypeScript. The default branch is `2026`.

## Verification

Run these without prompts or servers that stay open:

- `npm run build` type-checks and builds the site.
- `npx playwright test --reporter=line` runs the end-to-end tests. The default HTML reporter keeps serving its report after a failure, so the command never exits.
- If Playwright reports a missing browser, run `npx playwright install` first. The tests run in Chromium, Firefox and WebKit.
