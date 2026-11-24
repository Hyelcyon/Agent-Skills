# Motion Performance and Accessibility Engineering

Senior engineering protocols for executing high-frequency 60/120fps animations, WebGL canvas shaders, and WCAG accessibility compliance with React Bits.

---

## 1. 60/120fps Hardware Acceleration Rules

Animating layout-triggering properties (`top`, `left`, `width`, `height`, `margin`) forces browser reflows, destroying Interaction to Next Paint (INP) and frame rates.

### The Compositor-Only Invariant:
Only animate properties handled directly by the GPU compositor:
- `transform` (`translate3d`, `scale`, `rotate`)
- `opacity`
- `filter` (sparingly, prioritizing blur over drop-shadow)

### Proper `will-change` Management:
Never apply `will-change: transform` indiscriminately across large DOM lists. Apply it on active hover or when the animation sequence begins, and remove it upon animation completion to free GPU VRAM:

```css
.accelerated-surface {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## 2. WebGL / Canvas Lifecycle & Memory Cleanup

Components using Three.js, OGL, or raw Canvas 2D (`Ballpit`, `Aurora`, `Hyperspeed`, `SplashCursor`) must strictly dispose of WebGL contexts, geometries, and animation frames on unmount. Failure to clean up causes browser tab memory leaks and WebGL context crashes.

### Standard Cleanup Lifecycle:
```typescript
useEffect(() => {
  let animationFrameId: number;
  const canvas = canvasRef.current;
  if (!canvas) return;

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  const render = () => {
    drawFrame();
    animationFrameId = requestAnimationFrame(render);
  };
  animationFrameId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animationFrameId);
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  };
}, []);
```

---

## 3. WCAG 2.2 Accessibility: Reduced Motion Standard

Under WCAG 2.2 Guideline 2.3 (Seizures and Physical Reactions), vestibular disorders can cause nausea when exposed to excessive parallax, spinning, or continuous looping motion.

### Mandatory Fallback Protocol:
Check `@media (prefers-reduced-motion: reduce)`:
1. **Text Animations (`BlurText`, `SplitText`)**: Render the complete, sharp text immediately without stagger delays or spatial blur.
2. **Backgrounds (`Aurora`, `Hyperspeed`, `Ballpit`)**: Render a static gradient snapshot or disable continuous animation loops.
3. **Cursor Effects (`SplashCursor`, `FollowCursor`)**: Completely unmount or hide the custom cursor layer on touch devices and when reduced motion is preferred.

```typescript
import { useReducedMotion } from 'motion/react';

export function AccessibleAnimatedComponent({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="opacity-100">{children}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {children}
    </motion.div>
  );
}
```
