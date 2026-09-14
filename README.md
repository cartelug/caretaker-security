# Caretaker Security Services

Official marketing website for Caretaker Security Services Limited, Kampala, Uganda.

The site presents the company’s core security services, specialist capabilities, operational model, licensing, training standards, leadership and contact information. Company details are retained from the existing website's corrected 2026 profile content.

## Design system (v2)

The visual system was rebuilt around an "operations log" concept instead of a generic dark/gold premium template: an off-white "paper" background, near-black ink, and a single alarm-orange accent used sparingly (status dots, the primary call-to-action, small tags) rather than painted across headings. Section data (licence details, deployment stats, service listings) is presented as ledger/manifest rows and a data grid rather than icon cards, set in a monospace type paired with a plain grotesk for headings — closer to an official document or incident log than a marketing brochure. There are no decorative arrow icons, oversized display type, or scroll-triggered reveal animations; content is simply present, like a real record. The licensed Nimbus Sans family (regular/bold) is used for headings and body copy; the previously included Nimbus Sans Narrow display cut has been removed as it's no longer used. The native mobile navigation dialog supports keyboard focus, Escape, section links and resizing to desktop.

The hero no longer uses the AI-generated illustrative photography — the design leans on typography and data instead of a stock-feeling image. The original hero WebP crops remain in `dist/assets/` unused, in case real site photography is added later.

## Run locally

Serve the `dist` directory with any static web server. For example:

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`.

## Structure

- `dist/index.html` — page content and metadata
- `dist/styles.css` — responsive visual system
- `dist/script.js` — sticky header state, mobile navigation dialog and mobile contact shortcut
- `dist/assets/` — optimized hero images, fonts and font licensing

## Assets and content

- The previous hero used AI-generated illustrative photography, which did not depict actual Caretaker personnel or premises. The v2 design no longer displays it; the WebP crops remain in `dist/assets/` unused. See "Design system (v2)" above.
- Leadership uses names and roles from the existing site, without invented portraits.
- Nimbus Sans is distributed as unmodified OpenType files (regular and bold weights only). Its copyright and licensing notice is included in `dist/assets/FONT-LICENSE.txt`.
- The source repository did not contain its referenced company-profile PDF. The profile action now opens an email request instead of a broken download.
- Update the licence details when the stated 2026 validity period changes.
- No favicon, Open Graph share image, structured data (JSON-LD), `robots.txt`/`sitemap.xml`, or analytics are set up yet — a basic inline favicon was added with the v2 rebuild, the rest were out of scope for this pass.

## Validation

The rebuild was checked with Playwright (Chromium) at desktop, tablet and mobile widths: no console or page errors, no failed network requests, working mobile-navigation dialog (open, Escape-to-close, focus return), keyboard skip-link focus, and correct rendering with `prefers-reduced-motion: reduce`. The GitHub Actions publish check (`node --check` plus non-empty file checks) passes locally. Manual review on real devices is still recommended before wider release.

## Deployment

The repository is ready for static hosting. GitHub Pages, Cloudflare Pages or any equivalent service. The published site should use `dist` as its web root.

© 2026 Caretaker Security Services Limited.
