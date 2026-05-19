# VELOX — Beyond Speed

A cutting-edge automotive website concept built for the 2026 AI Design Challenge. This is a fully coded proof of concept (HTML/CSS/JS) showcasing innovative UI components, micro-interactions, and modern web animation techniques.

## Concept

**VELOX Phantom** — A fictional electric hypercar brand website that pushes the boundaries of web design. Inspired by Aristide Benoist's portfolio transitions and the best luxury automotive digital experiences of 2026.

## Sections & Components

1. **Cinematic Intro** — SVG path-drawing logo animation, particle field, percentage counter, and split-panel reveal transition
2. **Hero** — Mouse-driven 3D parallax on car silhouette, floating spec bubbles, staggered text reveals, gradient grid background
3. **Philosophy** — Scroll-driven clip-path image reveal, animated counters, split-layout with stats cards
4. **Performance (Bento Grid)** — Tilt-on-hover cards, cursor-following glow effect, animated counting values, graph bars
5. **Gallery** — Draggable horizontal carousel with snap behavior, progress indicator, hover scaling
6. **Configurator** — Interactive color selector with car body color transitions, 360-degree drag rotation
7. **Kinetic Footer** — Scroll-responsive marquee (speed/direction changes), outlined text with hover fill

## Micro-Interactions (Every Element)

- **Custom Cursor** — Blend-mode cursor with dot + ring, expands on hover, shows contextual text labels
- **Magnetic Elements** — Nav links, buttons, and controls attract toward the cursor with elastic spring-back
- **Tilt Effect** — 3D perspective rotation on bento cards following mouse position
- **Ripple Effect** — Expanding radial ripple on all button hover events
- **Bento Glow** — Radial gradient follows cursor position inside each card
- **Scroll Progress** — Gradient progress bar fixed at top of viewport
- **Parallax Layers** — Multi-speed scroll displacement on hero elements
- **Counter Animations** — Numbers count up when scrolled into view
- **Graph Bars** — Animated height on viewport entry
- **Marquee Control** — Footer text speeds up on hover, reverses on scroll-up
- **Color Flash** — Brightness pulse when switching configurator colors
- **Elastic Snap** — Gallery items snap with spring physics after drag

## Technical Innovation

| Feature | Implementation |
|---------|---------------|
| Animation Engine | GSAP 3.12 + ScrollTrigger |
| Scroll-Linked Animations | CSS `scroll()` concepts via ScrollTrigger scrub |
| Clip-Path Reveals | Animated `clip-path: inset()` transitions |
| Custom Cursor System | RequestAnimationFrame loop with lerp smoothing |
| Magnetic Physics | Mouse-position offset with elastic easing |
| 3D Tilt | Transform perspective with mouse-mapped rotateX/Y |
| Particle Systems | Randomized GSAP infinite tweens |
| Responsive | Mobile-first breakpoints, cursor disabled on touch |

## AI Tools Used

- **Kiro (AI Assistant)** — Full concept ideation, architecture design, and code generation
- Research-informed by 2026 web design trends, GSAP documentation, and CSS scroll-driven animation specifications

## Interesting Prompts & Workflow

1. Started with research phase — gathered current 2026 automotive/luxury web design trends
2. Designed the full architecture before writing any code (sections, interaction model, technology choices)
3. Built HTML structure → CSS styling → JavaScript interactions in a deliberate layered approach
4. Every component was designed with both visual impact AND micro-interaction from the start

## What Problem This Solves

Traditional automotive websites are static, template-driven, and fail to create the emotional connection that matches the craftsmanship of the vehicles. This concept proves that:

- **Every element can be interactive** without overwhelming the user
- **Scroll-driven storytelling** creates cinematic experiences in the browser
- **Physics-based micro-interactions** (magnetic, elastic, parallax) make interfaces feel alive
- **Performance and beauty aren't mutually exclusive** when using GPU-accelerated animations

## How It Could Evolve

- WebGL/Three.js 3D car model replacing the CSS silhouette
- View Transitions API for multi-page navigation
- Scroll-driven CSS animations (native `animation-timeline: scroll()`) as browser support matures
- AI-powered personalization (dynamic color schemes based on user preferences)
- Sound design layer tied to scroll position and interactions
- AR integration for "see it in your driveway" feature

## Running Locally

Simply open `index.html` in a modern browser (Chrome/Edge recommended for best animation support).

```bash
# Or serve with any static server:
npx serve .
```

---

*Built as a proof of concept for the 2026 AI Design Challenge*
