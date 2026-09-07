# Caretaker Security Services

Official marketing website for Caretaker Security Services Limited, Kampala, Uganda.

The site presents the company’s core security services, specialist capabilities, operational model, licensing, training standards, leadership and contact information. Company details are retained from the existing website's corrected 2026 profile content.

The visual system uses charcoal, warm gold and ivory, a typographic Caretaker wordmark, locally served fonts, and responsive layouts for phones, tablets and desktops. A brief animated introduction appears on the first visit in a browser session, with a deadline and reduced-motion support. The native mobile navigation dialog supports keyboard focus, Escape, section links and resizing to desktop.

## Run locally

Serve the `dist` directory with any static web server. For example:

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`.

## Structure

- `dist/index.html` — page content and metadata
- `dist/styles.css` — responsive visual system
- `dist/script.js` — introduction, navigation, section reveals and mobile contact shortcut
- `dist/assets/` — optimized hero images, fonts and font licensing

## Assets and content

- The hero is AI-generated illustrative photography, created for this website. It does not depict actual Caretaker personnel or premises. Desktop and mobile WebP crops total approximately 109 KB.
- Leadership uses names and roles from the existing site, without invented portraits.
- Nimbus Sans and Nimbus Sans Narrow are distributed as unmodified OpenType files. Their copyright and licensing notices are included in `dist/assets/FONT-LICENSE.txt`.
- The source repository did not contain its referenced company-profile PDF. The profile action now opens an email request instead of a broken download.
- Update the licence details when the stated 2026 validity period changes.

## Validation

The rebuild passed JavaScript syntax and whitespace checks, local asset/anchor checks and image decoding. A Node-based interaction harness checked menu state, section focus, desktop resize cleanup, loading failure/deadline behavior, unavailable storage, reduced motion and contact/footer shortcut visibility. Browser-based visual and device testing is still required before release.

## Deployment

The repository is ready for static hosting. GitHub Pages, Cloudflare Pages or any equivalent service. The published site should use `dist` as its web root.

© 2026 Caretaker Security Services Limited.
