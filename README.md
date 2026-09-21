# Caretaker Security Services

Official marketing website for Caretaker Security Services Limited, Kampala, Uganda.

Eleven pages: a home page introducing the company and its capabilities, then About, Services, Operations, Compliance, Leadership, Careers, a Company Profile preview, Contact (with a call-to-action and an enquiry form), and Privacy Policy / Terms of Use. It was a single scrolling page through its first several revisions; it became this site following an internal review that asked for a conventional multi-page structure, a corrected contact email, a proper company domain, and Privacy/Terms pages. Company details are sourced from the company's own profile document, `assets/caretaker-company-profile.pdf`.

## Design system

Charcoal, brass gold and ivory, set in **Archivo** for body copy and **Saira** for display (both SIL OFL 1.1; licences in `assets/fonts/`). Saira carries a width axis as well as a weight axis, and display type is set at `font-stretch: 112%` so its squared, extended letterforms echo the Caretaker wordmark. Both faces ship as single variable files covering every weight the page uses.

The palette is anchored to the brass gold of the shield (`--gold-brand: #9c8442`). Lighter and darker steps exist only so type keeps its contrast on dark and light grounds respectively — the mark colour itself is never altered.

Each webfont is paired with a fallback face that re-metrics Arial to that face's proportions (`size-adjust`, `ascent-override`, `descent-override`), so the swap when the webfont lands does not reflow the page. Those ratios were measured from rendered text rather than estimated.

**The logo** is the real Caretaker artwork, recovered from the company profile PDF. Both supplied variants (black wordmark for light grounds, white for dark) are pixel-aligned, so an exact alpha mask was derived from the light version and applied to either — giving transparent lockups with no white box and no lost wordmark.

The mark appears **as it was drawn** everywhere it is used: the header, the footer, the introduction and the share card all carry the stacked lockup at its native 900 × 706 proportion, never a reconstruction or a re-set wordmark. The header is sized around it (`min-height: 116px`, dropping to 92 and 78) so the "SECURITY SERVICES LIMITED" line under the wordmark stays legible rather than being squeezed to fit a shallow bar; `scroll-padding-top` tracks those heights so anchored sections still clear it. `assets/brand/` also keeps a horizontal lockup and the shield on its own, in light and dark variants, for contexts a stacked mark cannot serve; the site itself no longer uses them. The favicon and Apple touch icon are the shield on brand ink, and the `SecurityService` JSON-LD names the stacked lockup as the organisation's `logo`.

`styles.css` declares its layer order up front — `reset, base, layout, components, sections, motion, responsive` — so a rule's weight comes from where it lives rather than from selector specificity, and the reset sits at zero specificity behind `:where()`. Tokens for surface, brand, text, line, space and motion are declared once; rule colours are derived from the surface colours with `color-mix()` rather than re-picked by hand. Service cards are container queries: each card sizes its own typography from its own width, so the grid can be re-columned without re-tuning type at every breakpoint.

**Animated introduction.** On the first visit in a browsing session the brand assembles in stages: range rings pulse outward, a gold scan line travels up the badge wiping the lockup into view behind it, a rule expands under a live percentage counter, and a gold seam flares as two panels split apart to reveal the hero. It is skipped entirely under reduced motion, shown once per tab (`sessionStorage`), dismissable with any click or key, and bounded by both a script-side cap and a `<head>` fallback timer so a slow network can never trap the page behind it.

**Atmosphere.** Gold accents in display type are clipped to a brushed metallic gradient rather than filled flat, with a solid-colour fallback behind `@supports`. The hero and contact sections carry a pointer-tracked warm glow, the hero is framed by tactical corner brackets and a draining scroll filament, a marquee band of services runs between hero and page, service cards carry oversized generated index numerals, and the operations console runs a live radar sweep. The marquee's ends fade into the band's own ink with overlay gradients rather than a CSS mask, because a mask removes the band's background along with the text and lets the ivory page show through at both edges. Pointer effects are gated on `(hover: hover) and (pointer: fine)`, so touch and keyboard users get the static composition.

**Scroll motion.** A single `IntersectionObserver` reveals sections as they enter, with grouped items staggering via a `--d` custom property set from markup order. Section headings rise line by line out of an overflow mask. The hero image holds a slow parallax and scales down on entry, a gold progress rule tracks reading position in the header, and the header itself retracts while reading downward and returns on the way up. Header state, progress and parallax share one `requestAnimationFrame` loop reading scroll position once per frame.

**The hero** is the company profile's own cover photograph. Because it is a portrait frame, the desktop hero is a split composition — headline on the dark left, the officer held at full height in the right column — rather than a landscape crop that would cut the figure to a band. Below 900px the photograph returns to full bleed behind the headline, served from a tighter 3:4 crop.

Its scrim is cut to the copy rather than applied as a flat wash. On the phone layout the text sits in the lower two thirds, so the gradient holds near-opaque from the base to 64% and only then opens onto the officer; above 900px the dark field runs to 44% and feathers into the photograph. The stops were set from measurement, not from eye: the rendered page is captured with the hero text hidden, and each line of type and each icon is scored against the pixels actually behind it (see *Validation*).

**Progressive enhancement.** Motion is opt-in: `script.js` adds `has-motion` only when the browser supports `IntersectionObserver` and the visitor has not asked for reduced motion, and every reveal rule is scoped to that class. With scripting blocked or motion reduced, all content renders at full opacity and the introduction never displays. The native `<dialog>` mobile menu keeps focus containment, Escape, an inert background and focus return. Switching the motion preference mid-visit tears the reveal system down and releases its listeners.

`script.js` is organised as one module per behaviour behind a shared frame scheduler: every scroll-driven effect (header state, reading progress, hero parallax) registers a task and the scheduler reads `window.scrollY` once per frame, rather than each effect adding its own listener and its own read. Initialisation is idempotent, so a double include cannot double-bind. It is entirely page-agnostic — every module guards on the elements it needs and no-ops where they're absent — so the same file runs unmodified on all eleven pages.

## Site structure

Eleven flat HTML files at the repository root, sharing one header, mobile menu, footer and animated introduction:

| Page | Covers |
|---|---|
| `index.html` (Home) | Hero, service capability strip, a short "why Caretaker" and a closing call to action |
| `about.html` | Executive overview, vision/mission/quality statements, the five core values, strengths & international record, and the **In the field** photo gallery (moved here from Home) |
| `services.html` | The four core services in full, the technology strip (CCTV, access control, electric fences…) and the specialist protection list |
| `operations.html` | The control-room console, the Deploy → Verify → Respond process, and a quality-assurance note |
| `compliance.html` | The Uganda Police Force licence, incorporation and regulator detail, and the vetting/training checklist |
| `leadership.html` | The four leadership portraits and titles |
| `careers.html` | An honest "no positions currently advertised" page inviting speculative applications — there is no fabricated job listing |
| `profile.html` | An inline PDF preview of the company profile, plus download |
| `contact.html` | Offices, phone and email, and a client-side enquiry form |
| `privacy.html` / `terms.html` | Plain-English policy pages (see *Privacy & Terms*, below) |

Home carries the only hero and the only full-page motion sequence's `data-hero-item`s; every other page opens on a `.page-hero` (eyebrow, `<h1>`, one or two lede paragraphs) and most close on a shared `.page-cta` band. About's core-value and strengths content, Compliance's incorporation and regulator facts, and Careers' copy are all drawn directly from the company profile PDF — nothing about the company itself is invented.

### The page generator

The eleven files are **not** hand-duplicated. `tools/build-pages/generate.py` is a small, dependency-free Python script that owns the shared chrome — the `<head>` block, the SVG icon sprite, the intro preloader, the header and its navigation, the mobile menu, and the footer's three link groups — and stitches it around each page's own content, which lives as a plain HTML fragment in `tools/build-pages/fragments/<slug>.html` (the `<main>` content only). Run it after changing anything shared across pages:

```bash
python3 tools/build-pages/generate.py
```

This is an **authoring tool, not a build step** — it runs once by hand, and its output (the eleven `*.html` files) is committed as ordinary static HTML. Nothing in the deploy pipeline or the "run locally" instructions below depends on Python, Node or any templating at all; a page is a page, exactly as if it had been typed by hand. Regenerate and recommit whenever the shared header, footer, nav list or intro markup needs to change everywhere at once, rather than hand-editing eleven files and risking drift between them. A content-only change (new paragraph, new list item) is still made by editing the page's own fragment and re-running the generator, or, if that feels like overhead for a one-line fix, by editing the generated `*.html` file directly — the two are meant to be interchangeable, since the generator's output is never touched by tooling afterward.

### Navigation

The header nav carries eight destinations (Home, About, Services, Operations, Compliance, Leadership, Careers, Contact) plus the "Let's talk security" button — Company Profile and the two legal pages are reachable from the footer, from in-page links, and from the mobile menu's small legal line, rather than crowding the primary nav. The current page is marked with `aria-current="page"` and stays visibly underlined rather than only lighting up on hover. The mobile dialog lists the same eight items as a numbered list; at eight items it now scrolls within its own panel rather than shrinking the type further to force a fit.

### Privacy & Terms

Both pages answer the specific questions raised in the internal review rather than reading as generic boilerplate. Privacy states plainly what's true of this site: no server, no database, no cookies, no analytics — the only information Caretaker ever receives is what a visitor types into the enquiry form or sends by email, and that goes straight to a personal inbox via `mailto:`, never through anything this website controls. Terms covers the six topics asked for (content, IP, accuracy, external links, liability, acceptable use) in plain English scoped to a marketing site, not a SaaS product.

### The enquiry form

`contact.html` adds a form with no backend to send to — GitHub Pages is static hosting. It works two ways at once: the `<form>`'s own `action="mailto:…" method="post" enctype="text/plain"` gives it a native, no-JavaScript-required submission path (imperfect across browsers, but functional), and `script.js`'s `createEnquiryForm()` intercepts the submit to build a cleaner, consistently-encoded `mailto:` link from the same fields and tell the visitor what just happened. Either way, nothing the visitor types is transmitted to or stored by this website; it only ever leaves through their own email client, matching what the Privacy Policy says.

## Run locally

Serve the repository root with any static web server. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `index.html`, `about.html`, `services.html`, `operations.html`, `compliance.html`, `leadership.html`, `careers.html`, `profile.html`, `contact.html`, `privacy.html`, `terms.html` — the eleven pages, generated (see *The page generator*) but committed as plain static HTML
- `styles.css` — responsive visual system, shared by every page
- `script.js` — animated introduction, scroll reveals, header/parallax frame loop, mobile navigation dialog and the enquiry-form mailto composer; page-agnostic
- `assets/` — brand lockups (`brand/`), leadership portraits (`team/`), field photography (`field/`), hero images, generated service/process imagery (`service/`, `process/`), the share card, fonts and the company profile PDF
- `CNAME` — the custom domain for GitHub Pages (`www.caretakersecurity.com`)
- `robots.txt`, `sitemap.xml` — crawler access and the eleven-page sitemap
- `tools/build-pages/` — `generate.py` and the per-page content fragments it assembles into the eleven HTML files
- `tools/social-card.html` — the share card's source; screenshot it at 1200 × 630 to regenerate `assets/social-card.jpg`
- `tools/image-pipeline/` — the grade and logo-composite passes applied to the generated service and process imagery

## Assets and content

- Brand artwork, leadership portraits and field photography were extracted from `Caretaker_Company_Profile_V9_Corrected.pdf` and are the company's own images. Portraits were mapped to names by their coordinates on the profile's management page rather than by guesswork.
- The hero, the leadership portraits and the six frames in **In the field** are the company's own photographs. The four service-card images (`assets/service/`) and the three process-step images (`assets/process/`) are **generated illustrations** — see below.
- The company profile is served at `assets/caretaker-company-profile.pdf` (8.6 MB). It is the largest asset in the repository; if that matters for cloning, host it externally and point the link there.
- Archivo (Omnibus-Type) and Saira (Omnibus-Type) are distributed as unmodified WOFF2 files under the SIL Open Font License 1.1. The licences are included at `assets/fonts/OFL.txt` and `assets/fonts/OFL-Saira.txt` and must travel with the fonts.
- The Compliance page links the profile as a real download, and `profile.html` previews it inline; both previously opened an email request because the file was missing.
- Update the licence details when the stated 2026 validity period changes.
- A favicon and Apple touch icon, Open Graph/Twitter card tags (per page), a canonical URL and `SecurityService` JSON-LD (on Home) are in place. `robots.txt` and `sitemap.xml` list all eleven pages. Analytics is still not set up.
- **Contact email.** The site used `ctaker@gmail.com` through its earlier revisions — it matched the company profile PDF, but an internal review flagged it as the wrong inbox and named `ctaker10@gmail.com` as correct. Both the site and the PDF now use `ctaker10@gmail.com`; the change was made on that review's authority, not verified independently, so confirm it's actually monitored before relying on it for live enquiries.
- **Domain.** The canonical, Open Graph and JSON-LD URLs, and the PDF's own "website" line, now read `www.caretakersecurity.com` rather than the GitHub Pages address, and a `CNAME` file requests that domain from GitHub Pages. **This only works once the domain is registered and its DNS points at GitHub Pages** — neither has been done from here. To finish it: register the domain, add a `CNAME` record for `www` pointing at `cartelug.github.io` (or follow [GitHub's custom-domain guide](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site) for an apex domain instead), then in the repository's **Settings → Pages**, confirm the custom domain is detected and turn on **Enforce HTTPS** once it verifies. Until then the site keeps working normally at the `cartelug.github.io` address — nothing about the domain switch can break the existing deployment.
- The company profile PDF's own "WEBSITE" and "EMAIL" lines (page 15) were edited in place with PyMuPDF — a redaction over the old text, Helvetica set at the original size and colour in its place — rather than by regenerating the document, since it's a small, contained correction; the swap is visually seamless against the panel's dark background. Every other page's text is byte-identical to before, confirmed by diffing extracted text page by page.
- The share card (`assets/social-card.jpg`, 1200 × 630) is branded: the stacked lockup, the headline and the officer, composed in the site's own typography. It is served as JPEG because WebP Open Graph images are still unreliable on LinkedIn and several crawlers; `assets/social-card.webp` carries the same artwork so links shared before the change resolve to the new card rather than a missing file. It is rendered from `tools/social-card.html` through the site's own fonts and colour tokens, not drawn by hand — regenerate it by screenshotting that page at 1200 × 630.

## Generated imagery

Seven frames in the explanatory sections — the four service cards and the three
process steps — are generated rather than photographed. They illustrate what a
service *is*; they do not assert that a particular event happened.

That line is deliberate and load-bearing. **In the field** is captioned
"Photographs from Caretaker operations, training and commissioning across
Uganda", which is a documentary claim, and every image in it is real. No
generated frame goes there, none depicts a named person, a real client site, a
dated event or a certificate, and no alt text claims otherwise.

Each frame was generated with a deliberately **blank** uniform — no emblem, no
patch, no lettering — because image models render logos as mush. Two scripted
passes finish them, kept in `tools/image-pipeline/` as a record of how:

- `grade.py` puts the set into one grade. Measuring the row first showed the
  real mismatch was colour temperature, not level: one card sat at +17 highlight
  warmth against another's +49, which is what makes two frames look like two
  different shoots. So it offsets the black point to the site's ink rather than
  stretching the histogram (a stretch flattens contrast the frames already
  have), nudges level only where a frame is an outlier, and spends the effort
  aligning warmth. Night interiors stay darker than daylight corridors, because
  that difference is real. Across the four cards this took the warmth spread
  from 32 points to 12 and the median spread from 57 to 23, with contrast
  unchanged.
- `badge.py` composites the genuine chest mark from `assets/brand/`. It is
  multiplied into the fabric rather than pasted over it, so the shirt's own
  shading and creases fall across it, then blurred to the local focus of each
  frame. Placement is per-officer and set from the company's own photographs:
  the mark sits on the wearer's left chest, about a pocket wide, clear of the
  button placket.

Both scripts expect the original renders alongside them and are included for
provenance, not as part of the build.

Before any of that, the frames were swept for the defects that betray
generation: finger counts on every visible hand, and any lettering that crept
onto an ID card, a sign or a vehicle. This set came back clean on both — the ID
cards, the extinguisher service tag, the occurrence books and the clipboard site
plan are all blank or abstract by design.

## Validation

Checked with Playwright (Chromium) across all eleven pages at 1440, 1024 and 390 px — 33 page loads, zero console errors, zero page errors, zero failed requests, zero broken images, zero horizontal scroll, and exactly one `<h1>` per page in every case. Verified specifically:

- the introduction completes, releases the scroll lock, records its session flag and does not replay on same-tab reload — checked on Home, where it's most visible, and confirmed present (governed by the same shared `<head>` script) on every other page;
- every reveal target on every page receives its in-view class after scrolling, with none left visually hidden — 140 targets total across the eleven pages at 1440 and 1024px (139 at 390px, where one link is deliberately `display: none` below 899px and so isn't counted), all shown at every width;
- the header's current-page link carries `aria-current="page"` and a persistent underline on all eight primary-nav pages, and is correctly absent on the three pages (Company Profile, Privacy, Terms) that live outside the primary nav by design;
- the mobile dialog opens, lists all eight nav destinations, and closes on Escape;
- the enquiry form's `mailto:` composition was verified directly — filled with name, contact, service and a message containing quotes, an ampersand and a line break, the resulting URL decodes to a clean, correctly-encoded subject and body with every field on its own line;
- `prefers-reduced-motion: reduce` suppresses the introduction entirely and renders all content;
- with JavaScript disabled, headings and sections render at full opacity and the introduction stays hidden;
- every line of hero type and every hero icon on Home clears WCAG AA against the photograph behind it at 1440, 900, 768 and 390 px. Contrast is measured, not judged: the page is captured twice — once composited, once with the hero foreground hidden — and each glyph run is scored against the background pixels under its own `Range` rectangle. Element boxes are not used, because a full-width box includes empty space over the bright side of the photograph and reports failures that are not there. The gold eyebrow and its rule measure 5.7:1 on the phone layout and 8.0:1 on the desktop split; the metallic `holds.` is scored from an exact glyph mask (the composited capture differenced against the blank one) because `background-clip: text` leaves its computed colour transparent, and reaches 6.1:1 at the darkest point of its gradient;
- the logo renders at its native aspect ratio in the header, footer and introduction at every breakpoint, and sits inside the header box without clipping;
- every internal `href` across all eleven pages was checked against the set of files that actually exist — none dangle.

One thing caught and fixed during this pass, not by the automated checks but by a manual full-page capture: the home page's service-capability tiles used a filled grid background as a hairline-gap trick (the same visual effect `.service-grid`'s `border-left` achieves elsewhere, done differently). Because the tiles animate in from `opacity: 0`, that shared fill was briefly visible across the whole row during the reveal transition rather than staying to the 1px gaps — a real, if brief, visual flash for a visitor scrolling at normal speed. Rebuilt to use per-tile borders instead, matching the pattern already used everywhere else on the site.

The GitHub Actions publish check (`node --check` plus a non-empty-file check on every page, `styles.css`, `script.js`, `CNAME`, `robots.txt` and `sitemap.xml`) passes locally. Manual review on real devices is still recommended before wider release.

## Deployment

The site lives at the repository root as eleven flat HTML files, so `index.html` is the entry point for any static host — GitHub Pages, Cloudflare Pages or equivalent.

Published to GitHub Pages by `.github/workflows/deploy-pages.yml` on pushes to `main`. The repository's Pages source is set to **GitHub Actions**, and the workflow uploads the repository root as the artifact. Because `index.html` is at the root, the branch-based "Deploy from a branch" source (root folder) would also work if that setting is ever changed. The workflow's trigger `paths:` list matches any `*.html` file at the root plus `styles.css`, `script.js`, `assets/**`, `CNAME`, `robots.txt` and `sitemap.xml`, so a push touching only one of the newer pages still deploys — a page added outside that pattern (nested in a folder, say) would need the workflow updated too.

A `CNAME` file requests `www.caretakersecurity.com` as the custom domain; see the **domain** note under *Assets and content* for what's still needed to make that live. Until then, the site is reachable at its GitHub Pages address.

© 2026 Caretaker Security Services Limited.
