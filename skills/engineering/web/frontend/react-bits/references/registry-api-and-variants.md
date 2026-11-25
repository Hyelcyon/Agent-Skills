# React Bits Registry API & Installation Variants

This guide details the integration mechanisms, CLI commands, and variant matrices for incorporating React Bits components into modern React and Next.js applications.

---

## 1. Registry Architecture & Resolution Mechanics

React Bits distributes components through an open, CDN-backed JSON registry:
```text
https://reactbits.dev/r/<Component>-<LANG>-<STYLE>
```

Where:
- `<Component>`: PascalCase component name (e.g., `BlurText`, `SpotlightCard`, `Aurora`).
- `<LANG>`: `TS` (TypeScript) or `JS` (JavaScript).
- `<STYLE>`: `TW` (Tailwind CSS) or `CSS` (Standard CSS Modules).

### Direct CLI Installation via `shadcn`
```bash
npx shadcn@latest add https://reactbits.dev/r/BlurText-TS-TW
npx shadcn@latest add https://reactbits.dev/r/SpotlightCard-TS-TW
npx shadcn@latest add https://reactbits.dev/r/Aurora-TS-TW
```

### Direct CLI Installation via `jsrepo`
```bash
npx jsrepo@latest add https://reactbits.dev/r/BlurText-TS-TW
```

---

## 2. Dependency Matrix

Before mounting React Bits components, verify that the required motion and math engines are installed in `package.json`:

| Component Family | Required Core Dependencies | Install Command |
| :--- | :--- | :--- |
| **Motion & Springs** | `motion` (Framer Motion 12+) | `pnpm add motion` |
| **Timeline & Complex Physics** | `gsap`, `@gsap/react` | `pnpm add gsap @gsap/react` |
| **3D & WebGL Canvas** | `three`, `@types/three` | `pnpm add three @types/three` |
| **Lightweight WebGL Shaders**| `ogl` | `pnpm add ogl` |
| **2D Rigid Body Physics** | `matter-js`, `@types/matter-js`| `pnpm add matter-js @types/matter-js` |
| **Utility Merging** | `clsx`, `tailwind-merge` | `pnpm add clsx tailwind-merge` |

---

## 3. Tailwind CSS Integration (v3 & v4)

React Bits utilizes custom keyframe animations and utility classes.

### Tailwind v4 Setup (`src/app/globals.css`)
```css
@import "tailwindcss";

@theme {
  --animate-shine: shine 5s linear infinite;
  --animate-star-movement: star-movement 6s linear infinite;

  @keyframes shine {
    0% { background-position: 100%; }
    100% { background-position: -100%; }
  }

  @keyframes star-movement {
    0% { transform: translate(0, 0); }
    100% { transform: translate(100%, 100%); }
  }
}
```

### Tailwind v3 Setup (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '100%' },
          '100%': { backgroundPosition: '-100%' }
        },
        starMovement: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(100%, 100%)' }
        }
      },
      animation: {
        shine: 'shine 5s linear infinite',
        starMovement: 'starMovement 6s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
```
