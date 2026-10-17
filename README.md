# Gifts Kart — Frontend Architecture & Design System Foundation

> **Tagline**: *Create Memories That Last Forever*  
> **Architecture**: Pure Handwritten Semantic HTML5, Modular CSS3, and ES6+ Vanilla JavaScript.  
> **Target Scalability**: 10,000+ Products with direct PHP + MySQL backend interoperability.

---

## 💎 Project Overview

Gifts Kart is built from the ground up without frameworks (no React, no Vue, no Bootstrap, no Tailwind, no jQuery). It provides a complete, scalable, and ultra-high-performance UI/UX foundation inspired by Apple's design principles, featuring:

- **Luxury Rosy-Alabaster Color Palette** (`#FF4FA3`, `#FFD8E8`, `#FF7ABF`, `#FFF9FC`, `#FFFFFF`, `#222222`)
- **Apple-Inspired Glassmorphism** (`backdrop-filter: blur(...)`, smooth frosted-glass navigation)
- **Fluid Modular Typography** with *Plus Jakarta Sans* and *Playfair Display*
- **Decoupled ES6+ Engine** with Pub/Sub Event Bus (`Events`), Fetch API wrapper (`API`), and TTL-enabled storage (`LocalStore`/`SessionStore`)
- **Accessible ARIA-compliant Components** (Modals with focus trapping, off-canvas drawers, toast queues, floating labels, accordions, tabs, dropdowns, and stepper counters)
- **Zero-CLS Skeletons** and high-performance IntersectionObserver lazy loading

---

## 📁 Directory Structure

```
gifts-kart/
├── index.html                 # Living Design System & Component Foundation Showcase
├── README.md                  # Architectural Documentation & Integration Guide
├── assets/
│   ├── fonts/                 # Webfont declarations and imports
│   ├── icons/                 # SVG Sprite symbols (icons.svg)
│   ├── images/                # Product, category, and hero assets
│   ├── svg/                   # Brand logo and vector marks (logo.svg)
│   └── videos/                # Video media placeholders
├── css/
│   ├── base/
│   │   ├── reset.css          # Modern box-sizing reset & accessibility rules
│   │   ├── variables.css      # Design tokens (Colors, Spacing, Shadows, Easings)
│   │   ├── typography.css     # Typography scale, font weights, gradients
│   │   ├── utilities.css      # Atomic layout & micro-interaction helpers
│   │   └── animations.css     # Apple-inspired keyframes, hover lifts & ripples
│   ├── layout/
│   │   ├── container.css      # Fluid responsive containers & section gutters
│   │   ├── grid.css           # 12-column grid and auto-fit responsive utilities
│   │   ├── header.css         # Sticky frosted-glass Navbar & mega menu
│   │   ├── footer.css         # Multi-column luxury footer & newsletter card
│   │   └── responsive.css     # Five-tier media queries (Mobile -> Ultra-wide)
│   ├── components/
│   │   ├── accordion.css      # Collapsible accordions with fluid height transitions
│   │   ├── badge-avatar.css   # Status badges, pill tags, user avatars, rating stars
│   │   ├── buttons.css        # Primary, secondary, outline, ghost, loading buttons
│   │   ├── cards.css          # Product card, category card, and review card templates
│   │   ├── drawer.css         # Left, right, and bottom off-canvas drawers
│   │   ├── dropdown.css       # Dropdown menus with focus & click-outside dismiss
│   │   ├── fab.css            # Floating Action Button with pulsing glow
│   │   ├── feedback.css       # Empty states, error states, and image fallbacks
│   │   ├── forms.css          # Floating labels, inputs, checkboxes, switches, validation
│   │   ├── loaders.css        # Page loader spinner and shimmer skeleton screens
│   │   ├── modal.css          # Accessible dialogs with blur backdrop & ESC key handling
│   │   ├── navigation.css     # Breadcrumbs, pagination, and accessible tab switchers
│   │   ├── quantity.css       # Touch-friendly quantity stepper selector
│   │   ├── toast.css          # Floating toast notification system with progress bar
│   │   └── tooltip.css        # Micro-tooltips with smart directional arrows
│   ├── pages/                 # Ready for future page stylesheets
│   └── main.css               # Unified entrypoint importing all modular stylesheets
├── js/
│   ├── core/
│   │   ├── config.js          # Brand settings, API routes, storage keys, breakpoints
│   │   ├── helpers.js         # DOM utils, debounce, throttle, currency formatters
│   │   ├── storage.js         # LocalStorage/SessionStorage wrapper with TTL & fallback
│   │   ├── api.js             # Universal Fetch client with CSRF support (PHP-ready)
│   │   ├── theme.js           # Theme state manager & CSS token controller
│   │   └── events.js          # Pub/Sub Event Bus for decoupled component messaging
│   ├── components/
│   │   ├── accordion.js       # Accordion expand/collapse manager
│   │   ├── drawer.js          # Off-canvas drawer manager (Left/Right/Bottom)
│   │   ├── dropdown.js        # Dropdown menu controller with outside click handling
│   │   ├── forms.js           # Form validation, floating labels, password reveal
│   │   ├── modal.js           # Modal dialog manager with focus trapping & ESC key
│   │   ├── navbar.js          # Sticky header scroll listener & drawer triggers
│   │   ├── quantity.js        # Quantity stepper controller with bounds checking
│   │   ├── tabs.js            # Accessible tab manager with keyboard arrow navigation
│   │   ├── toast.js           # Toast notification queue manager
│   │   └── tooltip.js         # Accessible tooltip enhancement controller
│   ├── modules/
│   │   ├── lazyload.js        # IntersectionObserver image & media lazy loader
│   │   ├── ripple.js          # Apple-style click ripple micro-interaction
│   │   └── scroll-reveal.js   # IntersectionObserver scroll reveal module
│   ├── pages/                 # Ready for future page scripts
│   └── app.js                 # Global bootstrapping & window.GiftsKart namespace
└── data/
    ├── products.json          # Normalized product schema (SKU, variants, price)
    ├── categories.json        # Normalized category taxonomy schema
    ├── reviews.json           # Review and verified buyer rating schema
    └── banners.json           # Hero and promotional banner schema
```

---

## 🔌 Connecting with PHP + MySQL Backend

The frontend architecture in `js/core/api.js` is structured for zero-effort integration with any PHP/REST backend:

```javascript
import { API } from './js/core/api.js';

// Set CSRF token from PHP session/cookie
API.setCsrfToken('<?php echo $_SESSION["csrf_token"]; ?>');

// Fetch products from PHP endpoint: /api/v1/products.php
const response = await API.get('/products.php', { category: 'anniversary', limit: 20 });
if (response.success) {
  console.log(response.data); // Array of products conforming to data/products.json schema
}
```

---

## 🚀 How to View the Showcase

Open `index.html` in any modern web browser or serve it using any static HTTP server (e.g., Python `python3 -m http.server 3000` or PHP `php -S localhost:8000`).
