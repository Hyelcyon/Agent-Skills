# YAGNI & Premature Abstraction Defense

## 1. You Aren't Gonna Need It (YAGNI)
Premature abstractions are among the most expensive failure modes in software development:
- Creating abstract factory classes for single implementations.
- Introducing multi-tenant or multi-database interfaces before a second system exists.
- Adding configurable options for constants that never vary.

## 2. Rule of Three
Wait until a pattern manifests three independent times in production before abstracting into a shared helper:
- Duplicate code is vastly cheaper than the wrong abstraction.
- Local clarity outweighs global DRY when contexts diverge.

## 3. Platform Primitives over Wrappers
Always prioritize language and runtime standard library features:
- Standard collections over third-party utility libraries.
- Standard async patterns over complex custom event buses.
