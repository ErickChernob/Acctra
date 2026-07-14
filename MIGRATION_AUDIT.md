# ACCTRA — Webflow Export Migration Audit & Plan

**Scope:** Read-only audit of the static Webflow export in this repository. No source files were modified to produce this report. Goal: convert the export into a fully independent static site (HTML/CSS/JS/assets only) deployable to a traditional Apache host (Hostinger, GoDaddy, etc.) via `public_html`, with zero build tooling, zero frameworks, and no visual changes.

**Repo snapshot audited:** 12 HTML pages, 3 CSS files, 1 JS bundle, 281 image files (~135 MB), 4 video files (~29 MB), 11 font files (~312 KB). No `robots.txt`, `sitemap.xml`, or `.htaccess` present. No CMS, ecommerce, membership, or native Webflow form processing in use.

---

## 1. Webflow-specific files, scripts, classes, attributes, metadata, CDN references

**Files**
- `css/webflow.css` — Webflow's generic base framework (icon font as base64 data URI, `.w-container`, `.w-nav-*`, `.w-lightbox`, `.w-richtext`, form/button resets). Identical across all Webflow sites; not ACCTRA-specific.
- `css/demo-acctra.webflow.css` — the actual site design (fonts, layout, components, breakpoints, Webflow-generated utility classes like `opacity-60`, `max-width-42ch`, `incard`).
- `css/normalize.css` — third-party normalize.css v3.0.3 (MIT). Not a Webflow lock-in file; safe to keep indefinitely.
- `js/webflow.js` — Webflow's runtime bundle: nav toggle logic, IX2 interactions engine, lightbox module, bundled `lodash`/`tram.js` helpers, **and this site's own interaction configuration baked directly into the file** (see §7).

**Markup/metadata present on every page**
- HTML comment: `<!-- This site was created in Webflow. https://webflow.com -->` + a "Last Published" timestamp comment.
- `<html data-wf-page="…" data-wf-site="68d197e4e9437fb0b1b4df4a" lang="en">` — Webflow Designer/publish IDs.
- `<meta name="generator" content="Webflow">`.
- Inline bootstrap script adding `w-mod-js` / `w-mod-touch` classes to `<html>`.
- `<link rel="shortcut icon" href="images/favicon.ico">` + `apple-touch-icon` — already local, fine to keep.

**Webflow-specific attributes found in markup**
`data-wf-page`, `data-wf-site`, `data-wf-page-id`, `data-wf-element-id`, `data-w-id`, `data-animation`, `data-collapse`, `data-duration`, `data-easing`, `data-easing2`, `data-wf-ignore`, `data-poster-url`, `data-video-urls`, `data-autoplay`, `data-loop`.

**Webflow-specific CSS classes found in markup** (`w-*` family)
`w-nav`, `w-nav-menu`, `w-nav-button`, `w-nav-brand`, `w-icon-nav-menu`, `w-inline-block`, `w-container`, `w-layout-blockcontainer`, `w-layout-grid`, `w--current`, `w-lightbox`, `w-json`, `w-password-page`, `w-form`, `w-form-fail`, `w-input`, `w-button`, `w-embed`, `w-script`, `w-iframe`, `w-richtext`, `w-background-video`, `w-background-video-atom`, `w-dyn-list`, `w-dyn-items`, `w-dyn-item`, `w-dyn-bind-empty`, `w-dyn-empty`.

**CDN dependency**
- jQuery 3.5.1 loaded from Webflow's own CDN (`d3e54v103j8qbb.cloudfront.net`) on **every one of the 12 pages** — required by `webflow.js`.

**Leftover template artifacts (not ACCTRA content, need attention)**
- `401.html`, `404.html`, `detail_blog-posts.html`, `detail_faq.html` still carry the original Webflow starter-template branding: `<title>Entropy - Webflow HTML website template</title>`, copy like *"More AI models"*, *"Transform Your Business with Cutting-Edge AI Today"*.
- Footer on **all 12 pages** links to `https://webflow.com/templates/designers/lucas-gusso` and `https://templatestudio.webflow.io/` ("Customize") and `https://www.instagram.com/lucas.webflow/` — these are the **template designer's own links**, not ACCTRA's social profiles. They are cosmetic content, not code dependencies, but should be flagged to the client since they currently point off-site to a third party.

---

## 2. Webflow dependencies by interaction type

| Interaction | Present on this site? | Current dependency |
|---|---|---|
| Mobile navigation | Yes (all 12 pages) | `webflow.js` `.w-nav` component + `data-collapse/-duration/-easing` attributes; open/close breakpoint behavior baked into `webflow.css`. |
| Dropdown menus | **Not used anywhere** (`.w-dropdown` = 0 matches) | N/A |
| Tabs | **Not used anywhere** (`.w-tabs` = 0 matches) | N/A |
| Sliders | **Not used anywhere** (`.w-slider` = 0 matches) | N/A |
| Accordions | Only inside the two **orphaned, unlinked** CMS template pages (`detail_faq.html`); not used in real content | N/A for live site |
| Scroll interactions | Yes — extensive, on `index`, `quienes-somos`, `servicios`, `infraestructura`, `proyectos` | IX2 `SCROLL_INTO_VIEW` triggers → fade/slide reveal animations, driven entirely by `webflow.js` |
| Hover effects | Yes (buttons) | Mostly plain CSS `:hover` in `demo-acctra.webflow.css`; a small number (2) are IX2 `MOUSE_OVER`/`MOUSE_OUT` triggers for scale/grow button effects |
| Page-load animations | Yes | IX2 "preset" fade-in sequences + an inline FOUC-prevention `<style>` block (index.html only) that force-hides specific `data-w-id` elements until JS runs |
| Responsive behavior | Yes | Pure CSS media queries (`991px`/`767px`/`479px`/`min-width:768px`) — **no JS dependency** for layout itself, only for the nav toggle |
| Lightbox gallery | Yes — `proyectos.html` only (7 galleries / 14 `w-json` blocks) | `webflow.js` lightbox module; full-resolution popup images currently point to Webflow's CDN, not local files (see §4) |
| Background video | Yes — `index.html` hero | Native HTML5 `<video autoplay loop muted playsinline>`; Webflow only adds cosmetic wrapper markup (`data-wf-ignore`) — **does not require webflow.js to play** |

---

## 3. External dependencies

- **Fonts:** Satoshi, fully self-hosted as `.woff2` in `/fonts` — no Google Fonts or other font CDN. ✅ No migration needed.
- **Images:** Local in `/images`, **except**: (a) all `og:image` meta tags point to `cdn.prod.website-files.com`, and (b) the `proyectos.html` lightbox JSON blocks reference full-resolution originals on `cdn.prod.website-files.com` instead of local files.
- **Videos:** Local in `/videos` (mp4 + webm + poster jpg). ✅ No migration needed.
- **JavaScript libraries:** jQuery 3.5.1 from Webflow's CDN (required by `webflow.js`); `webflow.js` itself is already local but is Webflow-authored (bundles lodash + a tween/easing engine + the IX2 interactions engine).
- **Analytics / tracking pixels:** **None found** — no Google Analytics, GTM, Meta Pixel, Hotjar, etc., anywhere in the export. Clean, but also means the client currently has zero visibility into site traffic.
- **Third-party widgets / embedded content:** one Google Maps `<iframe>` embed on `contacto.html` (public embed URL, no API key) — independent of Webflow, will work unmodified on any host.
- **WhatsApp integration:** **Not present in this export.** No `wa.me`, `api.whatsapp.com`, `tel:`, or `mailto:` links exist anywhere. Contact info (two emails, two phone numbers) on `contacto.html` is currently **plain, non-clickable text**. This contradicts the brief's assumption that contact is handled via WhatsApp/external links — flag to the client as a functional gap to close (adding real `tel:`/`mailto:`/`wa.me` links is a trivial, low-risk HTML-only change, but out of scope for this audit-only phase).

---

## 4. Files/resources loaded from Webflow domains or other CDNs

| Domain | Where used | Count | Notes |
|---|---|---|---|
| `cdn.prod.website-files.com` | `og:image`/`twitter:image` on 10 real pages; lightbox `w-json` asset URLs in `proyectos.html` | 38 references | Must be eliminated for full independence |
| `d3e54v103j8qbb.cloudfront.net` (Webflow CDN) | jQuery script tag, all 12 pages | 12 | Must be self-hosted |
| `d3e54v103j8qbb.cloudfront.net` | password-lock icon (`401.html`) | 1 | Page itself is non-functional off Webflow anyway (§7, §10) |
| `d3e54v103j8qbb.cloudfront.net` | CMS placeholder image (`detail_blog-posts.html`, orphaned page) | 1 | Irrelevant if page is dropped |
| `webflow.com`, `templatestudio.webflow.io`, `instagram.com/lucas.webflow` | Footer template-credit/social links, all 12 pages | ~4 links × 12 pages | Not code dependencies — content decision for the client |
| `www.google.com` | Maps iframe embed, `contacto.html` | 1 | Legitimate, keep |

**Good news:** the `/images` folder already contains local, full-resolution copies of nearly all photos used in the `proyectos.html` lightbox (same photography, local filenames like `Foto-1-Transformador-130-MVA-230-KV.jpeg` at multiple `-p-500/-800/-1080/…` sizes up to the original). The lightbox JSON simply isn't pointing at them yet — this is a **repoint, not a re-download**, during the Webflow Decoupling phase.

---

## 5. HTML attribute review

- **Webflow-specific, purely Designer/publish metadata, zero runtime function:** `data-wf-page`, `data-wf-site`, `data-wf-page-id`, `data-wf-element-id`. Safe to remove at any time — nothing in the exported site reads them.
- **Webflow-specific, must remain until functionality is reimplemented:** `data-w-id` (IX2 targets), `data-animation`/`data-collapse`/`data-duration`/`data-easing`/`data-easing2` (nav config), `data-wf-ignore`/`data-poster-url`/`data-video-urls`/`data-autoplay`/`data-loop` (video wrapper), and every `w-*` class. Removing these before custom JS/CSS replaces the behavior will break the mobile nav, scroll animations, and the lightbox.
- **Accessibility / semantic issues to address later (not in this phase):**
  - Headings are implemented as `<div class="heading-2">` etc. instead of real `<h1>`–`<h4>` tags — no real document outline for assistive tech or SEO.
  - Most `<img>` tags (including meaningful project/service photography) use `alt=""`, i.e., are marked purely decorative.
  - `lang="en"` is declared on every page while all visible content is Spanish — should be `lang="es-MX"` or `lang="es"`.
  - Several dead `href="#"` links: the mobile-menu duplicate "Contacto" button, and the footer's "License"/"Style Guide" links.
  - Lightbox trigger links (`<a href="#" class="w-lightbox">`) have no fallback if JS fails to load.
  - No skip-to-content link.

---

## 6. CSS review

- **Webflow-generated utility styles:** `webflow.css` (generic framework, do not hand-edit) and a layer of Designer-generated utility classes inside `demo-acctra.webflow.css` (e.g. `opacity-60`, `opacity-70`, `max-width-30ch`/`-38ch`/`-42ch`/`-50ch`/`-70ch`/`-90ch`, `text-weight-bold`, `text-size-small`). These are used pervasively — treat as part of the design system, not cruft.
- **Duplicate/unused rules:** not exhaustively diffed in this pass (670 rule blocks in `demo-acctra.webflow.css` alone); Webflow exports commonly retain rules for deleted/legacy Designer elements. Recommend a dedicated, read-only "unused selector" scan during the **Cleanup** phase rather than guessing now.
- **Responsive breakpoints found (must be preserved exactly):** `max-width: 991px`, `max-width: 767px`, `max-width: 479px`, `min-width: 768px`. This is Webflow's fixed 4-tier breakpoint system and the entire layout is authored against it.
- **Classes that must NOT be renamed during the fidelity phase:** every class referenced in HTML (layout classes like `.navbar`, `.hero-wrapper`, `.steps-stack-component`, `.footer-component`, `.about-features-grid`, `.banner-wrapper`, etc., and all Webflow combo-classes such as `.w--current`, `.w-inline-block`) — `webflow.js` toggles some of these by exact string at runtime (e.g. `.w--current`), so renaming breaks both CSS and JS.
- **Styles that depend on Webflow JavaScript:**
  - An inline `<style>` block in `index.html` hides three specific `data-w-id` elements below 479px width until `html.w-mod-ix` is present — a Webflow FOUC-prevention shim tied directly to IX2 initialization.
  - Every element carrying inline `style="opacity:0"` (used throughout all animated pages) relies entirely on IX2/webflow.js to fade back in. If `webflow.js` is removed without a replacement, those elements stay permanently invisible.

---

## 7. JavaScript review

- **Essential today:** `js/webflow.js` (nav + IX2 engine + embedded interaction config + lightbox), jQuery 3.5.1 (its hard dependency), and two small inline bootstrap scripts present on every page (touch-detection class toggle) and on `401.html` (password-error display toggle).
- **Unused / dead once off Webflow hosting:** the entire `401.html` password form and its inline error-handling script — it posts to `/.wf_auth`, a Webflow-hosting-only server route that does not exist on Apache.
- **Interactions that must be recreated with custom JavaScript:**
  - Mobile nav open/close toggle.
  - Scroll-into-view fade/slide reveal animations (~94 IX2 events across the site).
  - Hover-triggered scale/grow button effects (2 `MOUSE_OVER`/`MOUSE_OUT` triggers).
  - The `proyectos.html` lightbox (click-to-enlarge, next/prev, close) — 7 galleries.
- **Interactions that can be replaced with CSS only:**
  - Any purely color/opacity hover states currently timed through JS could become plain CSS `:hover`/`transition`.
  - The `.w--current` "active nav link" marking is already static per-page in the HTML (each page's own nav link already carries `w--current` directly) — no runtime logic is actually needed to preserve this, just the class.
- **Scripts that will stop working outside Webflow hosting:** only the `401.html` password form (`action="/.wf_auth"`). Everything else in `webflow.js` (nav, IX2, lightbox) is fully client-side and has no server callback, so it keeps working once self-hosted correctly.
- **IX2 interaction configuration — presence and completeness:**
  Present, and **embedded directly inside `js/webflow.js`** (not a separate JSON file) as a call to `Webflow.require("ix2").init({events:{…}, actionLists:[…], …})`, found inside one of the bundle's internal modules. Cross-checked several `data-w-id` values from the live HTML (e.g. `16b69460-66f0-c83d-2c5f-5e56a35c1393`, `aa42755f-aac4-abbd-e604-8f2924a89a23`) against the JS and found exact matches, confirming this is the real, site-specific configuration (not a generic template stub). It appears **complete**: roughly 94 event definitions, 125 `actionListId` references, and 105 `mediaQueries` breakpoint entries, covering `SCROLL_INTO_VIEW`, `MOUSE_OVER`, `MOUSE_OUT`, `MOUSE_CLICK`, `MOUSE_SECOND_CLICK`, and `MOUSE_MOVE` triggers, with `FADE_EFFECT`, `SLIDE_EFFECT`, `TRANSFORM_SCALE/ROTATE/MOVE`, `STYLE_OPACITY/SIZE/BACKGROUND_COLOR/TEXT_COLOR`, and `GENERAL_*` actions — each with per-breakpoint config, easing/delay/direction values, and `autoStopEventId` chaining. This is a full, non-truncated interaction definition and is the authoritative source to translate into custom JS/CSS during the Interaction Replacement phase.

---

## 8. Internal links & URL structure on Apache

- All internal links use **relative paths with explicit `.html` extensions** (e.g. `href="servicios.html"`) and no leading slash anywhere — confirmed via full-repo grep, zero root-absolute internal paths found. This will work unmodified on Apache at a domain root or in a subdirectory, with no rewriting required.
- No query-string or hash-based routing, no client-side router — a genuine multi-page site, the best case for static Apache hosting.
- Two categories of dead/placeholder links remain: `href="#"` (mobile duplicate "Contacto" button, footer "License"/"Style Guide") and the `401.html` `/.wf_auth` form action.
- `detail_blog-posts.html` and `detail_faq.html` are **not linked from anywhere** in the site (nav, footer, or body content) — confirmed via grep. They are orphaned Webflow CMS collection-template pages left over from the template's original demo content and are not part of the live information architecture.

---

## 9. Metadata / SEO review

- **Titles:** good and consistent on real content pages (`ACCTRA | <Section>`); `401.html`, `404.html`, `detail_blog-posts.html`, `detail_faq.html` still carry the original template's `Entropy -` branding.
- **Meta descriptions:** present on all real pages, but **every page currently shares the exact same description text**, verbatim — a missed on-page SEO opportunity (each page should get a unique, page-specific description). `401`/`404`/orphan pages have empty or irrelevant descriptions.
- **Canonical tags:** **none present on any page.** Should be added once the final production domain is confirmed.
- **Open Graph metadata:** `og:title`, `og:description`, `og:image`, `og:type`, and Twitter Card equivalents are present on every page, but `og:image` points to Webflow's CDN — must become a local, absolute URL once the domain is live.
- **Favicons:** `images/favicon.ico` + `images/webclip.png` (apple-touch-icon), both local — functional, though only two icon sizes are declared (modern best practice adds 192×192/512×512/SVG — optional, Optimization phase only).
- **robots.txt:** **missing** — needs to be created.
- **sitemap.xml:** **missing** — needs to be created, covering the ~10 real content pages (excluding the two orphaned CMS pages and the 401/404 utility pages).
- **404 behavior:** `404.html` exists as a static page, but its "Back to Home" button is a dead `href="#"` link (should point to `index.html`), and it isn't wired to fire automatically — needs an Apache `ErrorDocument 404` directive.
- **Analytics/tracking:** none present anywhere in the export — nothing to migrate, but the client will have zero traffic visibility post-launch unless something is added later (outside this phase's scope).

---

## 10. Deployment issues (Apache / traditional hosting)

- **Relative vs. absolute paths:** consistently relative; safe for `public_html` root deployment as-is.
- **Case sensitivity:** 3 image files use uppercase `.JPG` while the rest of the library uses lowercase `.jpg`/`.jpeg`/`.png` (`f1_2.JPG`, `suministro.JPG`, `Foto-1.-Cambio-de-boquilla-clase-400-KV.JPG`). References match exactly today, so nothing is broken now, but Linux-based Apache is case-sensitive — any future manual replacement/rename of these specific files is a landmine. Recommend normalizing to lowercase during Cleanup.
- **Spaces in filenames:** none found anywhere in the repo. ✅
- **Special/accented characters in filenames:** several original filenames contain accented characters (e.g. `Pruebas-eléctricas-…`, `diagnóstico-…`). This works fine on a UTF-8 Linux filesystem/Apache, but is a known source of corruption when files pass through certain Windows FTP clients or zip tools. Recommend explicitly testing the upload path for these files, or transliterating to plain ASCII during Cleanup for maximum host compatibility.
- **Clean URLs:** not currently used (relies on explicit `.html`); can optionally be layered on later via `.htaccess` rewrite rules without touching the underlying files — not required for a conservative migration.
- **`.htaccess`:** none exists yet. Will be needed for: `ErrorDocument 404` (and a decision on 401), UTF-8 default charset, and optionally forcing `https`/`www` canonicalization once the domain is chosen.
- **`401.html`:** cannot function as a real password gate on any non-Webflow host (its form posts to a Webflow-only server route). Since nothing links to it, recommend either dropping it or, if page-level password protection is genuinely needed, reimplementing it with Apache's own `.htaccess`/`.htpasswd` Basic Auth — a decision for the client, not something to guess at in this phase.

---

## 11. Page-by-page inventory

| Page | Title | Linked from nav/footer? | Notable components |
|---|---|---|---|
| `index.html` | ACCTRA \| Inicio | Yes | Hero, sticky scroll image/video composition (autoplay bg video), 3-step stats block, footer |
| `quienes-somos.html` | ACCTRA \| Quiénes Somos | Yes | Content + scroll animations (18 `data-w-id`, most of any real page) |
| `servicios.html` | ACCTRA \| Servicios | Yes | Services content, scroll animations |
| `infraestructura.html` | ACCTRA \| Infraestructura | Yes | Infrastructure content, scroll animations |
| `proyectos.html` | ACCTRA \| Proyectos | Yes | 7 photo-comparison galleries using the **lightbox** component (14 `w-json` blocks) |
| `contacto.html` | ACCTRA \| Contacto | Yes | Contact info (plain text, no `tel:`/`mailto:`), Google Maps iframe embed |
| `aviso-de-privacidad.html` | ACCTRA \| Aviso de Privacidad | Yes (footer) | Legal text page |
| `codigo-de-etica.html` | ACCTRA \| Código de Ética | Yes (footer) | Legal text page |
| `404.html` | Entropy - Webflow HTML website template | Apache error page (not internally linked) | Static "not found" page; dead "Back to Home" link |
| `401.html` | Entropy - Webflow HTML website template | Not linked (Webflow system page) | Non-functional password form (`/.wf_auth`) |
| `detail_blog-posts.html` | Entropy - | **Orphaned**, not linked anywhere | Empty Webflow CMS collection template, no real content |
| `detail_faq.html` | Entropy - | **Orphaned**, not linked anywhere | Empty Webflow CMS collection template (FAQ accordion), no real content |

---

## 12. Interaction inventory

| Interaction | Where | Must preserve behavior | Current mechanism |
|---|---|---|---|
| Mobile nav open/close | All 12 pages | Yes | `webflow.js` `.w-nav` toggle |
| Scroll-triggered fade/slide reveals | index, quienes-somos, servicios, infraestructura, proyectos (and orphan pages) | Yes | IX2 `SCROLL_INTO_VIEW` (~94 events total) |
| Page-load fade-in of hero/heading elements | index, and others with inline `opacity:0` | Yes | IX2 "preset" load animation |
| Button hover grow/scale | Primary/secondary buttons sitewide | Yes (minor) | 2 IX2 `MOUSE_OVER`/`MOUSE_OUT` triggers + plain CSS `:hover` |
| Lightbox photo gallery (click-to-enlarge, next/prev) | `proyectos.html`, 7 galleries | Yes | `webflow.js` lightbox module + `w-json` config (currently pointing at Webflow CDN images — needs repointing to local files) |
| Autoplay/loop background video | `index.html` hero | Yes | Native `<video autoplay loop muted playsinline>` — no JS dependency |
| Google Maps embed | `contacto.html` | Yes | Standard `<iframe>` embed, host-independent |
| Responsive layout reflow | All pages | Yes | Pure CSS media queries — no JS dependency |
| Password-protected page | `401.html` | **Cannot** be preserved as-is off Webflow | Webflow server-side feature (`/.wf_auth`) — client decision required |

---

## 13. Risk assessment

**High risk**
- Removing/altering `js/webflow.js` or its embedded IX2 config without a verified custom-JS replacement — will break nav, all scroll/hover animations, and the lightbox across every page simultaneously (elements with inline `opacity:0` will stay invisible).
- Lightbox full-resolution images sourced from `cdn.prod.website-files.com` — if that CDN access lapses after leaving Webflow hosting, the "click to enlarge" images in `proyectos.html` break. (Mitigation is low-effort — local copies already exist — but until repointed, this is a live external dependency.)
- `401.html`'s password form silently does nothing on Apache (posts to a nonexistent route) — a correctness risk if anyone ever links to it or the client expects it to work.

**Medium risk**
- jQuery loaded from Webflow's CDN — a single point of external failure for the entire interaction layer; should be self-hosted.
- `og:image` pointing to Webflow's CDN — social share previews will silently break if that CDN becomes unavailable.
- Missing `robots.txt`/`sitemap.xml`/canonical tags — not a functional break, but an SEO/indexing gap at launch.
- Duplicate meta descriptions across every page — SEO quality issue, not a functional one.
- Uppercase `.JPG` filenames mixed with lowercase — fine today, fragile under future manual edits on case-sensitive hosting.
- Accented characters in image filenames — fine on modern Apache/UTF-8, but a known upload/zip corruption risk with some Windows tools.

**Low risk**
- Removing purely cosmetic Webflow metadata (`data-wf-page`, `data-wf-site`, `data-wf-page-id`, `data-wf-element-id`, the "created in Webflow" HTML comments, `<meta name="generator">`) — zero runtime effect, safe whenever convenient.
- Dropping the two orphaned CMS template pages (`detail_blog-posts.html`, `detail_faq.html`) — not linked from anywhere, no inbound risk.
- Fonts, videos, and the vast majority of images — already fully local, no external dependency to remove.
- Accessibility/semantic HTML gaps (div-based headings, generic `alt=""`, `lang="en"` on Spanish content) — real issues, but non-blocking for a "keep it working, keep it identical" migration; appropriate for a later, separate accessibility pass.

---

## 14. Proposed migration plan (conservative, no visual changes, no frameworks/build tools)

1. **Visual preservation** — Establish the current live rendering (all 12 real pages, all breakpoints, hover/scroll/lightbox states) as the fidelity baseline (e.g. reference screenshots) before touching anything, so every later phase can be diffed against it.

2. **Webflow decoupling**
   - Self-host jQuery 3.5.1 locally instead of pulling it from Webflow's CDN; update the 12 `<script src>` references.
   - Repoint the `proyectos.html` lightbox `w-json` `url` fields from `cdn.prod.website-files.com` to the matching local `/images` files (already present at sufficient resolution).
   - Repoint every `og:image`/`twitter:image` meta tag from the Webflow CDN to a local, absolute image URL once the production domain is known.
   - Strip the purely cosmetic Webflow metadata (`data-wf-*`, "created in Webflow" comments, `<meta name="generator" content="Webflow">`).
   - Decide with the client on `401.html` (drop it, or reimplement with Apache Basic Auth) and on the two orphaned CMS pages (drop, or keep unpublished for future reuse).
   - Fix the leftover "Entropy" template branding (titles, meta, footer template-credit links) once the client confirms desired footer content.

3. **Interaction replacement** — Translate the embedded IX2 configuration (§7) into small, hand-written vanilla-JS + CSS: an `IntersectionObserver`-based scroll-reveal script for the fade/slide effects, a plain nav-toggle script for mobile menu, CSS `:hover`/`transition` for button states, and a minimal custom lightbox (or a single small, vetted, dependency-free library) for `proyectos.html`. Validate each replacement against the Phase 1 baseline before removing `webflow.js`.

4. **Cleanup** — Remove `webflow.js` and the `w-*` Webflow classes/attributes only after their replacements are verified; run a read-only unused-CSS/selector scan on `demo-acctra.webflow.css`/`webflow.css` and prune dead rules; normalize the 3 uppercase `.JPG` filenames to lowercase; consider transliterating accented image filenames; fix the dead `href="#"` links; correct `lang="en"` → `lang="es-MX"`.

5. **Testing** — Cross-browser/device pass on all breakpoints (991/767/479px) for nav, scroll animations, hover states, and the lightbox; verify internal links, 404 handling, and the contact page's map embed; validate HTML/CSS.

6. **Optimization** — Add unique per-page meta descriptions, canonical tags, `robots.txt`, `sitemap.xml`; add real `tel:`/`mailto:`/`wa.me` contact links if the client wants clickable contact actions; consider modern favicon sizes; optional: add a privacy-friendly analytics snippet if desired (none exists today).

7. **Packaging and deployment** — Final file tree copied as-is into `public_html`; add `.htaccess` for `ErrorDocument 404`, UTF-8 default charset, and https/www canonicalization; smoke-test the live Apache deployment against the Phase 1 fidelity baseline.

---

*No files were modified as part of producing this report. Implementation should proceed only after this plan is reviewed and approved.*
