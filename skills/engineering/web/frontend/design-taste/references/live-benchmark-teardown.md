# Live Production CSS & JS Benchmark Teardown (6 Sites)

Side-by-side reverse-engineered CSS custom properties, typography metrics, easing curves, border tricks, and JavaScript runtime mechanics extracted directly from live assets on `vercel.com`, `stripe.com`, `raycast.com`, `rauno.me`, `emilkowal.ski`, and `linear.app`.

---

## 1. Visual System, Color Scales & Surface Craft

| Site | Primary Palette & Alpha Scale | Border & Elevation Technique | Accent Discipline |
| :--- | :--- | :--- | :--- |
| **`vercel.com`** (`Geist`) | Dark `--ds-background-100: hsl(0 0% 4%)`, `--ds-background-200: #000`, 10-step `--ds-gray-alpha-100..1000` (`#ffffff0f`..`#ffffffeb`) | Stacked ring+border shadow: `0 0 0 1px #ffffff25, var(--ds-shadow-background-border)` + `#ffffff24` inset hairline | Monochrome neutral; `--ds-blue-900` (`210, 100%, 66%`) reserved strictly for focus rings |
| **`stripe.com`** (`HDS`) | Blue-tinted neutrals `#061b31` (`neutral-990`) to `#f8fafd` (`neutral-25`); border `#e5edf5` (`neutral-50`) | `border-inline: 1px solid #e5edf5` vertical container rails + dashed dividers + `color-mix(in srgb, ...)` + `clip-path: inset(...)` bento expand | >80% white canvas; blurple (`#533afd`, hover `#4032c8`) CTAs + WebGL diagonal hero ribbon |
| **`raycast.com`** | Obsidian `--grey-900: #07080a` down to `--grey-50: #e6e6e6`; `--color-bg-100..400` (`#101111`..`#494b4d`) | `::before` `mask-composite: exclude` `padding: 1px` `135deg` gradient border + multi-layer inset micro-bevels on dark icons/buttons | Translucent `#ffffff05` cards, `backdrop-filter: blur(5px–32px) saturate(1.6)`, red/amber `#ff6363`/`#ffc533` micro-accents |
| **`rauno.me`** | Radix Gray 1–12 & GrayA 1–12 (`hsl(0 0% 8.5%)` dark; `hsl(0 0% 93%)` `#EDEDED` index) | Route-reactive `html:has(main[data-sheet])`, `box-shadow: inset 0 0 0 1px hsla(0,0%,100%,.1)`, edge `.verticalFade` blur+mask | Wide-gamut Display-P3 `@supports(color:color(display-p3 1 1 1))` overrides (`--yellow: #FFFF02`, `--blue`, `--red`) |
| **`emilkowal.ski`** | Warm stone light `--color-gray-100: #fdfdfc` -> `#21201c`, 12-step `--color-gray-alpha-100..1200` | `--ds-shadow-border: 0 0 0 1px rgba(0,0,0,.08)` + `--ds-inset-border: inset 0 0 0 1px rgba(0,0,0,.08)`, zero noisy boxes | Forced light editorial `#fdfdfc`; negative-bleed hover `-mx-4 px-4` (`hover:bg-[#F5F4F4]`) |
| **`linear.app`** | Dark `color-scheme: dark` obsidian canvas + Sonner `--gray1..12` | Subtle `1px` top/card dividers + bottom-faded embedded product windows | Monochrome hierarchy; high-contrast inverted white pill `Sign up` + sparse issue-status icons |

---

## 2. Typography Metrics, OpenType & Anti-CLS Tricks

- **Sub-Bold Tight Display (`vercel.com` & `stripe.com`)**:
  - `vercel.com` `.text-heading-64`: `64px / 64px` (`1.0` ratio), **`letter-spacing: -3.84px` (`-0.06em`)**, marketing override **`font-weight: 450`** (hero uses `400`).
  - `stripe.com` `Sohne`: `--hds-font-weight-normal: 300; --hds-font-weight-bold: 400;`, hero scales dynamically via `max(min(6lvh, var(--lang-font-max)), var(--lang-font-min))` with `line-height: 1.03`, paired with `"SourceCodePro"` (`tabular-nums` on tickers).
- **OpenType Stylistic Sets (`raycast.com` & `emilkowal.ski`)**:
  - `raycast.com` headings/prices: `font-feature-settings: "ss08" on, "ss02" on, "liga" off;`, mono captions `"ss09" on`, editors `"tnum" 1`.
  - `emilkowal.ski` body: `--font-settings: "cv01", "ss03"; font-feature-settings: var(--font-settings); font-variation-settings: "opsz" auto;` + calibrated fallback font-face (`ascent-override: 89.79%; descent-override: 22.36%; size-adjust: 107.89%;`) + refined underline (`text-underline-position: from-font; text-decoration-thickness: .08em;`).

---

## 3. Production Motion Physics & Timing Curves

| Source | Exact Measured Curves & Rules | Engineering Principle |
| :--- | :--- | :--- |
| **`raycast.com`** | `--spring-1: linear(0 0%, ..., 1.04283 40%, ..., .99965 100%)` (100-pt CSS `linear()` spring); `.2s` ease-in-out bevel CTA (`transform .1s ease-in-out`); `cubic-bezier(.23,1,.32,1)`, `(.16,1,.3,1)` | **Zero Framer Motion / Rive loaded on `/`** — native CSS `linear()` springs + GPU transitions only |
| **`emilkowal.ski`** | `bounce: 0` snappy springs (`0.2s–0.4s`) for UI state; `cubic-bezier(.19,1,.22,1)` dropdowns (`0.3s`), `(.165,.84,.44,1)` Vaul drawer (`0.25s`); transient `blur(4px) -> blur(0px)` during `layoutId` morphs; `active:scale-[0.97]` | **Interruptible transitions over keyframes**, origin-aware `scale(.9 -> 1)` (never `scale(0)`), avoid `ease-in` on UI entry |
| **`rauno.me`** | `--transitions-snappy: cubic-bezier(.2, .8, .2, 1)`; Framer `useSpring`: minimap `{ stiffness: 620, damping: 45, mass: 0.2 }`, zoom `{ stiffness: 500, damping: 50 }`, clipReveal `{ stiffness: 240, damping: 32, mass: 0.1 }` | **Counter-scale metadata** (`scale: 1/s`, `top: -28/s`) so text labels stay razor sharp while deck zooms |
| **`stripe.com`** | `.hds-button`: `.3s cubic-bezier(.25,1,.5,1)`; bento `clip-path`: `800ms cubic-bezier(0.165,0.84,0.44,1)`; GDP ticker slots: Web Animations API `duration: 325, delay: 50*i, cubic-bezier(0.33, 1, 0.68, 1)` | Decouple button/chip transitions (`150–300ms`) from large-surface `clip-path` reveals (`600–800ms`) |
| **`linear.app`** | Vaul `[data-vaul-drawer]`: `.5s cubic-bezier(0.32, 0.72, 0, 1)`; `<h1>` line reveal `filter: blur(0px); translateY(0%)` | Physical deceleration curve (`0.32, 0.72, 0, 1`) for sheets + line-by-line hero unblur |

---

## 4. Reverse-Engineered JavaScript Craft Architecture

1. **Off-Thread Geometry + Self-Throttling Render Loop (`stripe.com`, `vercel.com`)**:
   - Spawn a Web Worker (`OffscreenCanvas` or `Float32Array` transferables) for expensive shader/sphere geometry so the main UI thread never drops frames.
   - Manage canvas rendering via a single shared `RenderLoopManager`: pause when `document.hidden` (`visibilitychange`), pause when off-viewport (`IntersectionObserver`), pause when a modal/drawer opens (`isDialogOpen || isMenuOpen`), and monitor rolling 24-frame FPS to downgrade frame rate or suspend cleanly on weak GPUs.
2. **SSR-Safe `prefers-reduced-motion` (`stripe.com`)**:
   - Subscribe via `useSyncExternalStore` to `window.matchMedia("(prefers-reduced-motion: reduce)")`, returning **`true` on `getServerSnapshot`** so initial SSR/hydration renders statically until the client confirms motion preference.
3. **Pooled `IntersectionObserver` Registry (`vercel.com`, `rauno.me`)**:
   - Pool observers in a `Map` keyed by `{ rootMargin, threshold }` options rather than allocating one `IntersectionObserver` per card; auto-pause offscreen `<video>` cards and tickers (`clearInterval`).
4. **Logarithmic Over-Drag Damping (`emilkowal.ski` / Vaul)**:
   - Damp upward over-scroll with `8 * (Math.log(t + 1) - 2)` and dismiss drawers by velocity (`dist / dt > 0.4`) OR fraction (`dist >= height * 0.25`) while scaling the background page subtly (`(innerWidth - 16) / innerWidth`).
5. **Pointer & Focus Ergonomics (`raycast.com`, `rauno.me`, `emilkowal.ski`)**:
   - Separate mouse clicks from keyboard focus (`onMouseDown={e => e.preventDefault()}` preserves clean clicks while keeping high-contrast `:focus-visible` `4px` rings on `Tab`).
   - Measure active list highlights cleanly (`selectedEl.getBoundingClientRect().top - listEl.getBoundingClientRect().top`) to animate a single GPU `translateY()` indicator (`200ms`).
   - When overlaying `mix-blend-mode: difference` UI chrome, verify click targets via `document.elementsFromPoint(clientX, clientY)` or `pointer-events: none`.
