#!/usr/bin/env python3
"""Assemble the Caretaker site's flat, static HTML pages.

This is an AUTHORING TOOL, run once by hand when the page count or shared
chrome changes — not a build step in the deploy pipeline and not a runtime
dependency. The committed *.html files are the real artefact: plain static
HTML, exactly as if they had been hand-typed, so the "no build step, serve
the folder as-is" promise in the README stays true for anyone who clones the
repo. Re-run this script and re-commit its output whenever the shared header,
footer, nav or intro markup needs to change across every page at once,
instead of hand-editing eleven files and risking drift between them.

Usage:  python3 tools/build-pages/generate.py
Reads:  tools/build-pages/fragments/<slug>.html  (the <main> content, only)
Writes: <slug>.html at the repository root (index.html for slug "home")
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FRAGMENTS = Path(__file__).resolve().parent / "fragments"

# The custom domain isn't registered yet — every URL here points at the
# address that's actually live. Once www.caretakersecurity.com is registered
# and DNS is pointed at GitHub Pages, this is the one line to change back
# (and CNAME, sitemap.xml and robots.txt need the same swap — see README).
SITE = "https://cartelug.github.io/caretaker-security"
SOCIAL_IMAGE = f"{SITE}/assets/social-card.jpg"

# Every page, in nav order. "home" writes to index.html; every other slug
# writes to "<slug>.html". `nav` is the label shown in the header/footer/
# mobile menu; pages with nav=None are reachable (linked from content and the
# footer) but do not clutter the primary nav — Company Profile and the two
# legal pages fall in that group, matching how most corporate sites treat them.
PAGES = [
    dict(slug="home", path="index.html", nav="Home", nav_num="01",
         title="Caretaker Security — Protection that holds.",
         description="Caretaker Security Services Limited. Uganda Police Force licensed guarding, 24/7 control room monitoring, rapid response, fire safety and cash management across Uganda.",
         og_title="Caretaker Security — Protection that holds.",
         og_description="Disciplined people. Connected operations. Licensed security and risk management across Uganda.",
         hero=True, jsonld=True),
    dict(slug="about", path="about.html", nav="About", nav_num="02",
         title="About Caretaker — Company, vision & values",
         description="Caretaker Security Services Limited: our history, vision, mission, core values and operating strengths, from a company incorporated in Kampala under the Companies Act.",
         og_title="About Caretaker Security Services",
         og_description="A full-service security and risk management company, built on a Total Quality Management approach and local and international operating experience."),
    dict(slug="services", path="services.html", nav="Services", nav_num="03",
         title="Services — Guarding, alarm response, fire safety, cash management",
         description="Manned guarding, alarm and CCTV response, fire safety and cash-in-transit, plus specialist VIP protection, K9 patrols and risk management across Uganda.",
         og_title="Caretaker Security — Every layer, one trusted partner",
         og_description="The full Caretaker service line: manned guarding, alarm and response, fire safety, cash management and specialist protection."),
    dict(slug="operations", path="operations.html", nav="Operations", nav_num="04",
         title="Operations — Control room, supervision & quality assurance",
         description="How Caretaker runs an assignment: a 24/7 control room, hourly radio checks and motorised supervision, and a Total Quality Management approach measured from the Directors down.",
         og_title="Caretaker Security — Ready on site, supported at every step",
         og_description="A connected operation: control room, field supervision and quality assurance behind every officer."),
    dict(slug="compliance", path="compliance.html", nav="Compliance", nav_num="05",
         title="Compliance — Uganda Police Force licence & vetting standards",
         description="Caretaker's Uganda Police Force Category A licence, incorporation and regulator relationship, and the vetting and training every officer completes before deployment.",
         og_title="Caretaker Security — Trust is earned, standards prove it",
         og_description="Licensed, incorporated and regulated in Uganda — with rigorous vetting and continuous training behind every officer."),
    dict(slug="leadership", path="leadership.html", nav="Leadership", nav_num="06",
         title="Leadership — Caretaker's senior management team",
         description="Local and international management experience, guided by a Total Quality Management approach — Caretaker's Chief Executive, Board Chairman, Managing Director and Director of Operations.",
         og_title="Caretaker Security — Experience at the helm",
         og_description="Meet the senior management team behind Caretaker's operations."),
    dict(slug="careers", path="careers.html", nav="Careers", nav_num="07",
         title="Careers at Caretaker Security",
         description="Caretaker Security invests in its people through continuous training and mentoring. No positions are currently advertised, but professional, vetted candidates are welcome to write in.",
         og_title="Careers at Caretaker Security",
         og_description="We invest in our people — continuous training, mentoring and a career path for the next generation of security professionals."),
    dict(slug="profile", path="profile.html", nav=None,
         title="Company Profile — Caretaker Security Services Limited",
         description="Preview or download the full Caretaker Security Services company profile: overview, vision and values, services, licensing and leadership.",
         og_title="Caretaker Security — Company Profile",
         og_description="Preview or download the full company profile document."),
    dict(slug="contact", path="contact.html", nav="Contact", nav_num="08",
         title="Contact Caretaker Security",
         description="Speak to Caretaker Security: call, WhatsApp or write in, or send a security enquiry directly from this page. Offices in Kampala and Wakiso, Uganda.",
         og_title="Caretaker Security — Let's talk security",
         og_description="Tell us what you need to protect. Call, email or send an enquiry directly."),
    dict(slug="privacy", path="privacy.html", nav=None,
         title="Privacy Policy — Caretaker Security",
         description="What information Caretaker Security's website collects, why, how enquiries are handled, and how long information is retained.",
         og_title="Caretaker Security — Privacy Policy",
         og_description="How this website handles the information you share with it."),
    dict(slug="terms", path="terms.html", nav=None,
         title="Terms of Use — Caretaker Security",
         description="The terms governing use of the Caretaker Security Services website: content, intellectual property, accuracy, external links, liability and acceptable use.",
         og_title="Caretaker Security — Terms of Use",
         og_description="The terms governing use of this website."),
]

NAV_PAGES = [p for p in PAGES if p["nav"]]

HEAD_COMMON = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#121613">
<meta name="description" content="{description}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Caretaker Security Services Limited">
<meta property="og:title" content="{og_title}">
<meta property="og:description" content="{og_description}">
<meta property="og:image" content="{social_image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Caretaker Security Services Limited — a licensed security officer on duty in Kampala.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{og_title}">
<meta name="twitter:description" content="{og_description}">
<meta name="twitter:image" content="{social_image}">
<meta name="twitter:image:alt" content="Caretaker Security Services Limited — a licensed security officer on duty in Kampala.">
<link rel="icon" type="image/png" href="assets/brand/favicon.png">
<link rel="apple-touch-icon" href="assets/brand/favicon.png">
<title>{title}</title>
<script>
/* Decide the intro before first paint: once per session, never under reduced motion. */
(() => {{
  try {{
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && !sessionStorage.getItem('caretaker-intro')) {{
      document.documentElement.classList.add('is-loading');
      window.__introFallback = setTimeout(() => {{
        document.documentElement.classList.remove('is-loading');
        document.documentElement.classList.add('is-ready');
      }}, 4000);
    }} else {{
      document.documentElement.classList.add('is-ready');
    }}
  }} catch (_) {{
    document.documentElement.classList.add('is-ready');
  }}
}})();
</script>
{hero_preload}<link rel="preload" href="assets/fonts/saira-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/archivo-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="styles.css">
<script src="script.js" defer></script>
{jsonld}"""

HERO_PRELOAD = """<link rel="preload" href="assets/hero-officer.webp" as="image" media="(min-width: 900px)" fetchpriority="high">
<link rel="preload" href="assets/hero-officer-mobile.webp" as="image" media="(max-width: 899px)" fetchpriority="high">
"""

# Plain triple-quoted string with __SITE__/__IMAGE__ placeholders, not an
# f-string — the JSON body's own braces would otherwise all need escaping.
JSONLD = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SecurityService",
  "name": "Caretaker Security Services Limited",
  "description": "Uganda Police Force licensed Category A guard and escort services, 24/7 alarm monitoring and rapid response, fire safety and cash management.",
  "url": "__SITE__/",
  "image": "__IMAGE__",
  "logo": "__SITE__/assets/brand/caretaker-logo-stacked-dark.webp",
  "telephone": "+256772634848",
  "email": "ctaker10@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Conrad Plaza, 2nd Floor",
    "addressLocality": "Kampala",
    "addressCountry": "UG",
    "postOfficeBoxNumber": "112154"
  },
  "areaServed": { "@type": "Country", "name": "Uganda" },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "hasCredential": "Uganda Police Force licence A0115/2026 — Category A, Guard & Escort"
}
</script>
""".replace("__SITE__", SITE).replace("__IMAGE__", SOCIAL_IMAGE)

SPRITE = """<svg class="sprite" aria-hidden="true" focusable="false"><defs>
<symbol id="i-ne" viewBox="0 0 24 24"><path d="M6 18L18 6M9 6h9v9"/></symbol>
<symbol id="i-down" viewBox="0 0 24 24"><path d="M12 4v16M5 13l7 7 7-7"/></symbol>
<symbol id="i-up" viewBox="0 0 24 24"><path d="M12 20V4M5 11l7-7 7 7"/></symbol>
<symbol id="i-se" viewBox="0 0 24 24"><path d="M6 6l12 12M18 9v9H9"/></symbol>
<symbol id="i-updown" viewBox="0 0 24 24"><path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
</defs></svg>"""

INTRO = """<!-- Animated brand introduction -->
<div class="intro" data-intro aria-hidden="true">
  <div class="intro__panel intro__panel--top"></div>
  <div class="intro__panel intro__panel--bottom"></div>
  <span class="intro__seam" aria-hidden="true"></span>
  <div class="intro__stage">
    <div class="intro__badge">
      <svg class="intro__rings" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="52"/><circle cx="100" cy="100" r="72"/><circle cx="100" cy="100" r="94"/>
      </svg>
      <span class="intro__logo"><img src="assets/brand/caretaker-logo-stacked-dark.webp" alt="" width="900" height="706" fetchpriority="high" decoding="async"></span>
      <span class="intro__scan" aria-hidden="true"></span>
    </div>
    <span class="intro__rule"><span class="intro__fill" data-intro-fill></span></span>
    <span class="intro__meta"><span class="intro__motto">Protect. Secure. Inspire trust.</span><span class="intro__count"><span data-intro-count>0</span>%</span></span>
  </div>
  <span class="intro__foot">Uganda Police Force licensed · Category A</span>
</div>

<a class="skip-link" href="#main">Skip to content</a>
<div class="grain" aria-hidden="true"></div>

<div class="utility-bar">
  <div class="shell utility-bar__inner">
    <span class="status"><i aria-hidden="true"></i>24/7 control room</span>
    <span class="utility-bar__licence">Uganda Police Force licensed · Category A</span>
    <a href="tel:+256772634848">+256 772 634 848 <span aria-hidden="true"><svg class="icon"><use href="#i-ne"/></svg></span></a>
  </div>
</div>"""


def nav_link(page, current_slug):
    href = page["path"]
    current = ' aria-current="page"' if page["slug"] == current_slug else ""
    return f'<a href="{href}"{current}>{page["nav"]}</a>'


def header_block(current_slug):
    links = "".join(nav_link(p, current_slug) for p in NAV_PAGES)
    return f"""<header class="site-header" data-header>
  <span class="site-header__progress" aria-hidden="true"></span>
  <div class="shell header-inner">
    <a class="brand" href="index.html" aria-label="Caretaker Security Services home">
      <img class="brand__logo" src="assets/brand/caretaker-logo-stacked-dark.webp" alt="Caretaker Security Services Limited" width="900" height="706" decoding="async">
    </a>
    <nav class="desktop-nav" aria-label="Primary navigation">
      {links}
    </nav>
    <a class="button button--small header-cta" href="contact.html">Let’s talk security <span aria-hidden="true"><svg class="icon"><use href="#i-ne"/></svg></span></a>
    <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-controls="mobile-menu" aria-expanded="false" data-menu-toggle hidden>
      <span>Menu</span><span class="menu-toggle__icon" aria-hidden="true"><i></i><i></i></span>
    </button>
  </div>
</header>"""


def mobile_menu_block(current_slug):
    rows = []
    for p in NAV_PAGES:
        current = ' aria-current="page"' if p["slug"] == current_slug else ""
        rows.append(
            f'<a href="{p["path"]}"{current}><span>{p["nav_num"]}</span>{p["nav"]}'
            f'<i aria-hidden="true"><svg class="icon"><use href="#i-ne"/></svg></i></a>'
        )
    nav_html = "\n    ".join(rows)
    return f"""<dialog class="mobile-menu" id="mobile-menu" aria-labelledby="menu-title">
  <div class="mobile-menu__top">
    <span class="eyebrow" id="menu-title">Explore Caretaker</span>
    <button class="menu-close" type="button" data-menu-close aria-label="Close navigation menu">Close <span aria-hidden="true"><svg class="icon"><use href="#i-close"/></svg></span></button>
  </div>
  <nav aria-label="Mobile navigation">
    {nav_html}
  </nav>
  <div class="mobile-menu__contact">
    <span class="status"><i aria-hidden="true"></i>Support around the clock</span>
    <a href="tel:+256772634848">+256 772 634 848</a>
    <p>Kampala &amp; Wakiso · Uganda</p>
    <span class="mobile-menu__licence">UPF licensed · Category A</span>
    <p class="mobile-menu__legal"><a href="privacy.html">Privacy</a> &middot; <a href="terms.html">Terms</a> &middot; <a href="profile.html">Company profile</a></p>
  </div>
</dialog>"""


FOOTER = """<footer class="site-footer">
  <div class="shell">
    <div class="footer-top">
      <a class="brand" href="index.html" aria-label="Caretaker Security Services home">
        <img class="brand__logo" src="assets/brand/caretaker-logo-stacked-dark.webp" alt="Caretaker Security Services Limited" width="900" height="706" loading="lazy" decoding="async">
      </a>
      <p>Protect. Secure. Inspire trust.</p>
      <a class="back-top" href="#">Back to top <span aria-hidden="true"><svg class="icon"><use href="#i-up"/></svg></span></a>
    </div>
    <div class="footer-groups">
      <div class="footer-group">
        <span class="footer-group__label">Company</span>
        <nav class="footer-nav" aria-label="Company">
          <a href="index.html">Home</a><a href="about.html">About us</a><a href="leadership.html">Leadership</a><a href="careers.html">Careers</a>
        </nav>
      </div>
      <div class="footer-group">
        <span class="footer-group__label">What we do</span>
        <nav class="footer-nav" aria-label="Services">
          <a href="services.html">Services</a><a href="operations.html">Operations</a><a href="compliance.html">Compliance</a><a href="profile.html">Company profile</a>
        </nav>
      </div>
      <div class="footer-group">
        <span class="footer-group__label">Get in touch</span>
        <nav class="footer-nav" aria-label="Contact">
          <a href="contact.html">Contact us</a><a href="tel:+256772634848">+256 772 634 848</a><a href="mailto:ctaker10@gmail.com">ctaker10@gmail.com</a>
        </nav>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span data-year>2026</span> Caretaker Security Services Limited</p>
      <p>P.O. Box 112154, Wakiso, Uganda</p>
      <p>Licensed &amp; regulated in Uganda</p>
      <p class="footer-legal"><a href="privacy.html">Privacy Policy</a> &middot; <a href="terms.html">Terms of Use</a></p>
    </div>
  </div>
</footer>"""


def build_page(page):
    fragment_path = FRAGMENTS / f"{page['slug']}.html"
    main_html = fragment_path.read_text(encoding="utf-8").rstrip("\n")

    head = HEAD_COMMON.format(
        description=page["description"],
        url=f"{SITE}/{'' if page['slug'] == 'home' else page['path']}",
        og_title=page["og_title"],
        og_description=page["og_description"],
        social_image=SOCIAL_IMAGE,
        title=page["title"],
        hero_preload=HERO_PRELOAD if page.get("hero") else "",
        jsonld=JSONLD if page.get("jsonld") else "",
    )

    doc = f"""<!doctype html>
<html lang="en">
<head>
{head}</head>
<body>

{SPRITE}

{INTRO}

{header_block(page['slug'])}

{mobile_menu_block(page['slug'])}

<main id="main">

{main_html}

</main>

{FOOTER}

</body>
</html>
"""
    # Collapse the 3+ blank lines a template join can leave behind, and make
    # sure the file ends in exactly one newline.
    doc = re.sub(r"\n{3,}", "\n\n", doc).strip("\n") + "\n"
    return doc


def main():
    written = []
    for page in PAGES:
        out = build_page(page)
        out_path = ROOT / page["path"]
        out_path.write_text(out, encoding="utf-8")
        written.append((page["path"], len(out.splitlines())))
    for path, lines in written:
        print(f"{path:<16} {lines:>4} lines")


if __name__ == "__main__":
    main()
