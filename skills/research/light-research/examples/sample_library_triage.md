### Evaluation: Zustand vs Jotai (Client State Management)

#### Direct Recommendation
Adopt **Zustand** for centralized application state; consider **Jotai** only if fine-grained atomic re-renders are bottlenecking canvas/graph UI.

#### Quantitative Triage Comparison
| Criteria | Zustand (v5) | Jotai (v2) | Verdict |
| :--- | :--- | :--- | :--- |
| **Bundle Size** | ~1.2 kB | ~3.4 kB | Zustand wins (65% lighter) |
| **API Paradigm** | Flux / Store (Selector-based) | Atomic / Recoil-like | Zustand matches existing Redux intuition |
| **TypeScript Ergonomics** | Native, zero-boilerplate | Good, but complex atom typing | Zustand cleaner for nested records |
| **Maintenance** | Highly active (Poimandres) | Highly active (Poimandres) | Tie |

#### Verification Command
```bash
npx bundlephobia zustand jotai
```
