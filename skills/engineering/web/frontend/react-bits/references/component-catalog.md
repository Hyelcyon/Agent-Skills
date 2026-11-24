# Complete React Bits Component Catalog & Design Reference

A comprehensive reference of all 218 animated, interactive, and customizable components from the React Bits (`reactbits.dev`) design system.
All components below are stored in complete, production-ready TypeScript + Tailwind CSS (`TS-TW`) format within this skill's `components/` directory.

---

## Table of Contents
- [Animations (38 components)](#animations)
- [Backgrounds (64 components)](#backgrounds)
- [Components (48 components)](#components)
- [Micro (35 components)](#micro)
- [TextAnimations (33 components)](#textanimations)

---

## Animations

Total components: **38**

| Component | Description | Local Source Path | Official Docs |
| :--- | :--- | :--- | :--- |
| **AnimatedContent** | Wrapper that reveals its content on scroll with slides, blur, 3D tilts, soft wipes and staggered children. | [`AnimatedContent`](../components/Animations/AnimatedContent) | [Docs](https://reactbits.dev/animations/animated-content) |
| **BlobCursor** | Liquid metal blob cursor that stretches, sloshes and bursts into droplets, in chrome, jelly, pearl or ink. | [`BlobCursor`](../components/Animations/BlobCursor) | [Docs](https://reactbits.dev/animations/blob-cursor) |
| **ClickSpark** | Bursts of sparks at every click, as dashes, comets, dots or stars, that can spill around buttons. | [`ClickSpark`](../components/Animations/ClickSpark) | [Docs](https://reactbits.dev/animations/click-spark) |
| **Crosshair** | Crosshair cursor with live coordinates that locks onto links and buttons and measures them. | [`Crosshair`](../components/Animations/Crosshair) | [Docs](https://reactbits.dev/animations/crosshair) |
| **CrystalizedBall** | A glass ball with a crackling electric rim and glowing dust that swirls with the cursor. | [`CrystalizedBall`](../components/Animations/CrystalizedBall) | [Docs](https://reactbits.dev/animations/crystalized-ball) |
| **Cubes** | A grid of outlined 3D cubes that turn to face the cursor, spin when swept and ripple on click. | [`Cubes`](../components/Animations/Cubes) | [Docs](https://reactbits.dev/animations/cubes) |
| **CursorGrid** | A crisp grid whose cells light up and fade behind the cursor, with grid styles, tiles and click pulses. | [`CursorGrid`](../components/Animations/CursorGrid) | [Docs](https://reactbits.dev/animations/cursor-grid) |
| **DitherVeil** | A 1-bit dithered photo the cursor burns through to full colour, knitting back cell by cell. | [`DitherVeil`](../components/Animations/DitherVeil) | [Docs](https://reactbits.dev/animations/dither-veil) |
| **ElasticMesh** | Turns text or any logo into a puffy inflated shape you can press, poke and stretch like jelly. | [`ElasticMesh`](../components/Animations/ElasticMesh) | [Docs](https://reactbits.dev/animations/elastic-mesh) |
| **ElectricBorder** | Wraps any element in crackling strands of current that surge near the cursor and leap off in sparks. | [`ElectricBorder`](../components/Animations/ElectricBorder) | [Docs](https://reactbits.dev/animations/electric-border) |
| **ElectricLogo** | Turns any logo into a living lightning outline, with arcs that leap off its edges. | [`ElectricLogo`](../components/Animations/ElectricLogo) | [Docs](https://reactbits.dev/animations/electric-logo) |
| **FadeContent** | Wrapper that fades content in on scroll, plain or out of focus, from washed-out gray, or through grain, mist and pixel blocks. | [`FadeContent`](../components/Animations/FadeContent) | [Docs](https://reactbits.dev/animations/fade-content) |
| **GhostCursor** | A ghost of glowing smoke that floats after the cursor and curls away as it rises. | [`GhostCursor`](../components/Animations/GhostCursor) | [Docs](https://reactbits.dev/animations/ghost-cursor) |
| **GlareHover** | A glossy light streak that sweeps across any element in the direction the cursor moves. | [`GlareHover`](../components/Animations/GlareHover) | [Docs](https://reactbits.dev/animations/glare-hover) |
| **GlowCursor** | Light that pours from the cursor, drifts softly through the air and cools as it fades. | [`GlowCursor`](../components/Animations/GlowCursor) | [Docs](https://reactbits.dev/animations/glow-cursor) |
| **GradualBlur** | Progressive edge blur for headers, footers, captions and carousels, with an optional fade to color that hides at the ends of a scroll. | [`GradualBlur`](../components/Animations/GradualBlur) | [Docs](https://reactbits.dev/animations/gradual-blur) |
| **HalftoneReveal** | A halftone print of an image whose dots swell into the real photo under the cursor. | [`HalftoneReveal`](../components/Animations/HalftoneReveal) | [Docs](https://reactbits.dev/animations/halftone-reveal) |
| **ImageTrail** | Cursor-based image trail with several built-in variants. | [`ImageTrail`](../components/Animations/ImageTrail) | [Docs](https://reactbits.dev/animations/image-trail) |
| **LaserFlow** | A beam of light that splashes onto your content and pours over its corners. | [`LaserFlow`](../components/Animations/LaserFlow) | [Docs](https://reactbits.dev/animations/laser-flow) |
| **LogoLoop** | Continuously looping marquee of brand or tech logos with seamless repeat and hover pause. | [`LogoLoop`](../components/Animations/LogoLoop) | [Docs](https://reactbits.dev/animations/logo-loop) |
| **Magnet** | Elements magnetically ease toward the cursor then settle back with spring physics. | [`Magnet`](../components/Animations/Magnet) | [Docs](https://reactbits.dev/animations/magnet) |
| **MetaBalls** | Liquid metaballs that merge, stretch and pinch apart, with a cursor blob that pushes through them. | [`MetaBalls`](../components/Animations/MetaBalls) | [Docs](https://reactbits.dev/animations/meta-balls) |
| **MetallicPaint** | Liquid chrome that flows over your logo or text, adapted from Paper | [`MetallicPaint`](../components/Animations/MetallicPaint) | [Docs](https://reactbits.dev/animations/metallic-paint) |
| **Noise** | Film grain overlay for photos and pages, from fine 35mm grain to dust, paper and TV static. | [`Noise`](../components/Animations/Noise) | [Docs](https://reactbits.dev/animations/noise) |
| **OrbitImages** | SVG Path customizable orbiting images effect | [`OrbitImages`](../components/Animations/OrbitImages) | [Docs](https://reactbits.dev/animations/orbit-images) |
| **PixelSwap** | New content builds in pixel by pixel in a springy wave that starts wherever the cursor enters. | [`PixelSwap`](../components/Animations/PixelSwap) | [Docs](https://reactbits.dev/animations/pixel-swap) |
| **PixelTrail** | Glossy pixels melt into a fluid goo trail behind the cursor, with color shifts and drips. | [`PixelTrail`](../components/Animations/PixelTrail) | [Docs](https://reactbits.dev/animations/pixel-trail) |
| **PixelTransition** | Retro pixel dissolve that covers a card in solid pixels, swaps the content underneath and clears again. | [`PixelTransition`](../components/Animations/PixelTransition) | [Docs](https://reactbits.dev/animations/pixel-transition) |
| **Ribbons** | Springy ribbons that trail the cursor, in lens, comet or even shapes with an optional wave. | [`Ribbons`](../components/Animations/Ribbons) | [Docs](https://reactbits.dev/animations/ribbons) |
| **RippleDistortion** | Pointer-driven water displacement that warps content and leaves a decaying wake. | [`RippleDistortion`](../components/Animations/RippleDistortion) | [Docs](https://reactbits.dev/animations/ripple-distortion) |
| **ScrollExpand** | A rounded media frame that grows to full bleed as it scrolls through the viewport. | [`ScrollExpand`](../components/Animations/ScrollExpand) | [Docs](https://reactbits.dev/animations/scroll-expand) |
| **ShapeBlur** | A crisp logo or shape that drifts out of focus under the pointer like a camera lens. | [`ShapeBlur`](../components/Animations/ShapeBlur) | [Docs](https://reactbits.dev/animations/shape-blur) |
| **SplashCursor** | A fluid simulation that trails the cursor in swirling ink and bursts into a splash on click. | [`SplashCursor`](../components/Animations/SplashCursor) | [Docs](https://reactbits.dev/animations/splash-cursor) |
| **StarBorder** | A twinkling star that travels the exact outline of any button, pill or card, trailing light and stardust. | [`StarBorder`](../components/Animations/StarBorder) | [Docs](https://reactbits.dev/animations/star-border) |
| **StickerPeel** | A die-cut sticker you can peel at any edge, drag, throw and swing, in gloss, matte or holographic finishes. | [`StickerPeel`](../components/Animations/StickerPeel) | [Docs](https://reactbits.dev/animations/sticker-peel) |
| **Strands** | Spectral strands that twist inside a frosted glass orb and swell into a smooth bulge where they come together, like the new Siri. | [`Strands`](../components/Animations/Strands) | [Docs](https://reactbits.dev/animations/strands) |
| **SwarmCursor** | A liquid swarm of particles that flows after the cursor, curls into eddies and pours around hovered buttons. | [`SwarmCursor`](../components/Animations/SwarmCursor) | [Docs](https://reactbits.dev/animations/swarm-cursor) |
| **TargetCursor** | A reticle cursor whose corner brackets snap around targets, matching their shape. | [`TargetCursor`](../components/Animations/TargetCursor) | [Docs](https://reactbits.dev/animations/target-cursor) |

---

## Backgrounds

Total components: **64**

| Component | Description | Local Source Path | Official Docs |
| :--- | :--- | :--- | :--- |
| **AcidSquares** | A rolling field of glossy squares that ripples under two drifting colored lights. | [`AcidSquares`](../components/Backgrounds/AcidSquares) | [Docs](https://reactbits.dev/backgrounds/acid-squares) |
| **AeroShards** | Silk ribbons of thick glass shards streaming on layered depths among survey markers, catching light along their edges. | [`AeroShards`](../components/Backgrounds/AeroShards) | [Docs](https://reactbits.dev/backgrounds/aero-shards) |
| **Antigravity** | A field of particles that lifts into a glowing ring around the cursor and bursts outward on click. | [`Antigravity`](../components/Backgrounds/Antigravity) | [Docs](https://reactbits.dev/backgrounds/antigravity) |
| **Aurora** | A soft, calm aurora that flows across the top of the page and drifts toward the cursor. | [`Aurora`](../components/Backgrounds/Aurora) | [Docs](https://reactbits.dev/backgrounds/aurora) |
| **Balatro** | The swirling Balatro paint shader, with crisp pixels, a cursor that stirs the paint and click whirlpools. | [`Balatro`](../components/Backgrounds/Balatro) | [Docs](https://reactbits.dev/backgrounds/balatro) |
| **Ballpit** | A soft-lit pit of physics balls you can shove with the cursor, grab, throw and blast apart. | [`Ballpit`](../components/Backgrounds/Ballpit) | [Docs](https://reactbits.dev/backgrounds/ballpit) |
| **Beams** | Glossy ribbons that ripple in the dark and catch the light, which follows your cursor. | [`Beams`](../components/Backgrounds/Beams) | [Docs](https://reactbits.dev/backgrounds/beams) |
| **CRTWarp** | A blocky plasma glowing on a curved CRT, with real scanlines, a phosphor mask, afterglow and a power-on intro. | [`CRTWarp`](../components/Backgrounds/CRTWarp) | [Docs](https://reactbits.dev/backgrounds/crt-warp) |
| **ColorBends** | Vibrant color bends with smooth flowing animation. | [`ColorBends`](../components/Backgrounds/ColorBends) | [Docs](https://reactbits.dev/backgrounds/color-bends) |
| **DarkVeil** | A silky veil of light that drifts in the dark and bends around the cursor. | [`DarkVeil`](../components/Backgrounds/DarkVeil) | [Docs](https://reactbits.dev/backgrounds/dark-veil) |
| **Dither** | Retro dithered waves with Bayer, halftone, line and noise patterns, palettes and cursor trails. | [`Dither`](../components/Backgrounds/Dither) | [Docs](https://reactbits.dev/backgrounds/dither) |
| **DotField** | A gradient dot field seen through a lens that follows the cursor, magnifying, pinching or swirling the dots. | [`DotField`](../components/Backgrounds/DotField) | [Docs](https://reactbits.dev/backgrounds/dot-field) |
| **DotGrid** | A springy dot grid that the cursor flicks and drags through like jelly, with click shockwaves. | [`DotGrid`](../components/Backgrounds/DotGrid) | [Docs](https://reactbits.dev/backgrounds/dot-grid) |
| **EvilEye** | Procedural evil eye shader with animated iris, slit pupil, and fiery outer glow. | [`EvilEye`](../components/Backgrounds/EvilEye) | [Docs](https://reactbits.dev/backgrounds/evil-eye) |
| **FaultyTerminal** | A flickering CRT terminal of glowing glyphs, with phosphor trails under the cursor and glitches on click. | [`FaultyTerminal`](../components/Backgrounds/FaultyTerminal) | [Docs](https://reactbits.dev/backgrounds/faulty-terminal) |
| **Ferrofluid** | A glossy sea of magnetic fluid where swells of spikes roll in and the cursor raises a crown. | [`Ferrofluid`](../components/Backgrounds/Ferrofluid) | [Docs](https://reactbits.dev/backgrounds/ferrofluid) |
| **FloatingLines** | Ribbons of fine glowing lines that drift in waves, part around the cursor and curl when clicked. | [`FloatingLines`](../components/Backgrounds/FloatingLines) | [Docs](https://reactbits.dev/backgrounds/floating-lines) |
| **FluxLines** | Glowing flux lines tracing a churning magnetic fluid. The cursor magnet reveals and curls them. | [`FluxLines`](../components/Backgrounds/FluxLines) | [Docs](https://reactbits.dev/backgrounds/flux-lines) |
| **Galaxy** | Endless flight through a twinkling starfield with warp jumps, cursor repulsion and star palettes. | [`Galaxy`](../components/Backgrounds/Galaxy) | [Docs](https://reactbits.dev/backgrounds/galaxy) |
| **GhostFibers** | Layered ribbons of fine glowing fibers that twist, fold and drift through soft depth of field. | [`GhostFibers`](../components/Backgrounds/GhostFibers) | [Docs](https://reactbits.dev/backgrounds/ghost-fibers) |
| **GradientASCII** | Soft gradient glows drawn in ASCII characters that scramble under the cursor. | [`GradientASCII`](../components/Backgrounds/GradientASCII) | [Docs](https://reactbits.dev/backgrounds/gradient-ascii) |
| **GradientBlinds** | Satin gradient blinds lit by a spotlight that follows the cursor, swaying and turning toward the light. | [`GradientBlinds`](../components/Backgrounds/GradientBlinds) | [Docs](https://reactbits.dev/backgrounds/gradient-blinds) |
| **GradientWaves** | Lit satin waves rolling in from a hazy horizon, with a light that follows the cursor and swells on click. | [`GradientWaves`](../components/Backgrounds/GradientWaves) | [Docs](https://reactbits.dev/backgrounds/gradient-waves) |
| **Grainient** | Flowing grainy gradients you can stir with the cursor. | [`Grainient`](../components/Backgrounds/Grainient) | [Docs](https://reactbits.dev/backgrounds/grainient) |
| **GridDistortion** | Image background that breaks into a grid of blocks under the cursor and settles back into place. | [`GridDistortion`](../components/Backgrounds/GridDistortion) | [Docs](https://reactbits.dev/backgrounds/grid-distortion) |
| **GridMotion** | A tilted wall of drifting tiles that slides with the pointer and lights up where it rests. | [`GridMotion`](../components/Backgrounds/GridMotion) | [Docs](https://reactbits.dev/backgrounds/grid-motion) |
| **GridScan** | A 3D grid room swept by a scanning light that follows your view. | [`GridScan`](../components/Backgrounds/GridScan) | [Docs](https://reactbits.dev/backgrounds/grid-scan) |
| **Hyperspeed** | Night highway of glowing light trails on a winding road that warps into hyperspace while you hold. | [`Hyperspeed`](../components/Backgrounds/Hyperspeed) | [Docs](https://reactbits.dev/backgrounds/hyperspeed) |
| **Iridescence** | Liquid iridescent surface with shifting folds that you can stir with the cursor. | [`Iridescence`](../components/Backgrounds/Iridescence) | [Docs](https://reactbits.dev/backgrounds/iridescence) |
| **LetterGlitch** | A calm field of letters that flicker, scramble and glitch in color, stirred by the cursor and torn by clicks. | [`LetterGlitch`](../components/Backgrounds/LetterGlitch) | [Docs](https://reactbits.dev/backgrounds/letter-glitch) |
| **LightPillar** | A swirling pillar of light that ignites on load, leans toward the cursor and surges on click. | [`LightPillar`](../components/Backgrounds/LightPillar) | [Docs](https://reactbits.dev/backgrounds/light-pillar) |
| **LightRays** | Volumetric light rays from any edge, with source glow and haze. The cursor steers the beam and casts a shadow. | [`LightRays`](../components/Backgrounds/LightRays) | [Docs](https://reactbits.dev/backgrounds/light-rays) |
| **LightTunnel** | A swirling fibre-optic tunnel where comets of light race into depth, steered by the cursor. | [`LightTunnel`](../components/Backgrounds/LightTunnel) | [Docs](https://reactbits.dev/backgrounds/light-tunnel) |
| **Lightfall** | Streaks of light falling down a curved tunnel, bending around the cursor and stretching into warp trails on hold. | [`Lightfall`](../components/Backgrounds/Lightfall) | [Docs](https://reactbits.dev/backgrounds/lightfall) |
| **Lightning** | Crackling, branching lightning that bends toward the cursor and strikes wherever you click. | [`Lightning`](../components/Backgrounds/Lightning) | [Docs](https://reactbits.dev/backgrounds/lightning) |
| **LineWaves** | Fine lines that flow in silky waves while a band of light drifts through them. | [`LineWaves`](../components/Backgrounds/LineWaves) | [Docs](https://reactbits.dev/backgrounds/line-waves) |
| **LiquidChrome** | Soft ribbons of liquid chrome that swirl through a dark pool, ripple under the cursor and catch the light as it moves. | [`LiquidChrome`](../components/Backgrounds/LiquidChrome) | [Docs](https://reactbits.dev/backgrounds/liquid-chrome) |
| **LiquidEther** | A glowing liquid that swirls under the cursor, colored by how fast it flows. | [`LiquidEther`](../components/Backgrounds/LiquidEther) | [Docs](https://reactbits.dev/backgrounds/liquid-ether) |
| **MagicRings** | Glowing rings that pulse outward in a wave, swell toward the cursor and flare on click. | [`MagicRings`](../components/Backgrounds/MagicRings) | [Docs](https://reactbits.dev/backgrounds/magic-rings) |
| **MagnetLines** | A field of magnetic lines that swing toward the cursor, ripple outward and spin with every click. | [`MagnetLines`](../components/Backgrounds/MagnetLines) | [Docs](https://reactbits.dev/backgrounds/magnet-lines) |
| **MicroSlats** | A wall of tiny slats that becomes a rolling sea in perspective, with glinting crests. | [`MicroSlats`](../components/Backgrounds/MicroSlats) | [Docs](https://reactbits.dev/backgrounds/micro-slats) |
| **MoltenMetal** | Swirling caustic filaments with white-hot cores that heat up under the cursor and flare on click. | [`MoltenMetal`](../components/Backgrounds/MoltenMetal) | [Docs](https://reactbits.dev/backgrounds/molten-metal) |
| **Orb** | A glowing ring of swirling color that breathes, trails an orbiting light and reaches toward the cursor. | [`Orb`](../components/Backgrounds/Orb) | [Docs](https://reactbits.dev/backgrounds/orb) |
| **Particles** | A drifting 3D field of particles with glow, twinkle, constellation lines and cursor interaction. | [`Particles`](../components/Backgrounds/Particles) | [Docs](https://reactbits.dev/backgrounds/particles) |
| **PatternWaves** | A lit halftone surface of dots, lines or glyphs that moves like draped silk. | [`PatternWaves`](../components/Backgrounds/PatternWaves) | [Docs](https://reactbits.dev/backgrounds/pattern-waves) |
| **PixelBlast** | Dithered pixel clouds that drift, shimmer and light up under the cursor, with ripples, shapes and a perspective floor. | [`PixelBlast`](../components/Backgrounds/PixelBlast) | [Docs](https://reactbits.dev/backgrounds/pixel-blast) |
| **PixelSnow** | Pixel-art snowflakes drifting down in layers of depth, brushed aside by the cursor. | [`PixelSnow`](../components/Backgrounds/PixelSnow) | [Docs](https://reactbits.dev/backgrounds/pixel-snow) |
| **Plasma** | Folds of satin light twisting slowly through the dark, turning to follow the cursor. | [`Plasma`](../components/Backgrounds/Plasma) | [Docs](https://reactbits.dev/backgrounds/plasma) |
| **PlasmaWave** | Two ribbons of plasma curling through each other, with soft glow and white-hot cores. | [`PlasmaWave`](../components/Backgrounds/PlasmaWave) | [Docs](https://reactbits.dev/backgrounds/plasma-wave) |
| **Prism** | Rotating prism of glowing spectral light with configurable shape, colors and motion. | [`Prism`](../components/Backgrounds/Prism) | [Docs](https://reactbits.dev/backgrounds/prism) |
| **PrismaticBurst** | A burst of prismatic light rays that leans toward the cursor and sends a wave of light outward on click. | [`PrismaticBurst`](../components/Backgrounds/PrismaticBurst) | [Docs](https://reactbits.dev/backgrounds/prismatic-burst) |
| **Radar** | A radar scope whose sweep leaves a phosphor afterglow and picks up moving contacts. | [`Radar`](../components/Backgrounds/Radar) | [Docs](https://reactbits.dev/backgrounds/radar) |
| **RippleGrid** | A crisp grid that ripples like water, bending and lighting up as waves pass through it. | [`RippleGrid`](../components/Backgrounds/RippleGrid) | [Docs](https://reactbits.dev/backgrounds/ripple-grid) |
| **Scanner** | Glowing interference lines swept by a scan beam, with a CRT finish, cursor lensing and click pings. | [`Scanner`](../components/Backgrounds/Scanner) | [Docs](https://reactbits.dev/backgrounds/scanner) |
| **ShapeGrid** | A drifting grid of shapes that lights up under the cursor, with perspective tilt and rainbow trails. | [`ShapeGrid`](../components/Backgrounds/ShapeGrid) | [Docs](https://reactbits.dev/backgrounds/shape-grid) |
| **ShapeWaves** | A field of triangles, circles and squares that brighten and grow along rolling waves. | [`ShapeWaves`](../components/Backgrounds/ShapeWaves) | [Docs](https://reactbits.dev/backgrounds/shape-waves) |
| **SideRays** | Shafts of light that fan in from a corner or side, shimmer slowly and lean toward the cursor. | [`SideRays`](../components/Backgrounds/SideRays) | [Docs](https://reactbits.dev/backgrounds/side-rays) |
| **Silk** | Flowing satin folds with glossy highlights that turn toward the cursor and ripple on click. | [`Silk`](../components/Backgrounds/Silk) | [Docs](https://reactbits.dev/backgrounds/silk) |
| **SlicedWaves** | Waves of colored light sliced into glowing bars, seen in depth with a focus that follows the cursor. | [`SlicedWaves`](../components/Backgrounds/SlicedWaves) | [Docs](https://reactbits.dev/backgrounds/sliced-waves) |
| **SoftAurora** | Soft aurora borealis shader with 3D Perlin noise and cosine gradient palettes. | [`SoftAurora`](../components/Backgrounds/SoftAurora) | [Docs](https://reactbits.dev/backgrounds/soft-aurora) |
| **Threads** | Flowing threads that fray apart and part around the cursor, from fine silk to contour lines. | [`Threads`](../components/Backgrounds/Threads) | [Docs](https://reactbits.dev/backgrounds/threads) |
| **Topography** | A 3D landscape drawn in glowing contour lines that rises under the cursor, with light pulses on click. | [`Topography`](../components/Backgrounds/Topography) | [Docs](https://reactbits.dev/backgrounds/topography) |
| **Waves** | Dense flowing lines that sway like silk, bend around the cursor and spring back into place. | [`Waves`](../components/Backgrounds/Waves) | [Docs](https://reactbits.dev/backgrounds/waves) |
| **WebThreads** | Glowing threads woven through luminous pinch points that light up under the cursor and carry light on click. | [`WebThreads`](../components/Backgrounds/WebThreads) | [Docs](https://reactbits.dev/backgrounds/web-threads) |

---

## Components

Total components: **48**

| Component | Description | Local Source Path | Official Docs |
| :--- | :--- | :--- | :--- |
| **AccordionGallery** | Panels expand on hover or focus, revealing parallax imagery and captions. | [`AccordionGallery`](../components/Components/AccordionGallery) | [Docs](https://reactbits.dev/components/accordion-gallery) |
| **AnimatedList** | A scrolling list whose rows spring into view, with a gliding selection and arrow keys. | [`AnimatedList`](../components/Components/AnimatedList) | [Docs](https://reactbits.dev/components/animated-list) |
| **BorderGlow** | Glowing mesh-gradient border that follows cursor direction and intensifies near edges. | [`BorderGlow`](../components/Components/BorderGlow) | [Docs](https://reactbits.dev/components/border-glow) |
| **BounceCards** | A fan of photo cards that bounce in, then spread apart and straighten the one you hover. | [`BounceCards`](../components/Components/BounceCards) | [Docs](https://reactbits.dev/components/bounce-cards) |
| **BubbleMenu** | Floating circular expanding menu with staggered item reveal. | [`BubbleMenu`](../components/Components/BubbleMenu) | [Docs](https://reactbits.dev/components/bubble-menu) |
| **CardNav** | A navigation bar that springs open into a row of cards, each with its own links. | [`CardNav`](../components/Components/CardNav) | [Docs](https://reactbits.dev/components/card-nav) |
| **CardSwap** | A 3D stack of cards that sends the front card to the back on a timer, or when you fling it. | [`CardSwap`](../components/Components/CardSwap) | [Docs](https://reactbits.dev/components/card-swap) |
| **Carousel** | Swipeable cards for feature tours, stories and galleries, with five transitions and an autoplay timer. | [`Carousel`](../components/Components/Carousel) | [Docs](https://reactbits.dev/components/carousel) |
| **ChromaGrid** | A grid of grayscale photo cards where a spotlight follows the cursor and brings back color. | [`ChromaGrid`](../components/Components/ChromaGrid) | [Docs](https://reactbits.dev/components/chroma-grid) |
| **CircularCarousel** | A 3D ring of images with bendable cards, momentum drag, snapping and click to focus. | [`CircularCarousel`](../components/Components/CircularCarousel) | [Docs](https://reactbits.dev/components/circular-carousel) |
| **CircularGallery** | A curved image gallery you can drag, scroll or tab through, with cards that open to the full image. | [`CircularGallery`](../components/Components/CircularGallery) | [Docs](https://reactbits.dev/components/circular-gallery) |
| **Counter** | An odometer-style number whose digits roll to every new value, with currency, separators and locales. | [`Counter`](../components/Components/Counter) | [Docs](https://reactbits.dev/components/counter) |
| **CurvedInput** | Arc-bent input bar with text, caret and submit button all following the curve. | [`CurvedInput`](../components/Components/CurvedInput) | [Docs](https://reactbits.dev/components/curved-input) |
| **DecayCard** | An image card that tears and melts as the pointer moves, then pulls itself back together. | [`DecayCard`](../components/Components/DecayCard) | [Docs](https://reactbits.dev/components/decay-card) |
| **DepthCarousel** | Cards recede into depth on a 3D rail, with drag, keyboard and auto-advance. | [`DepthCarousel`](../components/Components/DepthCarousel) | [Docs](https://reactbits.dev/components/depth-carousel) |
| **Dock** | macOS style dock with smooth magnification, launch bounce, badges and context menus. | [`Dock`](../components/Components/Dock) | [Docs](https://reactbits.dev/components/dock) |
| **DomeGallery** | Immersive 3D dome gallery projecting images on a hemispheric surface. | [`DomeGallery`](../components/Components/DomeGallery) | [Docs](https://reactbits.dev/components/dome-gallery) |
| **DriftWall** | An endless perspective wall of tiles drifting past, lifting on hover. | [`DriftWall`](../components/Components/DriftWall) | [Docs](https://reactbits.dev/components/drift-wall) |
| **ElasticSlider** | A slider that grows under your cursor and stretches like rubber when pulled past either end, then springs back. | [`ElasticSlider`](../components/Components/ElasticSlider) | [Docs](https://reactbits.dev/components/elastic-slider) |
| **FlexCarousel** | An infinite image row that flows through invisible liquid glass at its edges. | [`FlexCarousel`](../components/Components/FlexCarousel) | [Docs](https://reactbits.dev/components/flex-carousel) |
| **FlowingMenu** | A full-height menu with a liquid band that glides between rows and reveals a scrolling marquee of each item. | [`FlowingMenu`](../components/Components/FlowingMenu) | [Docs](https://reactbits.dev/components/flowing-menu) |
| **FluidGlass** | A 3D glass object that refracts your headline, image or video, follows the cursor and melts between shapes. | [`FluidGlass`](../components/Components/FluidGlass) | [Docs](https://reactbits.dev/components/fluid-glass) |
| **FlyingPosters** | 3D posters that twist and flip as you scroll or drag through an endless column. | [`FlyingPosters`](../components/Components/FlyingPosters) | [Docs](https://reactbits.dev/components/flying-posters) |
| **Folder** | Folder that drops its flap open or swings open like a book, with pages you can pick. | [`Folder`](../components/Components/Folder) | [Docs](https://reactbits.dev/components/folder) |
| **GlassIcons** | Liquid glass icons that bend the color behind them, for app grids, docks and social links. | [`GlassIcons`](../components/Components/GlassIcons) | [Docs](https://reactbits.dev/components/glass-icons) |
| **GlassSurface** | Apple-style liquid glass that bends what is behind it, in a rounded panel or any logo shape. | [`GlassSurface`](../components/Components/GlassSurface) | [Docs](https://reactbits.dev/components/glass-surface) |
| **GooeyNav** | A navigation bar whose active pill breaks into goo that flows over to the item you pick. | [`GooeyNav`](../components/Components/GooeyNav) | [Docs](https://reactbits.dev/components/gooey-nav) |
| **HoloCard** | Collectible trading card with a real holographic foil and glitter that sparkles as it tilts. | [`HoloCard`](../components/Components/HoloCard) | [Docs](https://reactbits.dev/components/holo-card) |
| **InfiniteMenu** | A draggable sphere of image tiles that snaps the nearest one forward and shows its title. | [`InfiniteMenu`](../components/Components/InfiniteMenu) | [Docs](https://reactbits.dev/components/infinite-menu) |
| **InfiniteSpiral** | An endlessly looping 3D helix of images with adjustable motion, depth and spacing. | [`InfiniteSpiral`](../components/Components/InfiniteSpiral) | [Docs](https://reactbits.dev/components/infinite-spiral) |
| **Lanyard** | Swinging 3D badge on a stretchy woven band that you can drag, throw or click to flip. | [`Lanyard`](../components/Components/Lanyard) | [Docs](https://reactbits.dev/components/lanyard) |
| **LineSidebar** | Static list navigation with a cursor-proximity effect that shifts and highlights nearby items. | [`LineSidebar`](../components/Components/LineSidebar) | [Docs](https://reactbits.dev/components/line-sidebar) |
| **MagicBento** | A bento grid of feature cards with live artwork, edge light that follows the cursor and a click wave. | [`MagicBento`](../components/Components/MagicBento) | [Docs](https://reactbits.dev/components/magic-bento) |
| **Masonry** | A masonry gallery that springs into place, reflows as it resizes and opens images in a lightbox. | [`Masonry`](../components/Components/Masonry) | [Docs](https://reactbits.dev/components/masonry) |
| **ModelViewer** | A product-style 3D model viewer that frames itself and floats over a soft shadow. | [`ModelViewer`](../components/Components/ModelViewer) | [Docs](https://reactbits.dev/components/model-viewer) |
| **MorphSlider** | WebGL slider that melts between images with a displacement transition. | [`MorphSlider`](../components/Components/MorphSlider) | [Docs](https://reactbits.dev/components/morph-slider) |
| **OptionWheel** | Curved option picker that spins with scroll, drag or arrow keys, tilting items away. | [`OptionWheel`](../components/Components/OptionWheel) | [Docs](https://reactbits.dev/components/option-wheel) |
| **PillNav** | A pill navigation bar where a fill rises through each link as its label rolls over, with a sliding active dot. | [`PillNav`](../components/Components/PillNav) | [Docs](https://reactbits.dev/components/pill-nav) |
| **PixelCard** | A card that fills with twinkling pixels on hover, rippling out from the center or the cursor. | [`PixelCard`](../components/Components/PixelCard) | [Docs](https://reactbits.dev/components/pixel-card) |
| **ProfileCard** | A framed profile card that tilts toward the cursor, with holographic foil shining through a tiled pattern. | [`ProfileCard`](../components/Components/ProfileCard) | [Docs](https://reactbits.dev/components/profile-card) |
| **ReflectiveCard** | A metal ID card that reflects your camera or a looping video and catches the light as it tilts. | [`ReflectiveCard`](../components/Components/ReflectiveCard) | [Docs](https://reactbits.dev/components/reflective-card) |
| **ScrollStack** | Cards pin and stack as you scroll, settling back into a dimmed deck with smooth, jitter-free motion. | [`ScrollStack`](../components/Components/ScrollStack) | [Docs](https://reactbits.dev/components/scroll-stack) |
| **SpecularButton** | Glass button whose edge catches the light, with a highlight that glides toward the cursor. | [`SpecularButton`](../components/Components/SpecularButton) | [Docs](https://reactbits.dev/components/specular-button) |
| **SpotlightCard** | Card lit by a soft spotlight that follows the pointer, catches its edge and reaches nearby cards. | [`SpotlightCard`](../components/Components/SpotlightCard) | [Docs](https://reactbits.dev/components/spotlight-card) |
| **Stack** | Pile of cards you can drag, flick or click through, with thrown cards tucking underneath. | [`Stack`](../components/Components/Stack) | [Docs](https://reactbits.dev/components/stack) |
| **StaggeredMenu** | Menu with staggered item animations and smooth transitions on open/close. | [`StaggeredMenu`](../components/Components/StaggeredMenu) | [Docs](https://reactbits.dev/components/staggered-menu) |
| **Stepper** | A multi-step flow with a gliding step indicator, spring transitions and horizontal or vertical layouts. | [`Stepper`](../components/Components/Stepper) | [Docs](https://reactbits.dev/components/stepper) |
| **TiltedCard** | A 3D card that tilts toward the cursor, with glare, a soft shadow, floating layers and a flip side. | [`TiltedCard`](../components/Components/TiltedCard) | [Docs](https://reactbits.dev/components/tilted-card) |

---

## Micro

Total components: **35**

| Component | Description | Local Source Path | Official Docs |
| :--- | :--- | :--- | :--- |
| **BellToggle** | Pill toggle where a press rings the bell, crossfades the label and unfurls the pill. | [`BellToggle`](../components/Micro/BellToggle) | [Docs](https://reactbits.dev/micro/bell-toggle) |
| **BranchedMenu** | Collapsible menu that branches each section from a trunk and traces a line to your pick. | [`BranchedMenu`](../components/Micro/BranchedMenu) | [Docs](https://reactbits.dev/micro/branched-menu) |
| **CallChip** | Tool-call chip whose fill wipes across as a live timer ticks, ending green or shaking red. | [`CallChip`](../components/Micro/CallChip) | [Docs](https://reactbits.dev/micro/call-chip) |
| **CodeSlots** | One-time code input whose digits spring into their slots, with paste and SMS autofill. | [`CodeSlots`](../components/Micro/CodeSlots) | [Docs](https://reactbits.dev/micro/code-slots) |
| **CometDial** | Tick-ring dial you flick by angle, with a comet that streaks behind the lit head. | [`CometDial`](../components/Micro/CometDial) | [Docs](https://reactbits.dev/micro/comet-dial) |
| **DodgeField** | Wrapper that makes any child dodge the pointer until it relents and glides home. | [`DodgeField`](../components/Micro/DodgeField) | [Docs](https://reactbits.dev/micro/dodge-field) |
| **FlipCard** | Two-faced card that flips in 3D on a click, drag or flick and settles on a spring. | [`FlipCard`](../components/Micro/FlipCard) | [Docs](https://reactbits.dev/micro/flip-card) |
| **FlyingButton** | Button that fires its thrusters on hover, lifts off on a WebGL smoke plume and lands back in its own cloud. | [`FlyingButton`](../components/Micro/FlyingButton) | [Docs](https://reactbits.dev/micro/flying-button) |
| **FolderFloat** | Folder whose notes spring out into a floating cloud when it opens on hover or press. | [`FolderFloat`](../components/Micro/FolderFloat) | [Docs](https://reactbits.dev/micro/folder-float) |
| **FuseButton** | Action button whose done state carries an undo on a burning fuse. | [`FuseButton`](../components/Micro/FuseButton) | [Docs](https://reactbits.dev/micro/fuse-button) |
| **GlideSelect** | Select chip whose menu pops from its corner and whose highlight glides between rows. | [`GlideSelect`](../components/Micro/GlideSelect) | [Docs](https://reactbits.dev/micro/glide-select) |
| **HoldButton** | Hold-to-confirm button whose liquid fill rises while pressed and snaps back if you let go. | [`HoldButton`](../components/Micro/HoldButton) | [Docs](https://reactbits.dev/micro/hold-button) |
| **JellyRadio** | Radio group of chips where the chosen one swells and barges its neighbours outward. | [`JellyRadio`](../components/Micro/JellyRadio) | [Docs](https://reactbits.dev/micro/jelly-radio) |
| **LatticeLoader** | Agent status row with a lattice of cells that brighten in a wave beside a live stopwatch. | [`LatticeLoader`](../components/Micro/LatticeLoader) | [Docs](https://reactbits.dev/micro/lattice-loader) |
| **PaperCrumple** | An image that crumples into a textured 3D sheet while you hold and drag it. | [`PaperCrumple`](../components/Micro/PaperCrumple) | [Docs](https://reactbits.dev/micro/paper-crumple) |
| **PeekRating** | Star rating that lifts a wave of stars up to the pointer, then commits with a pop on click. | [`PeekRating`](../components/Micro/PeekRating) | [Docs](https://reactbits.dev/micro/peek-rating) |
| **PromptBar** | Chat composer with @ sources, / commands, a model picker, dictation and attachments. | [`PromptBar`](../components/Micro/PromptBar) | [Docs](https://reactbits.dev/micro/prompt-bar) |
| **PulseHeart** | Like button that contracts to a dot, flips colour and pulses back as the count ticks over. | [`PulseHeart`](../components/Micro/PulseHeart) | [Docs](https://reactbits.dev/micro/pulse-heart) |
| **RefineFrame** | Media frame that steps an image through generation stages without any layout shift. | [`RefineFrame`](../components/Micro/RefineFrame) | [Docs](https://reactbits.dev/micro/refine-frame) |
| **RubberSegment** | Segmented control whose rubber thumb stretches across the gap and squashes into place. | [`RubberSegment`](../components/Micro/RubberSegment) | [Docs](https://reactbits.dev/micro/rubber-segment) |
| **ScrubField** | Number chip you drag to scrub, with rubber-band limits and click to type. | [`ScrubField`](../components/Micro/ScrubField) | [Docs](https://reactbits.dev/micro/scrub-field) |
| **Shredder** | A list with a paper shredder at the bottom that cuts dragged rows into curling strips. | [`Shredder`](../components/Micro/Shredder) | [Docs](https://reactbits.dev/micro/shredder) |
| **SlideCommit** | Slide-to-confirm handle that spins while your action runs and unfurls into a done pill. | [`SlideCommit`](../components/Micro/SlideCommit) | [Docs](https://reactbits.dev/micro/slide-commit) |
| **SlingButton** | Send button you pull back like a slingshot and release to fire. | [`SlingButton`](../components/Micro/SlingButton) | [Docs](https://reactbits.dev/micro/sling-button) |
| **SloshGauge** | Tank gauge whose liquid chases the value, tilts as it moves and splashes when it fills. | [`SloshGauge`](../components/Micro/SloshGauge) | [Docs](https://reactbits.dev/micro/slosh-gauge) |
| **SpringCheck** | Checkbox row where one spring fills the box, draws the tick and strikes through the label. | [`SpringCheck`](../components/Micro/SpringCheck) | [Docs](https://reactbits.dev/micro/spring-check) |
| **SquishSwitch** | Switch whose thumb stretches with speed and squashes against the end when you flick it. | [`SquishSwitch`](../components/Micro/SquishSwitch) | [Docs](https://reactbits.dev/micro/squish-switch) |
| **StatusMark** | Agent task status glyph that morphs from an idle ring to a progress arc, then a check. | [`StatusMark`](../components/Micro/StatusMark) | [Docs](https://reactbits.dev/micro/status-mark) |
| **SwipeRow** | List row that swipes open to reveal actions and deletes on a full swipe. | [`SwipeRow`](../components/Micro/SwipeRow) | [Docs](https://reactbits.dev/micro/swipe-row) |
| **SwipeToast** | Toast that swipes down to dismiss and burns a thin fuse for its remaining time. | [`SwipeToast`](../components/Micro/SwipeToast) | [Docs](https://reactbits.dev/micro/swipe-toast) |
| **TearTicket** | Ticket whose perforated stub tears off by hand, fibre by fibre, and drops away. | [`TearTicket`](../components/Micro/TearTicket) | [Docs](https://reactbits.dev/micro/tear-ticket) |
| **ThoughtLine** | Reasoning trace header with a live clock that folds its steps into one line when done. | [`ThoughtLine`](../components/Micro/ThoughtLine) | [Docs](https://reactbits.dev/micro/thought-line) |
| **VoicePill** | Mic button that swells into a capsule of live equalizer bars and a timer while recording. | [`VoicePill`](../components/Micro/VoicePill) | [Docs](https://reactbits.dev/micro/voice-pill) |
| **WakeSlider** | Thumbless range slider of thin bars where drag speed raises a wake behind the handle. | [`WakeSlider`](../components/Micro/WakeSlider) | [Docs](https://reactbits.dev/micro/wake-slider) |
| **WarmTooltip** | Tooltip group where the first label waits, then its siblings open instantly while warm. | [`WarmTooltip`](../components/Micro/WarmTooltip) | [Docs](https://reactbits.dev/micro/warm-tooltip) |

---

## TextAnimations

Total components: **33**

| Component | Description | Local Source Path | Official Docs |
| :--- | :--- | :--- | :--- |
| **AsciiText** | Waving ASCII text that tilts toward the pointer, scrambles on hover and ripples on click. | [`AsciiText`](../components/TextAnimations/AsciiText) | [Docs](https://reactbits.dev/text-animations/ascii-text) |
| **BlurText** | Text starts blurred then crisply resolves for a soft-focus reveal effect. | [`BlurText`](../components/TextAnimations/BlurText) | [Docs](https://reactbits.dev/text-animations/blur-text) |
| **CircularText** | Layouts characters around a circle with optional rotation animation. | [`CircularText`](../components/TextAnimations/CircularText) | [Docs](https://reactbits.dev/text-animations/circular-text) |
| **CountUp** | Animated number counter supporting formatting and decimals. | [`CountUp`](../components/TextAnimations/CountUp) | [Docs](https://reactbits.dev/text-animations/count-up) |
| **CurvedLoop** | Flowing looping text path along a customizable curve with drag interaction. | [`CurvedLoop`](../components/TextAnimations/CurvedLoop) | [Docs](https://reactbits.dev/text-animations/curved-loop) |
| **DecryptedText** | Hacker-style decryption cycling random glyphs until resolving to real text. | [`DecryptedText`](../components/TextAnimations/DecryptedText) | [Docs](https://reactbits.dev/text-animations/decrypted-text) |
| **DepthText** | Layered extruded type with parallax that shifts against the pointer. | [`DepthText`](../components/TextAnimations/DepthText) | [Docs](https://reactbits.dev/text-animations/depth-text) |
| **EchoText** | Ghosted copies trail behind the text and settle into a single word. | [`EchoText`](../components/TextAnimations/EchoText) | [Docs](https://reactbits.dev/text-animations/echo-text) |
| **FallingText** | Text that breaks apart and tumbles into a pile you can drag, throw and swipe, then flies back into place. | [`FallingText`](../components/TextAnimations/FallingText) | [Docs](https://reactbits.dev/text-animations/falling-text) |
| **FoldText** | Lines unfold into place like creased paper opening flat. | [`FoldText`](../components/TextAnimations/FoldText) | [Docs](https://reactbits.dev/text-animations/fold-text) |
| **FuzzyText** | Vibrating fuzzy text with controllable hover intensity. | [`FuzzyText`](../components/TextAnimations/FuzzyText) | [Docs](https://reactbits.dev/text-animations/fuzzy-text) |
| **GlitchText** | RGB split and distortion glitch effect with jitter effects. | [`GlitchText`](../components/TextAnimations/GlitchText) | [Docs](https://reactbits.dev/text-animations/glitch-text) |
| **GradientText** | Living gradients inside your text: a sliding sweep, a drifting mesh or a swinging conic fan. | [`GradientText`](../components/TextAnimations/GradientText) | [Docs](https://reactbits.dev/text-animations/gradient-text) |
| **MaskedHeading** | A headline with a drifting colour mesh or image showing through, revealed word by word. | [`MaskedHeading`](../components/TextAnimations/MaskedHeading) | [Docs](https://reactbits.dev/text-animations/masked-heading) |
| **ParticleText** | Text assembles from drifting particles that scatter and reform on demand. | [`ParticleText`](../components/TextAnimations/ParticleText) | [Docs](https://reactbits.dev/text-animations/particle-text) |
| **RotatingText** | Cycles through multiple phrases with 3D rotate / flip transitions. | [`RotatingText`](../components/TextAnimations/RotatingText) | [Docs](https://reactbits.dev/text-animations/rotating-text) |
| **ScrambledText** | Detects cursor position and applies a distortion effect to text. | [`ScrambledText`](../components/TextAnimations/ScrambledText) | [Docs](https://reactbits.dev/text-animations/scrambled-text) |
| **ScrollFloat** | Text gently floats / parallax shifts on scroll. | [`ScrollFloat`](../components/TextAnimations/ScrollFloat) | [Docs](https://reactbits.dev/text-animations/scroll-float) |
| **ScrollReveal** | Text gently unblurs and reveals on scroll. | [`ScrollReveal`](../components/TextAnimations/ScrollReveal) | [Docs](https://reactbits.dev/text-animations/scroll-reveal) |
| **ScrollVelocity** | Text marquee animatio - speed and distortion scale with user | [`ScrollVelocity`](../components/TextAnimations/ScrollVelocity) | [Docs](https://reactbits.dev/text-animations/scroll-velocity) |
| **ShinyText** | A sheen of light that sweeps across text, from soft bands to chrome-like reflections. | [`ShinyText`](../components/TextAnimations/ShinyText) | [Docs](https://reactbits.dev/text-animations/shiny-text) |
| **Shuffle** | Animated text reveal where characters shuffle before settling. | [`Shuffle`](../components/TextAnimations/Shuffle) | [Docs](https://reactbits.dev/text-animations/shuffle) |
| **SplitFlapText** | Mechanical split-flap departure board that clacks through to each new phrase. | [`SplitFlapText`](../components/TextAnimations/SplitFlapText) | [Docs](https://reactbits.dev/text-animations/split-flap-text) |
| **SplitText** | Splits text into characters / words for staggered entrance animation. | [`SplitText`](../components/TextAnimations/SplitText) | [Docs](https://reactbits.dev/text-animations/split-text) |
| **StrokeText** | Outlined letterforms draw themselves on, then flood with fill. | [`StrokeText`](../components/TextAnimations/StrokeText) | [Docs](https://reactbits.dev/text-animations/stroke-text) |
| **TechText** | A wordmark whose letters turn into dashed vector paths under the cursor. | [`TechText`](../components/TextAnimations/TechText) | [Docs](https://reactbits.dev/text-animations/tech-text) |
| **TextCursor** | Text or emoji that trails your cursor as stamped copies, a following chain or a ribbon of letters. | [`TextCursor`](../components/TextAnimations/TextCursor) | [Docs](https://reactbits.dev/text-animations/text-cursor) |
| **TextLoop** | A seamless text marquee that flows along curved SVG paths. | [`TextLoop`](../components/TextAnimations/TextLoop) | [Docs](https://reactbits.dev/text-animations/text-loop) |
| **TextPressure** | Characters scale / warp interactively based on pointer pressure zone. | [`TextPressure`](../components/TextAnimations/TextPressure) | [Docs](https://reactbits.dev/text-animations/text-pressure) |
| **TextType** | Typewriter effect with blinking cursor and adjustable typing cadence. | [`TextType`](../components/TextAnimations/TextType) | [Docs](https://reactbits.dev/text-animations/text-type) |
| **TrueFocus** | Applies dynamic blur / clarity based over a series of words in order. | [`TrueFocus`](../components/TextAnimations/TrueFocus) | [Docs](https://reactbits.dev/text-animations/true-focus) |
| **VariableProximity** | Letter styling changes continuously with pointer distance mapping. | [`VariableProximity`](../components/TextAnimations/VariableProximity) | [Docs](https://reactbits.dev/text-animations/variable-proximity) |
| **WarpText** | WebGL warp that bends and refracts the text around the pointer. | [`WarpText`](../components/TextAnimations/WarpText) | [Docs](https://reactbits.dev/text-animations/warp-text) |

---
