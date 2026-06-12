---
name: Pa' Donde Natty
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474f'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#475e8c'
  primary: '#03224d'
  on-primary: '#ffffff'
  primary-container: '#1f3864'
  on-primary-container: '#8ba2d5'
  inverse-primary: '#afc6fb'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#202425'
  on-tertiary: '#ffffff'
  tertiary-container: '#36393b'
  on-tertiary-container: '#a0a2a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#afc6fb'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#2e4673'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Work Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  sidebar-width: 260px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for high-efficiency logistics and inventory management, blending the reliability of a traditional "bodegón" with the precision of modern AI-driven enterprise software. The aesthetic is **Corporate / Modern**, emphasizing clarity, structure, and professional trust. 

The visual language prioritizes information density without sacrificing legibility. It uses expansive whitespace to reduce cognitive load during complex inventory tasks. The emotional response is one of calm control and organizational mastery, ensuring that users feel the software is an authoritative tool for their business growth.

## Colors
The palette is anchored by a deep Navy Blue, signaling stability and institutional strength. This is complemented by a sophisticated scale of grays and off-whites to create a layered, "airy" environment.

- **Primary (Navy):** Used for navigation, primary actions, and branding elements.
- **Secondary (Slate):** Used for secondary UI elements and icons.
- **Surface/Background:** A mix of pure white (#FFFFFF) for cards and high-contrast areas, with a very light gray (#F9FAFB) for the main application background to define boundaries.
- **Semantic Colors:** Reserved strictly for status indicators. Red for stock-outs, Orange for low-inventory thresholds, and Green for successful AI confirmations or completed arrivals.

## Typography
The system utilizes a dual-font strategy. **Work Sans** is used for headlines to provide a grounded, professional structure. **Inter** is the workhorse for body copy, data tables, and labels due to its exceptional legibility and neutral tone, which is critical for an inventory-heavy environment.

For mobile layouts, `headline-lg` should scale down to 24px and `display-lg` to 32px to ensure readability on smaller viewports. Data-heavy tables should utilize `body-sm` or `data-mono` for SKU numbers and quantities to maximize vertical space.

## Layout & Spacing
The layout follows a **Fixed Grid** model for the main content area with a **Fluid Sidebar** and Top Bar. 

- **Sidebar:** Fixed at 260px, collapsible to 64px.
- **Main Content:** 12-column grid with 24px gutters.
- **Margins:** 32px page margins on desktop, scaling down to 16px on mobile.
- **Rhythm:** An 8px linear scale (base-4) governs all padding and margins to ensure a tight, mathematical alignment suitable for a corporate tool.

On tablet devices, the sidebar transitions to an overlay drawer, and the 12-column grid reflows to 6 columns. On mobile, all content stacks into a single column.

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Low-Contrast Outlines** to define hierarchy. 

1. **Level 0 (Background):** #F9FAFB - Used for the primary application canvas.
2. **Level 1 (Cards/Surfaces):** #FFFFFF with a 1px border (#E2E8F0). No shadow. Used for data tables and standard content blocks.
3. **Level 2 (Interactive Elements):** Subtle ambient shadows (0px 4px 6px -1px rgba(0, 0, 0, 0.1)) are applied only to primary call-to-action buttons and active dropdowns to indicate "lift."
4. **Level 3 (Modals/Overlays):** Defined by a larger shadow (0px 20px 25px -5px rgba(0, 0, 0, 0.1)) and a backdrop blur of 8px to focus user attention.

## Shapes
The shape language is **Soft (0.25rem)**. This slight rounding provides a modern touch while maintaining the "precise" feel required for a professional enterprise app. 

- **Buttons & Inputs:** 4px (0.25rem) border radius.
- **Cards & Data Containers:** 8px (0.5rem) border radius.
- **Status Tags/Chips:** Full pill-shape (999px) to distinguish them from interactive buttons.

## Components

### Sidebar Navigation
The sidebar uses the Primary Navy Blue background. Active states are indicated by a high-contrast left border (4px) in a lighter blue shade and a subtle background highlight. Icons are simplified glyphs with consistent stroke weights.

### Top Search Bar
A persistent, wide search bar at the top of the interface. It features a light gray background (#F1F5F9) and a "Command-K" shortcut indicator to highlight the high-tech, power-user nature of the tool.

### Data Tables
Tables are the heart of the system.
- **Header:** Light gray background (#F8FAF9) with uppercase labels (`label-sm`).
- **Rows:** Alternating subtle zebra striping or 1px bottom borders.
- **Status Indicators:** Small colored dots or subtle tinted badges (e.g., light red background with dark red text) to indicate stock levels.

### Action Buttons
- **Primary:** Solid Navy Blue with white text.
- **Secondary:** White background with Navy Blue border and text.
- **Ghost:** No border or background until hover; used for utility actions.

### KPI Cards
Located at the top of the dashboard. These feature a large value (`headline-lg`), a descriptive label (`label-md`), and a small trend sparkline or percentage indicator to show stock movement over time.

### Input Fields
Clean, outlined boxes with 1px borders. Focus states use a 2px Navy Blue ring with a 2px offset to ensure accessibility and high visibility.