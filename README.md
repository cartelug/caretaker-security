# Caretaker Security Services

Official marketing website for Caretaker Security Services Limited, Kampala, Uganda.

The site presents the company’s core security services, specialist capabilities, operational model, licensing, training standards, leadership and contact information. Company details are retained from the existing website's corrected 2026 profile content.

## Design system

Charcoal, warm gold and ivory, with a narrow display cut (Nimbus Sans Narrow) for headings and Nimbus Sans for body copy. Tokens for surface, brand, text, line, motion and rhythm are declared once at the top of `styles.css`; every component reads from them, so the palette and spacing scale can be retuned in one place.

The Caretaker lockup is an SVG-boxed `C.` monogram beside the wordmark, used in the header, footer and introduction. It is built from live text and a stroked SVG rect rather than a flattened image, which is what lets the introduction animate it.

**Animated introduction.** On the first visit in a browsing session the brand assembles: the monogram box draws itself on with a stroke-dash sweep, the `C.` rises behind a mask, the wordmark letters stagger up, a rule expands under a live percentage counter, and two panels split apart to reveal the hero. It is skipped entirely under reduced motion, shown once per tab (`sessionStorage`), dismissable with any click or key, and bounded by both a script-side cap and a `<head>` fallback timer so a slow network can never trap the page behind it.

**Scroll motion.** A single `IntersectionObserver` reveals sections as they enter, with grouped items staggering via a `--d` custom property set from markup order. Section headings rise line by line out of an overflow mask. The hero image holds a slow parallax and scales down on entry, a gold progress rule tracks reading position in the header, and the header itself retracts while reading downward and returns on the way up. Header state, progress and parallax share one `requestAnimationFrame` loop reading scroll position once per frame.

The hero photography is unchanged (same `dist/assets/caretaker-hero.webp` / `caretaker-hero-mobile.webp` files and responsive `<picture>` source-swap), presented full-bleed behind layered gradients as before.

**Progressive enhancement.** Motion is opt-in: `script.js` adds `has-motion` only when the browser supports `IntersectionObserver` and the visitor has not asked for reduced motion, and every reveal rule is scoped to that class. With scripting blocked or motion reduced, all content renders at full opacity and the introduction never displays. The native `<dialog>` mobile menu keeps focus containment, Escape, an inert background and focus return.

## Run locally

Serve the `dist` directory with any static web server. For example:

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`.

## Structure

- `dist/index.html` — page content and metadata
- `dist/styles.css` — responsive visual system
- `dist/script.js` — animated introduction, scroll reveals, header/parallax frame loop, mobile navigation dialog and contact shortcut
- `dist/assets/` — optimized hero images, fonts and font licensing

## Assets and content

- The hero is AI-generated illustrative photography, created for this website. It does not depict actual Caretaker personnel or premises, which the `alt` text states. Desktop and mobile WebP crops total approximately 109 KB.
- Leadership uses names and roles from the existing site, without invented portraits.
- Nimbus Sans and Nimbus Sans Narrow are distributed as unmodified OpenType files. Their copyright and licensing notices are included in `dist/assets/FONT-LICENSE.txt`.
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

The repository is ready for static hosting. GitHub Pages, Cloudflare Pages or any equivalent service. The published site should use `dist` as its web root.

© 2026 Caretaker Security Services Limited.
