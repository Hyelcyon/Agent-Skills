---
name: react-bits
description: Use when adding animated UI components, text animations, 3D WebGL backgrounds, interactive cards, or micro-interactions from the React Bits design system (reactbits.dev) in React or Next.js applications.
---

# React Bits Animated UI & Motion Design Engineering

An engineering runbook for integrating, configuring, and optimizing the 165+ animated, interactive components from React Bits (`reactbits.dev`) across React 19, Next.js 15, and Tailwind CSS.

## When to Use
- Adding high-impact text animations (`BlurText`, `SplitText`, `DecryptedText`, `ShinyText`).
- Implementing ambient 3D or WebGL canvas backgrounds (`Aurora`, `Ballpit`, `Iridescence`, `Hyperspeed`).
- Mounting interactive card components (`SpotlightCard`, `TiltedCard`, `Dock`, `Stack`).
- Integrating tactile micro-interactions (`ClickSpark`, `Magnet`, `SplashCursor`, `StarBorder`).
- Fetching components from the React Bits registry (`https://reactbits.dev/r/`).

## When NOT to Use
- Designing basic, non-animated semantic HTML forms or typography (use `html-css`).
- Architecting server-side data mutations or backend APIs (use `react` or `api`).
- Building standard domain-agnostic UI atoms without motion (use `ui-ux`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Component & Motion Dependency Profiling (Verify motion, three, ogl, tailwind)
Phase 2: Variant & Accessibility Shielding (Select TS-TW, configure prefers-reduced-motion)
Phase 3: Registry Ingestion & Colocation (Install via shadcn/jsrepo or colocated file)
Phase 4: Hardware Acceleration & GPU Guard (translate3d, opacity only, WebGL context disposal)
Phase 5: Frame-Rate & A11y Verification (Audit 60/120fps, zero reflow, screen reader checks)
```

### Phase 1: Component & Motion Dependency Profiling
Inspect `package.json` and install required motion engines matching the component's runtime:
```bash
pnpm add motion clsx tailwind-merge
```
For 3D or shader backgrounds (`Ballpit`, `Aurora`, `Iridescence`), install `@react-three/fiber`, `three`, or `ogl`.

### Phase 2: Variant & Accessibility Shielding
1. Standardize on the **`TS-TW`** (TypeScript + Tailwind) variant for enterprise type safety.
2. Provide immediate reduced-motion fallbacks for vestibular accessibility using the MotionReducedWrapper:
```tsx
<MotionReducedWrapper fallback={<h1 className="text-4xl font-bold">{text}</h1>}>
  <BlurText text={text} />
</MotionReducedWrapper>
```

### Phase 3: Registry Ingestion & Colocation
Install the component directly using `shadcn` CLI or colocate under `src/components/ui/`:
```bash
npx shadcn@latest add https://reactbits.dev/r/BlurText-TS-TW
```

### Phase 4: Hardware Acceleration & GPU Guard
1. Only animate compositor-friendly properties: `transform` (`translate3d`, `scale`, `rotate`) and `opacity`.
2. Clean up WebGL contexts and cancel animation frames (`cancelAnimationFrame`) on component unmount.

### Phase 5: Verification & Frame-Rate Proof
Verify that:
- Animation executes at steady 60/120fps with zero layout thrashing.
- Keyboard navigation and focus rings remain intact on interactive cards.

---

## Prohibited Anti-Patterns

- ❌ Animating layout-triggering properties (`top`, `left`, `width`, `height`, `margin`).
- ❌ Guessing component props from outdated memory instead of checking the registry catalog.
- ❌ Omitting WebGL context disposal on background unmount (causes VRAM memory leaks).
- ❌ Forcing rapid looping animations when `@media (prefers-reduced-motion: reduce)` is active.
- ❌ Hardcoding inline styles when Tailwind utilities are available.

---

## References & Documentation
- Component Catalog: [references/component-catalog.md](./references/component-catalog.md)
- Registry API & Variants: [references/registry-api-and-variants.md](./references/registry-api-and-variants.md)
- Motion Performance & A11y: [references/motion-performance-and-a11y.md](./references/motion-performance-and-a11y.md)

## Resources & Examples
- Tailwind Keyframes Config: [resources/react-bits-tailwind.config.js](./resources/react-bits-tailwind.config.js)
- Component Manifest Schema: [resources/component-manifest-schema.json](./resources/component-manifest-schema.json)
- Motion Reduced Wrapper: [resources/motion-reduced-wrapper.tsx](./resources/motion-reduced-wrapper.tsx)
- Blur Text Animation Example: [examples/blur_text_animation.tsx](./examples/blur_text_animation.tsx)
- Spotlight Card Example: [examples/spotlight_card.tsx](./examples/spotlight_card.tsx)
- Aurora Background Example: [examples/aurora_background.tsx](./examples/aurora_background.tsx)
