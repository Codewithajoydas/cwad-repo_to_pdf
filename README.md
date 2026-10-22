# Professional React + TypeScript + Vite Template

A production-oriented React starter generated for the CWAD scaffolder.

## Stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Zod
- ESLint
- Prettier
- Vitest + Testing Library

## Architecture

The project follows a feature-oriented structure:

```text
src/
├── app/            # Application composition, providers and routing
├── assets/         # Static application assets
├── components/     # Shared reusable UI
├── config/         # Environment and application configuration
├── features/       # Feature/business modules
├── hooks/          # Shared React hooks
├── lib/            # Configured third-party clients/utilities
├── pages/          # Route-level pages
├── services/       # API/service layer
├── styles/         # Global styles
├── test/           # Test setup
├── types/          # Shared TypeScript types
├── App.tsx
└── main.tsx
```

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## Environment

Copy `.env.example` to `.env` and adjust values:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Design principle

This template intentionally avoids putting every possible library into every project. It includes the common application foundation; project-specific dependencies such as state managers, UI frameworks, authentication SDKs, database clients, analytics, payments, and deployment tooling should be added only when the generated project actually needs them.
