# Repository Guidelines

## Project Structure & Module Organization
- `src/app` hosts Next.js route segments (auth flows, role dashboards) and loads shared providers.
- `src/components`, `src/utils`, and `src/hooks` centralize reusable UI, helpers, and stateful logic.
- `src/services`, `src/contexts`, and `src/database` manage Firebase adapters, cross-cutting state, and SQL schemas.
- `public` serves static assets; `docs` stores reference guides such as LOADING_SYSTEM.md.
- Root configs (`next.config.js`, `tailwind.config.js`, `firebase.json`) govern builds and deployments.

## Build, Test, and Development Commands
- `npm run dev` launches the Next.js dev server with hot reload and mock Firebase integration.
- `npm run build` compiles a production bundle and validates app/router layouts.
- `npm run start` boots the compiled bundle locally to mirror Vercel.
- `npm run lint` runs ESLint with Next.js rules; resolve warnings before submitting a PR.
- `npm run type-check` executes TypeScript in no-emit mode to catch regressions early.

## Coding Style & Naming Conventions
- Use TypeScript end-to-end; prefer typed React function components and colocated hooks.
- Keep indentation at two spaces and favor Tailwind utilities before reaching for custom CSS.
- Group files by feature under route segments; components in PascalCase, hooks prefixed with useCamelCase, utilities in camelCase, and import through `@/` aliases to avoid ../../ chains.

## Testing Guidelines
- UI showcases live in `src/test`; extend with Playwright or React Testing Library suites as flows stabilize.
- Name specs after their target feature (e.g., `dashboard.spec.ts`) and cover loading, empty, and error states.
- Keep `npm run lint` and `npm run type-check` green before marking test work complete to align with CI.

## Commit & Pull Request Guidelines
- Write imperative, scoped commits (example: `fix: adjust mechanic filter`) and avoid one-word messages.
- Reference related issues or tickets in the body and squash noisy WIP commits before pushing.
- PRs should explain intent, link tracking tickets, note environment or schema changes, and attach UI captures when relevant.
- Confirm `npm run lint` and `npm run type-check` succeed locally before requesting review.

## Environment & Secrets
- Store runtime values in `.env.local`; never commit credentials.
- Rotate Firebase service accounts using secure storage and document new keys in README updates.
