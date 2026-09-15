# Caretaker Security Services

Official marketing website for Caretaker Security Services Limited, Kampala, Uganda.

The site presents the company’s core security services, specialist capabilities, operational model, licensing, training standards, leadership and contact information. Company details are retained from the existing website's corrected 2026 profile content.

## Design system

Charcoal, warm gold and ivory, set in **Archivo** for body copy and **Archivo Narrow** for display (SIL OFL 1.1, `assets/fonts/OFL.txt`). Both ship as single variable files covering every weight the page uses — 53 KB of WOFF2 in place of the 246 KB of OpenType the site previously loaded, with the full weight range rather than two fixed cuts.

Each webfont is paired with a fallback face that re-metrics Arial to Archivo's proportions (`size-adjust`, `ascent-override`, `descent-override`), so the swap when the webfont lands does not reflow the page. Those ratios were measured from rendered text rather than estimated.

`styles.css` declares its layer order up front — `reset, base, layout, components, sections, motion, responsive` — so a rule's weight comes from where it lives rather than from selector specificity, and the reset sits at zero specificity behind `:where()`. Tokens for surface, brand, text, line, space and motion are declared once; rule colours are derived from the surface colours with `color-mix()` rather than re-picked by hand. Service cards are container queries: each card sizes its own typography from its own width, so the grid can be re-columned without re-tuning type at every breakpoint.

The Caretaker lockup is an SVG-boxed `C.` monogram beside the wordmark, used in the header, footer and introduction. It is built from live text and a stroked SVG rect rather than a flattened image, which is what lets the introduction animate it.

**Animated introduction.** On the first visit in a browsing session the brand assembles: the monogram box draws itself on with a stroke-dash sweep, the `C.` rises behind a mask, the wordmark letters stagger up, a rule expands under a live percentage counter, and two panels split apart to reveal the hero. It is skipped entirely under reduced motion, shown once per tab (`sessionStorage`), dismissable with any click or key, and bounded by both a script-side cap and a `<head>` fallback timer so a slow network can never trap the page behind it.

**Scroll motion.** A single `IntersectionObserver` reveals sections as they enter, with grouped items staggering via a `--d` custom property set from markup order. Section headings rise line by line out of an overflow mask. The hero image holds a slow parallax and scales down on entry, a gold progress rule tracks reading position in the header, and the header itself retracts while reading downward and returns on the way up. Header state, progress and parallax share one `requestAnimationFrame` loop reading scroll position once per frame.

The hero photography is unchanged (same `assets/caretaker-hero.webp` / `caretaker-hero-mobile.webp` files and responsive `<picture>` source-swap), presented full-bleed behind layered gradients as before.

**Progressive enhancement.** Motion is opt-in: `script.js` adds `has-motion` only when the browser supports `IntersectionObserver` and the visitor has not asked for reduced motion, and every reveal rule is scoped to that class. With scripting blocked or motion reduced, all content renders at full opacity and the introduction never displays. The native `<dialog>` mobile menu keeps focus containment, Escape, an inert background and focus return. Switching the motion preference mid-visit tears the reveal system down and releases its listeners.

`script.js` is organised as one module per behaviour behind a shared frame scheduler: every scroll-driven effect (header state, reading progress, hero parallax) registers a task and the scheduler reads `window.scrollY` once per frame, rather than each effect adding its own listener and its own read. Initialisation is idempotent, so a double include cannot double-bind.

## Run locally

Serve the repository root with any static web server. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `index.html` — page content and metadata
- `styles.css` — responsive visual system
- `script.js` — animated introduction, scroll reveals, header/parallax frame loop, mobile navigation dialog and contact shortcut
- `assets/` — optimized hero images, fonts and font licensing

## Assets and content

- The hero is AI-generated illustrative photography, created for this website. It does not depict actual Caretaker personnel or premises, which the `alt` text states. Desktop and mobile WebP crops total approximately 109 KB.
- Leadership uses names and roles from the existing site, without invented portraits.
- Archivo and Archivo Narrow (Omnibus-Type) are distributed as unmodified WOFF2 files under the SIL Open Font License 1.1. The licence is included at `assets/fonts/OFL.txt` and must travel with the fonts.
- The source repository did not contain its referenced company-profile PDF. The profile action now opens an email request instead of a broken download.
- Update the licence details when the stated 2026 validity period changes.
- An inline SVG favicon, Open Graph/Twitter card tags, a canonical URL and `SecurityService` JSON-LD are in place. The canonical and social URLs point at the GitHub Pages address — change them if a custom domain is added. `robots.txt`, `sitemap.xml` and analytics are still not set up.

## Validation

Checked with Playwright (Chromium) at 1440, 1024 and 390 px: no console errors, no page errors, no failed requests. Verified specifically:

- the introduction completes, releases the scroll lock, records its session flag and does not replay on same-tab reload;
- all 54 reveal targets receive their in-view class after scrolling, with none left visually hidden;
- the mobile dialog opens, closes on Escape and on the close button, and returns focus to the toggle;
- the header progress rule tracks scroll, and the header retracts and returns under real wheel input;
- `prefers-reduced-motion: reduce` suppresses the introduction entirely and renders all content;
- with JavaScript disabled, headings and sections render at full opacity and the introduction stays hidden.

The GitHub Actions publish check (`node --check` plus non-empty file checks) passes locally. Manual review on real devices is still recommended before wider release.

## Deployment

The site lives at the repository root, so `index.html` is the entry point for any static host — GitHub Pages, Cloudflare Pages or equivalent.

Published to GitHub Pages by `.github/workflows/deploy-pages.yml` on pushes to `main`. The repository's Pages source is set to **GitHub Actions**, and the workflow uploads the repository root as the artifact. Because `index.html` is now at the root, the branch-based "Deploy from a branch" source (root folder) would also work if that setting is ever changed.

© 2026 Caretaker Security Services Limited.
