# Sample Library Triage: Zustand vs. Jotai (Client State Management)

## Direct Recommendation
Adopt **Zustand (`5.x`)** for centralized store-based application state; select **Jotai (`3.x`)** only when fine-grained bottom-up atomic subscriptions are required for high-frequency node/canvas UI.

## Quantitative Triage Comparison
| Criteria | Zustand (`5.1.0`) | Jotai (`3.0.2`) | Verdict |
| :--- | :--- | :--- | :--- |
| **Unpacked Package Size** | ~111.7 kB unpacked (`MIT`) | ~112.9 kB unpacked (`MIT`) | Comparable package footprint |
| **API Paradigm** | Store + selector slices | Atomic bottom-up dependency graph | Zustand fits centralized feature stores |
| **TypeScript Ergonomics** | First-party `.d.ts`, minimal boilerplate | First-party `.d.ts`, compositional atom typing | Zustand simpler for nested record stores |
| **Maintenance** | Active (`pmndrs/zustand`) | Active (`pmndrs/jotai`) | Tie |

## Verification Commands
```bash
npm view zustand version dist.unpackedSize license time.modified
npm view jotai version dist.unpackedSize license time.modified
curl -s "https://bundlephobia.com/api/size?package=zustand"
```
