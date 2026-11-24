# Enterprise Frontend Architecture & Folder Structure Standard

A production-grade architectural specification for structuring modern frontend applications (React, Next.js, Vite), synthesized from standards established by senior engineering teams at Meta, Google, and Stripe, and the Bulletproof React methodology.

---

## 1. Architectural Philosophy: Feature-Driven Colocation

Traditional frontend codebases organize files by technical type:
- `src/components/` (containing hundreds of unrelated component files)
- `src/hooks/`
- `src/services/`
- `src/types/`

### The Technical Grouping Failure Mode
As applications grow beyond 10,000 lines of code, technical grouping causes:
1. **High Cognitive Context Switching**: Modifying a single user flow (e.g., checkout) requires opening 7 folders scattered across the repository.
2. **Hidden Coupling & Phantom Dependencies**: Deleting or refactoring a component leaves orphaned hooks, types, and CSS classes because ownership is ambiguous.
3. **Circular Dependencies**: When components import generic services that import other components' types.

### The Big Tech Consensus: Feature-Driven Colocation
Code that changes together must live together. A feature represents an autonomous business capability (e.g., `auth`, `billing`, `comments`, `dashboard`). All assets, types, hooks, API queries, and UI components dedicated to that capability are colocated in a single directory.

---

## 2. Standard Enterprise `src/` Directory Anatomy

```text
src/
├── app/                        # Application bootstrap, routing & providers
│   ├── (routes)/               # Route segments (Next.js App Router or router tree)
│   ├── providers/              # Global context providers (React Query, Theme, Auth)
│   └── globals.css             # Design tokens and base styles
│
├── features/                   # Self-contained business domain modules
│   ├── auth/                   # Authentication feature module
│   │   ├── api/                # API calls, mutations, query options
│   │   ├── components/         # Feature-specific UI components
│   │   ├── hooks/              # Feature-specific custom hooks
│   │   ├── model/              # Domain schemas, Zod validators, stores, types
│   │   └── index.ts            # Public API barrel (strictly exports public contract)
│   │
│   ├── billing/                # Subscriptions, invoices, payment methods
│   └── notifications/          # In-app notifications and alerts
│
├── components/                 # Domain-agnostic design system primitives
│   └── ui/                     # Pure presentational UI atoms (Button, Modal, Input)
│       ├── button.tsx
│       ├── dialog.tsx
│       └── input.tsx
│
├── lib/                        # Third-party library configuration and wrappers
│   ├── api-client.ts           # Configured Axios / fetch instance with interceptors
│   ├── query-client.ts         # TanStack Query client with global defaults
│   └── logger.ts               # Client-side telemetry and logging wrapper
│
├── shared/                     # Truly global cross-cutting helpers
│   ├── constants/              # Global constants and route definitions
│   ├── types/                  # Global primitive types (Pagination, Result, Nullable)
│   └── utils/                  # Pure utility functions (formatting, validation helpers)
│
└── config/                     # Environment variable parsers and application constants
    └── env.ts                  # Strictly validated process.env via Zod
```

---

## 3. Anatomy of a Feature Module (`src/features/<feature>/`)

```text
src/features/billing/
├── api/
│   ├── get-invoices.ts         # Query function + queryOptions factory
│   └── update-payment.ts       # Mutation function + mutationOptions
├── components/
│   ├── invoice-table.tsx       # Domain-aware table component
│   ├── payment-card.tsx        # Payment method view component
│   └── plan-selector.tsx       # Plan radio group with pricing logic
├── hooks/
│   └── use-invoice-filter.ts   # Filter state hook specific to invoice table
├── model/
│   ├── billing.schema.ts       # Zod schemas for invoices, payment forms
│   ├── billing.store.ts        # Client state store (Zustand) if needed
│   └── billing.types.ts        # Inferred TypeScript types from schemas
└── index.ts                    # Public API (Controlled export surface)
```

---

## 4. Strict Dependency & Import Flow Rules

To preserve clean architecture and prevent spaghetti coupling, enforce these directional invariants:

```
[ app/ ] ─────────────────────────┐
    │                             │
    ▼                             ▼
[ features/ ] ──────────────► [ components/ui/ ]
    │                             │
    ▼                             ▼
[ lib/ ] ───────────────────► [ shared/ ]
```

### Invariant 1: Unidirectional Layering
- `app/` may import from `features/`, `components/ui/`, `lib/`, and `shared/`.
- `features/` may import from `components/ui/`, `lib/`, and `shared/`.
- `components/ui/` may NEVER import from `features/` or `app/`. UI components must be 100% domain-agnostic.
- `shared/` and `lib/` must never import from `features/`, `components/`, or `app/`.

### Invariant 2: Feature-to-Feature Boundary via Public API (`index.ts`)
- Features must remain isolated. When `features/billing` requires user authentication state from `features/auth`:
  - ✅ **ALLOWED**: `import { useAuthSession } from '@/features/auth';`
  - ❌ **FORBIDDEN**: `import { useAuthSession } from '@/features/auth/hooks/use-auth-session';`
- Deep imports bypass the public interface contract and tightly couple internal folder structures.

### Invariant 3: Colocation Promotion Threshold (The Rule of Three)
- Do not place a component in global `src/components/ui/` prematurely.
- If a component is used only within `features/billing`, place it inside `src/features/billing/components/`.
- Only promote a component to `src/components/ui/` when three distinct features genuinely require the exact same UI presentation.

---

## 5. Agent File Generation & Naming Standards

When an autonomous AI agent is prompted to add, modify, or refactor a frontend capability, it must follow this deterministic procedure:

### Decision Tree for Placement
1. **Is the asset tied to a specific business capability?**
   - YES ➔ Place inside `src/features/<feature>/<subfolder>/`.
   - NO ➔ Proceed to Step 2.
2. **Is it a visual, domain-agnostic primitive component?**
   - YES ➔ Place inside `src/components/ui/`.
   - NO ➔ Proceed to Step 3.
3. **Is it a wrapper around an external third-party SDK/library?**
   - YES ➔ Place inside `src/lib/`.
   - NO ➔ Place inside `src/shared/utils/` or `src/shared/types/`.

### File Creation Pipeline (Order of Implementation)
```
Step 1: Define Schemas & Types: `features/<feature>/model/<entity>.schema.ts`
Step 2: Define API Operations: `features/<feature>/api/<action>.ts`
Step 3: Define Custom Hooks: `features/<feature>/hooks/use-<feature>.ts`
Step 4: Build UI Components: `features/<feature>/components/<component>.tsx`
Step 5: Expose Public Contract: `features/<feature>/index.ts`
Step 6: Mount to Routing: `app/(routes)/<path>/page.tsx`
```

### Naming Conventions
- **Files & Folders**: strictly `kebab-case.ts` / `kebab-case.tsx` (e.g., `user-profile.tsx`, `use-order-status.ts`).
- **Component Functions & Interfaces**: strictly `PascalCase` (e.g., `UserProfile`, `UserProfileProps`).
- **Hooks**: strictly `camelCase` with `use` prefix (e.g., `useUserProfile`).
- **Zod Schemas**: strictly `camelCase` with `Schema` suffix (e.g., `userProfileSchema`).
