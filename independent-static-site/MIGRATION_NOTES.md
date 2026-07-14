# ACCTRA — Webflow → Independent Static Site: Migration Notes

This directory (`independent-static-site/`) is a fully independent copy of the
original Webflow export. It uses only standard HTML, CSS, JavaScript, images,
fonts and video — no build tools, no npm, no frameworks, no server-side code.
It is safe to upload directly into an Apache `public_html` directory, or to
open the HTML files locally in a browser.

The original exported project (parent directory) was **not modified**. This
is a parallel, rollback-safe copy per the migration plan in
`MIGRATION_AUDIT.md`.

Production domain assumed throughout (canonical tags, `sitemap.xml`,
`robots.txt`, `.htaccess`, and the localized Open Graph image URL):
**`https://www.acctra.com.mx`** — the live reference site named in this
task. If the real production host differs, update those four places.

---

## 1. Removed Webflow dependencies

- **`js/webflow.js`** — deleted entirely. It is no longer referenced by any
  page. Its nav toggle, IX2 interaction engine and lightbox module were
  reimplemented in plain JavaScript (see §2).
- **jQuery, loaded from Webflow's CDN** (`d3e54v103j8qbb.cloudfront.net`) —
  removed. None of the replacement code needs jQuery.
- **`<!-- This site was created in Webflow -->` / "Last Published" comments**
  — removed from every page.
- **`data-wf-page`, `data-wf-site`, `data-wf-page-id`, `data-wf-element-id`**
  — removed from every page (`<html>` tag and the old 401 form). These were
  pure Webflow Designer/publish metadata with no runtime function.
- **`<meta name="generator" content="Webflow">`** — removed from every page.
- **Webflow lightbox CDN data** — the 14 inline `<script type="application/
  json" class="w-json">` blocks in `proyectos.html` (which pointed the
  lightbox's full-resolution images at `cdn.prod.website-files.com`) were
  removed and replaced with `data-lightbox-group` / `data-lightbox-start`
  attributes read by `js/lightbox.js`, which serves the equivalent images
  already present locally in `/images`.
- **"Entropy" template branding** — `401.html`, `404.html`,
  `detail_blog-posts.html` and `detail_faq.html` still had the original
  Webflow starter template's title/meta copy ("Entropy - Webflow HTML
  website template", "Elevate Your Business with Entropy…"). Replaced with
  ACCTRA-appropriate copy.
- **Template designer's outbound links** — every page's footer had 4 social
  icons linking to `webflow.com/templates/designers/lucas-gusso` and
  `instagram.com/lucas.webflow` (the template author, not ACCTRA), plus a
  "Customize" link to `templatestudio.webflow.io`. These were Webflow/
  template-specific and not ACCTRA's real accounts, so all three were
  neutralized to `href="#"`, preserving the exact visual footer (same icons,
  same layout) without sending visitors to unrelated third parties. **Real
  ACCTRA social media URLs should be substituted here once available** —
  see "Files that must be reviewed manually" below.
- **`401.html`'s password form** — it posted to `/.wf_auth`, a Webflow-
  hosting-only server route that cannot work on any other host. The broken
  form was replaced with a simple static notice; see §6.
- **`css/webflow.css`, `css/normalize.css`, `css/demo-acctra.webflow.css`**
  — kept byte-for-byte unmodified. They contain the actual visual design
  (fonts, layout, colors, breakpoints) and are not Webflow-hosting
  dependencies — only `js/webflow.js` and the CDN links were the runtime/
  hosting dependencies. Removing or rewriting this CSS was out of scope and
  would have risked the "preserve exact visual appearance" requirement.

## 2. Replaced interactions

All interaction data below was extracted directly from the original
`js/webflow.js`'s embedded IX2 configuration (`Webflow.require("ix2").init
({...})`), so the timings/effects match the original site as closely as
plain CSS/JS reasonably allows.

| Interaction | Original mechanism | Replacement |
|---|---|---|
| Mobile nav open/close | `webflow.js` `.w-nav` component | `js/site.js` toggles the same `[data-nav-menu-open]` attribute / `.w--open` class that `webflow.css` already styles — zero new CSS needed. Adds keyboard support (Enter/Space to toggle, Escape to close), closes on outside click and on link click. |
| Scroll-reveal fade/slide-up animations (~33 elements across all pages) | IX2 `SCROLL_INTO_VIEW` events → `fadeIn` / `slideInBottom` / `growIn` action lists | `js/site.js`: an `IntersectionObserver`-driven reveal system, config table keyed by the *same* `data-w-id` values already in the markup (no HTML changes needed). Opacity 0→1 over 1000ms with `cubic-bezier(0.25,1,0.5,1)` (≈ Webflow's "outQuart"), matching per-element delays (150–650ms) pulled from the original config. `slide` adds a 100px→0 translateY; `grow` adds a 0.75→1 scale, matching originals. |
| Homepage hero image collage (scroll-scrubbed) | IX2 "Home Hero Scale" continuous scroll-progress action, `.sticky-images.left/middle/right` | `js/scroll-progress.js`: computes scroll progress through the pinned `.about-hero-interaction` wrapper (`position: sticky` from the original CSS, unchanged) and interpolates width/height/translate between the same keyframes (0/2/10/50/60%) as the original. Disabled below 480px width, same as the original (that breakpoint used a static stacked layout instead). |
| Services page hero image parallax | IX2 "Image Scroll" continuous scroll-progress action | `js/scroll-progress.js`, same keyframe-interpolation technique, scaling `.features-hero-image .image` from 1.3×→1× as it crosses the viewport. |
| Button/card hover effects (primary button ellipse, secondary button icon reveal, contact-page banner underline, "Quiénes somos" phase cards) | IX2 `MOUSE_OVER`/`MOUSE_OUT` class-based triggers | Pure CSS `:hover` + `transition` in `css/site.css`, using the same target elements, values and (approximated) easing curves as the original action lists. No JavaScript needed for any hover effect. |
| Photo lightbox gallery (`proyectos.html`, 7 galleries / 25 unique photos) | `webflow.js` lightbox module + CDN-hosted full-res images | `js/lightbox.js`: a small dependency-free modal (prev/next, Escape/backdrop/× to close, focus return) serving the equivalent images already present locally in `/images`. |
| Background hero video (autoplay/loop) | Native `<video autoplay loop muted playsinline>` | Unchanged — this never depended on `webflow.js`. |
| Google Maps embed (`contacto.html`) | Standard `<iframe>` | Unchanged, host-independent. |
| Responsive layout | Plain CSS media queries | Unchanged. |

**Simplifications / approximations** (documented per rule 11 — fidelity was
prioritized, but a few small simplifications were made rather than
reverse-engineering Webflow's tween engine byte-for-byte):
- IX2's per-breakpoint "scroll offset" trigger point (0% or 15% into
  viewport) was approximated with one shared `IntersectionObserver`
  threshold/rootMargin for all elements, rather than a distinct trigger
  point per element. The visual difference is a few pixels of scroll
  position at most.
- Webflow's named easing curves (`outQuart`, `inOutQuart`, `outExpo`) were
  mapped to their standard CSS `cubic-bezier()` equivalents
  (`cubic-bezier(0.25,1,0.5,1)`, `cubic-bezier(0.76,0,0.24,1)`,
  `cubic-bezier(0.16,1,0.3,1)` respectively) rather than Webflow's exact
  internal bezier tables — visually indistinguishable in practice.
- Two IX2 events unrelated to any element present in the real content pages
  (`a-17` "Navbar - Home Hover Out", referencing element IDs from a
  different, unrelated template context that don't exist in this export)
  were confirmed inert and intentionally not implemented.

## 3. External dependencies that remain (intentionally, per rule 6)

- **Google Maps embed** (`contacto.html`) — public iframe embed, no API key
  visible, does not depend on Webflow. Left untouched.
- **Google Fonts / any font CDN** — none. Fonts (Satoshi) were already
  fully self-hosted as local `.woff2` files before this migration.
- **Analytics / tracking / pixels** — none exist anywhere in this project
  (confirmed during the audit phase: no Google Analytics, GTM, Meta Pixel,
  Hotjar, etc.). Nothing to preserve or remove on that front.
- **WhatsApp integration** — none exists in the exported HTML despite being
  mentioned as the intended contact channel in the original task brief;
  contact info on `contacto.html` is currently plain, non-clickable text
  (two emails, two phone numbers). This was **not** invented/added in this
  pass since it wasn't present in the source to migrate — flagged again
  below as a manual follow-up.

## 4. Localized assets

- **Open Graph / Twitter Card images** — every page's `og:image` and
  `twitter:image` previously pointed at `cdn.prod.website-files.com`.
  Repointed to `https://www.acctra.com.mx/images/AcctraOpenGraph.png`
  (the file already exists locally at `images/AcctraOpenGraph.png`, plus
  responsive variants). Note this uses an **absolute URL** with the assumed
  production domain — required for Open Graph tags to work correctly when a
  link is shared; update if the real domain differs.
- **Favicon / apple-touch-icon** — already fully local
  (`images/favicon.ico`, `images/webclip.png`) before this migration;
  verified present and linked on all 12 pages, no change needed.
- **Lightbox full-resolution photos** (`proyectos.html`) — previously
  loaded from `cdn.prod.website-files.com`; local equivalents already
  existed in `/images` (Webflow's own asset pipeline had generated them as
  responsive `srcset` sizes) and are now used directly — see §1.
- **Fonts, page images, videos** — were already 100% local; no change
  needed.

## 5. A real, pre-existing bug found and fixed along the way

Several `srcset` references on `proyectos.html` used a different Unicode
normalization form (NFD, decomposed accented characters) than the actual
files on disk (NFC, precomposed). Both render identically in a text editor
but are **different byte sequences** — Linux/Apache filesystems are byte-
exact, so these `img srcset` candidates (e.g. "…dieléctrico…", "…Eólico…")
were silently 404ing even in the original Webflow export. Confirmed via a
local Playwright test (see §7) and fixed by normalizing the 17 affected
references in `proyectos.html` to match the on-disk filenames exactly. This
is exactly the "accented filename" deployment risk flagged in
`MIGRATION_AUDIT.md` §10 — worth a broader filename audit if more content
is added later.

## 6. `401.html`

Webflow's password-protect feature has no static-hosting equivalent (it
posted to `/.wf_auth`, a Webflow server route). Since this page is not
linked from anywhere in the site (confirmed in the audit), it was converted
to a simple static "Página protegida" notice with a link back to the
homepage, rather than shipping a password form that silently does nothing.
**If real password protection is needed for some page in the future**, it
should be implemented with Apache's own `.htaccess` + `.htpasswd` Basic
Auth, and `401.html` (already wired as `ErrorDocument 401` in `.htaccess`)
would then display automatically on an auth failure.

## 7. Pages and breakpoints tested

All 12 pages were served locally over HTTP (`python3 -m http.server`) and
driven with Playwright (Chromium) for verification — this is a local
functional/interaction test, **not** a visual diff against the live
`www.acctra.com.mx` reference site, because this environment's network
policy blocks outbound access to that domain (and to arbitrary external
sites in general — confirmed via repeated `403`s from the sandbox's egress
proxy). See "Known limitations" below.

- Checked on every page: zero browser console errors, zero failed network
  requests (aside from the two expected/benign items noted below).
- Desktop (1440×900), tablet (834×1112) and mobile (390×844) viewports
  screenshotted for `index.html`, `servicios.html`, `proyectos.html` and
  `contacto.html`.
- Verified interactively: mobile nav open/close + close-on-link-click,
  scroll-reveal fade-in on load and on scroll, the homepage hero scroll-
  scrubbed collage animation (image width interpolates 30vw → 90vw as
  expected), and the `proyectos.html` lightbox (open, next/prev, Escape to
  close, confirmed images load from local `/images` paths only).
- A real bug was caught and fixed this way (see §5) — a mobile-only bug
  where `scroll-progress.js` and `site.js` fought over the same elements'
  inline styles, leaving the homepage hero images invisible below 480px
  width, was found and fixed via this testing.

Two "failures" observed during testing are expected and not defects:
- `videos/AV_1_1-transcode.mp4` occasionally shows `net::ERR_ABORTED` in
  the browser's network log. This is normal multi-`<source>` `<video>`
  behavior (the browser picks one source and cancels the request for the
  alternate) and exists in the original Webflow markup unchanged.
- The Google Maps iframe on `contacto.html` fails to load in this sandboxed
  test environment (`ERR_TUNNEL_CONNECTION_FAILED`) because outbound access
  to `google.com` is blocked by the sandbox's network policy, not because
  of anything in this migration. It should be verified on a real host/
  network with normal internet access.

## 8. Known limitations / manual review needed

- **Could not visually diff against the live `www.acctra.com.mx` site.**
  This environment cannot reach arbitrary external hosts (confirmed via
  direct `curl`, `WebFetch`, and a Playwright-driven browser — all blocked
  by the sandbox's egress policy). All fidelity work was done from the
  exported code plus the extracted Webflow interaction data, not a live
  pixel comparison. **Recommend a side-by-side visual review against the
  live site before go-live**, especially for: the exact hover/scroll
  easing feel, and the homepage hero scroll-scrubbed animation.
- **Clean URL / canonical-URL assumption.** Webflow's own hosting always
  serves pages without a `.html` extension (e.g. `/quienes-somos`, not
  `/quienes-somos.html`). `.htaccess` was configured to serve both forms
  (so previously-indexed clean URLs keep working), and every page's
  `<link rel="canonical">` currently points at the explicit `.html` URL
  (matching this project's own internal links). **This could not be
  verified against the live site** (see above) — if Google Search Console
  or site analytics show the clean URLs are what's actually indexed,
  consider flipping the canonical tags to the clean form and/or adding a
  301 redirect from `.html` → clean URL in `.htaccess` for full SEO
  consolidation onto one form.
- **Footer social/template-credit links** were neutralized to `href="#"`
  (see §1) rather than removed, to preserve the exact visual footer.
  **Needs a decision from ACCTRA**: either supply real social media URLs to
  fill these back in, or explicitly remove the icons/links if ACCTRA has no
  social presence to link to.
- **No WhatsApp / clickable contact links exist** in the source project
  (see §3) despite being assumed in the original task brief. Contact info
  is plain, unlinked text. Not created in this pass since it wasn't present
  to "migrate" — needs a decision from ACCTRA on whether to add `tel:`/
  `mailto:`/`wa.me` links (a small, low-risk, purely additive change once
  approved).
- **`detail_blog-posts.html` and `detail_faq.html`** are orphaned Webflow
  CMS collection-template pages carrying unrelated placeholder "AI
  solutions" content, not linked from anywhere in the site (confirmed in
  the audit and again here). They were kept in this export (not deleted,
  per the rollback-safe requirement) but marked `noindex, nofollow` and
  excluded from `sitemap.xml`/`robots.txt`. **Recommend deleting them
  outright** once confirmed unnecessary — they are not part of the live
  site's information architecture.
- **Accessibility/semantic HTML gaps** noted in `MIGRATION_AUDIT.md`
  (headings implemented as styled `<div>`s rather than real `<h1>`–`<h4>`
  tags, generic `alt=""` on meaningful content photos, `lang="en"`
  declared while all content is Spanish) were **intentionally left
  untouched** in this pass — rule 1 (preserve exact visual appearance,
  don't redesign) takes priority, and changing heading tags in particular
  risks picking up browser default heading styles that could alter
  spacing. These are real, worthwhile follow-ups for a dedicated
  accessibility pass, not this migration.
- **Two nearly-identical source photos in the `proyectos.html` lightbox**
  (two separate Webflow-CDN uploads of the same subject, e.g. "Foto 1
  Transformador…" vs "Foto 1. Transformador…") both fuzzy-match to the same
  local file after filename normalization. In one gallery this means
  clicking a specific thumbnail may open the lightbox on a visually
  near-identical sibling image rather than that exact photo — cosmetic
  only; the full gallery is still reachable via next/prev.
- **CSS/JS were not minified or aggressively pruned**, per rule 11 — this
  was a fidelity/independence pass, not an optimization pass. A dedicated
  optimization pass (image compression, CSS/JS minification, unused-rule
  removal after a full cross-page/cross-breakpoint usage audit) is a good
  candidate for a follow-up phase.

## 9. Deployment requirements

1. Copy the entire contents of `independent-static-site/` (not the folder
   itself) into the host's `public_html` directory.
2. Confirm `mod_rewrite` and `mod_headers` are enabled on the Apache host
   (used by `.htaccess` for the HTTPS/www redirects, clean-URL support, and
   cache headers — everything degrades gracefully if unavailable, wrapped
   in `<IfModule>`).
3. If the production domain is **not** `www.acctra.com.mx`, update it in:
   `.htaccess` (comment only — the redirect logic is host-agnostic),
   `robots.txt` (`Sitemap:` line), `sitemap.xml` (all `<loc>` values), and
   every page's `<link rel="canonical">` and `og:image`/`twitter:image`
   meta tags.
4. No environment variables, database, or server-side runtime required.
5. Verify the Google Maps embed and hero video load correctly once on real
   hosting with normal outbound internet access (untestable from this
   sandboxed environment - see §7).
