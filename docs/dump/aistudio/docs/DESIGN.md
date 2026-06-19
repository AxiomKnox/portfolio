# Portfolio Design System: Sophisticated Technical

## 1. Aesthetic Narrative
A fusion of high-end editorial design (Playfair Display) and precise engineering aesthetics (JetBrains Mono). The goal is to present complex backend and DevOps work with the clarity of a premium brand.

## 2. Color Palette
- **Background**: `#050505` (Deepest Charcoal)
- **Surface**: `#121212` (Elevated cards)
- **Text Primary**: `#FFFFFF` (High contrast)
- **Text Secondary**: `#a1a1aa` (Zinc-400 for descriptions)
- **Accent**: `rgba(255, 255, 255, 0.1)` (Glassy borders)
- **Status Green**: `#22c55e` (Terminal success indicator)

## 3. Typography
- **Headings**: `Playfair Display` (Serif, Italic accents for "Architect" feel)
- **Body**: `Inter` (Sans, light weights for readability)
- **Data/Code**: `JetBrains Mono` (Monospace, used for IDs and Tags)

## 4. Components & Layout
- **Horizontal Scrollers**: Projects on the homepage use a `overflow-x-auto` container with snap-scrolling to maintain a clean "gallery" feel without vertical clutter.
- **Borders**: Thin `1px` borders with `white/10` opacity. Hover states increase this to `white/20`.
- **Motion**: 
  - Staggered entrances for list items.
  - Subtle `x-axis` translation on card hover to indicate depth.
  - Pulse animations for the "AI Assisted" and "Available" status indicators.

## 5. UI Accents
- **Iconography**: Clean, thin-stroke icons from Iconify.
- **Gradients**: Subtle radial gradients to highlight focused areas, mimicking a spotlight on a dark stage.
