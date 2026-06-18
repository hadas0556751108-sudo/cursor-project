---
name: HubOffice Medical ERP
colors:
  surface: '#161B22'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#bacac7'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#859492'
  outline-variant: '#3b4a48'
  surface-tint: '#27ddd3'
  primary: '#6afff5'
  on-primary: '#003734'
  primary-container: '#34e3d9'
  on-primary-container: '#00615c'
  inverse-primary: '#006a65'
  secondary: '#72d6db'
  on-secondary: '#003739'
  secondary-container: '#339fa4'
  on-secondary-container: '#002f31'
  tertiary: '#bef5dc'
  on-tertiary: '#003828'
  tertiary-container: '#a2d8c0'
  on-tertiary-container: '#2c604d'
  error: '#FD6D61'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#56faef'
  primary-fixed-dim: '#27ddd3'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#00504c'
  secondary-fixed: '#8ff2f7'
  secondary-fixed-dim: '#72d6db'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f52'
  tertiary-fixed: '#b8eed6'
  tertiary-fixed-dim: '#9cd2ba'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#1b503e'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
  border: '#30363D'
  text-primary: '#E6EDF3'
  text-secondary: '#8B949E'
  warning: '#FAD100'
  success: '#3FB950'
  info: '#3B82F6'
  notification: '#FED9AA'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  sidebar-width: 240px
  topbar-height: 56px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for a high-stakes medical enterprise environment, blending the precision of a futuristic surgical suite with the efficiency of modern developer tools. It prioritizes clarity, speed, and trust, ensuring that healthcare administrators and medical staff can navigate complex data with zero cognitive friction.

The aesthetic follows a **Premium Glassmorphic** direction within a strict Dark Mode framework. It utilizes semi-transparent surface layers, subtle backdrop blurs, and luminous accents to create a sense of depth and technical sophistication. The UI feels advanced yet approachable, emphasizing "Clean Enterprise" through generous whitespace, high-contrast typography, and purposeful motion.

## Colors
The palette is anchored by a deep obsidian background (`#0F1117`) to reduce eye strain during long shifts. **Primary Teal** is the high-energy signal color, reserved exclusively for primary actions, critical status updates, and active navigation states.

**Named Color Usage:**
- **Surface:** Used for cards, modals, and panels to create a tiered visual hierarchy.
- **Border:** A subtle, low-contrast stroke to define boundaries without cluttering the view.
- **Text Primary:** High-legibility white-gray for main content.
- **Text Secondary:** Muted gray for metadata, labels, and placeholder text.
- **Status Colors:** These follow industry standards for medical safety but are tuned for high vibrancy against the dark background to ensure immediate recognition.

## Typography
This design system utilizes **Inter** for its exceptional legibility and neutral, technical character. The system is **RTL-first (Hebrew)**, which requires careful attention to line heights to accommodate script descenders and ascenders.

- **Weight Strategy:** Use `700` for major page titles, `600` for section headers and buttons, and `400` for long-form data or body text.
- **Hierarchy:** Maintain a clear distinction between data labels (Label MD) and data values (Body LG) to help users scan patient records quickly.
- **Alignment:** All typography defaults to right-aligned for Hebrew, switching to left-aligned for English/LTR fallback components.

## Layout & Spacing
The layout uses a **Fluid Grid** with a strict **8pt spacing system**. This ensures mathematical harmony across all components and screen sizes.

- **Structure:** The sidebar is fixed to the **right side** of the screen (240px) to prioritize RTL flow. The Topbar (56px) remains persistent for global search and notifications.
- **Grid:** Use a 12-column grid for desktop views. Columns should reflow to 4 columns on mobile and 8 on tablet.
- **Safe Areas:** A minimum margin of 24px is maintained at the edges of the screen to prevent "content claustrophobia."
- **RTL Transition:** When switching to LTR, the sidebar mirrors to the left and the alignment of all text and icons inverts.

## Elevation & Depth
Hierarchy is established through **Tonal Layering** and **Glassmorphism**.
- **Level 0 (Background):** `#0F1117` - The base layer.
- **Level 1 (Surface):** `#161B22` - Used for main cards and navigation. Features a 1px border (`#30363D`) to provide definition.
- **Level 2 (Floating):** Surfaces that "hover" (modals, dropdowns) use a background blur (`backdrop-filter: blur(12px)`) and a semi-transparent version of the surface color.
- **Shadows:** Avoid heavy, black shadows. Use soft, diffused glows (Primary Teal or Secondary Teal) at low opacity (10-15%) for active elements to simulate bioluminescence.

## Shapes
The shape language is controlled and modern.
- **Standard Corners:** 8px (`0.5rem`) for cards and buttons, providing a professional, refined appearance that isn't as aggressive as sharp corners nor as "consumer" as pill shapes.
- **Input Corners:** 6px for text fields and selectors to create a subtle visual distinction from action buttons.
- **Iconography:** Use linear, 2px stroke icons with slightly rounded terminals to match the shape language of the UI.

## Components
- **Buttons:** Height: 44px. Primary buttons use a solid Teal (`#34E3D9`) background with dark text. Secondary buttons use an outline style with 1px Teal borders.
- **Inputs:** Height: 40px. Background is a shade darker than the surface (`#0D1117`). On focus, the border transitions to Primary Teal with a subtle 2px outer glow.
- **Cards:** Background: `#161B22`, Border: 1px `#30363D`. Cards should have no internal padding less than 16px.
- **Sidebar Items:** Active states use a vertical Teal bar on the right edge (RTL) and a subtle gradient background.
- **Chips/Badges:** Small, 24px height. Used for status (e.g., "Approved," "Urgent"). Use a low-opacity version of the status color for the background and the full-saturation color for the text/icon.
- **Data Tables:** High-density rows (40px height) with 1px horizontal dividers. Alternating row colors are discouraged; use hover states to highlight rows instead.
- **Tap Targets:** Ensure all interactive elements maintain a minimum size of 44x44px for accessibility.