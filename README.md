# Caretaker Security Services

Official marketing website for Caretaker Security Services Limited, Kampala, Uganda.

The site presents the company’s core security services, specialist capabilities, operational model, licensing, training standards, leadership and contact information. Company details are retained from the existing website's corrected 2026 profile content.

## Design system

Charcoal, brass gold and ivory, set in **Archivo** for body copy and **Saira** for display (both SIL OFL 1.1; licences in `assets/fonts/`). Saira carries a width axis as well as a weight axis, and display type is set at `font-stretch: 112%` so its squared, extended letterforms echo the Caretaker wordmark. Both faces ship as single variable files covering every weight the page uses.

The palette is anchored to the brass gold of the shield (`--gold-brand: #9c8442`). Lighter and darker steps exist only so type keeps its contrast on dark and light grounds respectively — the mark colour itself is never altered.

Each webfont is paired with a fallback face that re-metrics Arial to that face's proportions (`size-adjust`, `ascent-override`, `descent-override`), so the swap when the webfont lands does not reflow the page. Those ratios were measured from rendered text rather than estimated.

**The logo** is the real Caretaker artwork, recovered from the company profile PDF. Both supplied variants (black wordmark for light grounds, white for dark) are pixel-aligned, so an exact alpha mask was derived from the light version and applied to either — giving transparent lockups with no white box and no lost wordmark. From those, `assets/brand/` holds a horizontal lockup (shield beside wordmark, for the header and footer where a stacked mark would be illegible), the stacked lockup (used large in the introduction), and the shield on its own. Light and dark variants of each are included.

`styles.css` declares its layer order up front — `reset, base, layout, components, sections, motion, responsive` — so a rule's weight comes from where it lives rather than from selector specificity, and the reset sits at zero specificity behind `:where()`. Tokens for surface, brand, text, line, space and motion are declared once; rule colours are derived from the surface colours with `color-mix()` rather than re-picked by hand. Service cards are container queries: each card sizes its own typography from its own width, so the grid can be re-columned without re-tuning type at every breakpoint.

**Animated introduction.** On the first visit in a browsing session the brand assembles: the stacked logo rises behind a mask and settles, a rule expands under a live percentage counter, and two panels split apart to reveal the hero. It is skipped entirely under reduced motion, shown once per tab (`sessionStorage`), dismissable with any click or key, and bounded by both a script-side cap and a `<head>` fallback timer so a slow network can never trap the page behind it.

**Atmosphere.** Gold accents in display type are clipped to a brushed metallic gradient rather than filled flat, with a solid-colour fallback behind `@supports`. The hero and contact sections carry a pointer-tracked warm glow, the hero is framed by tactical corner brackets and a draining scroll filament, a marquee band of services runs between hero and page, service cards carry oversized generated index numerals, and the operations console runs a live radar sweep. Pointer effects are gated on `(hover: hover) and (pointer: fine)`, so touch and keyboard users get the static composition.

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
- `assets/` — brand lockups (`brand/`), leadership portraits (`team/`), field photography (`field/`), hero images, fonts and the company profile PDF

## Assets and content

- Brand artwork, leadership portraits and field photography were extracted from `Caretaker_Company_Profile_V9_Corrected.pdf` and are the company's own images. Portraits were mapped to names by their coordinates on the profile's management page rather than by guesswork.
- The hero remains AI-generated illustrative photography and does not depict actual Caretaker personnel, which its `alt` text states. Everything in "In the field" and "Leadership" is real.
- The company profile is served at `assets/caretaker-company-profile.pdf` (8.6 MB). It is the largest asset in the repository; if that matters for cloning, host it externally and point the link there.
- Archivo (Omnibus-Type) and Saira (Omnibus-Type) are distributed as unmodified WOFF2 files under the SIL Open Font License 1.1. The licences are included at `assets/fonts/OFL.txt` and `assets/fonts/OFL-Saira.txt` and must travel with the fonts.
- The Standards section links the profile as a real download; it previously opened an email request because the file was missing.
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
