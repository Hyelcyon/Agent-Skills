# Typography Craft & Perceptual OKLCH Color Systems

Typography and tonal restraint account for 80% of perceived craft before a user clicks a single button.

---

## 1. Typography Rules That Separate Seniors from Templates

### Kill Raw Unstyled `Inter` Clichés
Using bare unstyled `Inter` + flat Tailwind sizes makes every site blend into the same AI training average. Either pair expressive Display + Body + Mono fonts, or—if using neutral neo-grotesque `InterVariable` / `Geist` like Linear and Raycast—unlock OpenType stylistic sets (`font-feature-settings: "ss02" 1, "ss03" 1, "ss08" 1;`) paired with sharp display scale contrast (`64px` hero vs `12–13px` mono telemetry):

| Tone / Domain | Display Font | Body Font | Mono / Technical | Korean CJK Companion |
| :--- | :--- | :--- | :--- | :--- |
| **Editorial / Research** | `Instrument Serif` or `Newsreader` | `Plus Jakarta Sans` or `DM Sans` | `JetBrains Mono` | `Pretendard` / `Noto Serif KR` |
| **Developer / Linear Precision** | `Space Grotesk` or `Geist` | `Geist` or `IBM Plex Sans` | `Geist Mono` / `JetBrains Mono` | `Pretendard Variable` / `D2Coding` |
| **Warm Tactile Consumer** | `Fraunces` or `Lora` | `Source Sans 3` or `Work Sans` | `IBM Plex Mono` | `Wanted Sans` / `Pretendard` |
| **Industrial / Bold Brand** | `Syne` or `Clash Display` | `Satoshi` or `Manrope` | `Space Mono` | `Suit Variable` / `Pretendard` |

*Constraint*: Use at most **3 families total** (1 Display, 1 Body, 1 Mono) — two (`Display+Body` + `Mono`) is usually sharpest.

### Scale, Tracking & Line Measure Laws
- **Modular Contrast (`>= 1.25`)**: Distinct visual steps between caption (`0.75rem–0.8125rem`), body (`1rem`), card lead (`1.25rem`), section heading (`clamp(1.75rem, 1.2rem + 2vw, 2.75rem)`), and hero display (`clamp(2.5rem, 1.6rem + 3.8vw, 4.75rem)`).
- **Display Optical Tightening & Regular-Weight Precision**: Large headings look loose and amateurish at `letter-spacing: 0`. Apply `-0.025em` to `-0.06em` tracking (e.g., Vercel sets `64px / 64px` headings at `font-weight: 400` and `-3.84px` / `-0.06em` tracking) and `line-height: 1.0–1.12` on display sizes (`>= 28px`).
- **Uppercase Micro-Labels**: For small eyebrow metadata (`11px–12px`, weight `500–600`), add `+0.06em` to `+0.10em` positive tracking so capitals breathe cleanly.
- **Line Measure & Wrapping**: Cap long-form reading lines at `62ch–72ch`, use `line-height: 1.55–1.65`, set `text-wrap: balance;` on headlines to eliminate single-word orphans, and `text-wrap: pretty;` on paragraphs.
- **Tabular Numerals Everywhere Numbers Align**: Always apply `font-variant-numeric: tabular-nums;` (and `font-feature-settings: "tnum"`) on prices, metrics, timestamps, progress counters, and tables so digits never jitter horizontally.

---

## 2. Perceptual `oklch()` Color Engineering

Traditional HSL deceives contrast: `hsl(60, 100%, 50%)` (yellow) and `hsl(240, 100%, 50%)` (blue) share `50%` lightness mathematically yet differ drastically in human luminance. **`oklch(L C H)` guarantees uniform perceptual lightness (`L`)** across hues.

### Rule 1: Chromatically Tinted Neutrals (Never Dead `#808080`)
Pure `#000000`, `#808080`, and `#ffffff` often feel sterile and harsh:
- **Cool Precision Dark**: Hue `255` with ultra-low chroma `0.008–0.015`:
  - Canvas: `oklch(0.12 0.008 255)`
  - Elevated panel: `oklch(0.16 0.010 255)`
  - Raised control / hover: `oklch(0.20 0.012 255)`
  - Primary ink: `oklch(0.95 0.004 255)` (slightly softened from glaring pure white)
  - Secondary muted ink: `oklch(0.68 0.010 255)`
- **Warm Paper Light**: Hue `85` with chroma `0.005–0.010`:
  - Canvas: `oklch(0.985 0.005 85)`
  - Subtle band / surface: `oklch(0.958 0.007 85)`
  - Card / elevated crisp sheet: `oklch(0.996 0.002 85)`
  - Primary ink: `oklch(0.18 0.012 255)` (rich charcoal-ink instead of flat `#000`)

### Rule 2: Surface Elevation Without Heavy Drop Shadows
AI slop simulates depth with dark muddy shadows (`box-shadow: 0 20px 50px rgba(0,0,0,0.35)`). Senior design engineers build depth through **stepped tonal surfaces + ultra-thin hairlines**:
- **Dark mode**: Lighten elevated surfaces by `L +0.03` to `+0.05` and apply a `1px` perimeter at `oklch(1 0 0 / 0.08)` plus an optional crisp `1px` top specular catch (`inset 0 1px 0 oklch(1 0 0 / 0.07)`).
- **Light mode**: Pair a bright card surface (`L=0.996`) over a tinted canvas (`L=0.96–0.985`) with a subtle `1px` hairline `oklch(0.2 0.01 255 / 0.10)` and whisper-soft micro shadow `0 1px 2px oklch(0.18 0.01 255 / 0.05)`.

### Rule 3: 60–30–10 Restraint & Single-Accent Governance
- **60% Neutral Canvas**, **30% Secondary Surface & Typography Ink**, **10% (or less) Primary Accent**.
- Derive hover (`L - 0.05` light / `L + 0.05` dark), subtle tint (`oklch(from var(--accent) l c h / 0.12)`), and focus ring tokens mathematically from **one** accent hue.
- **Lila Ban**: Reject unmotivated violet/indigo gradients (`hue 270–305` gradient fills on black cards) unless an explicit user brand book mandates violet; even then, keep gradient stops tonal rather than neon-saturated.
