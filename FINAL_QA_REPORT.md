# ACCTRA — Final QA Report (Production Readiness)

Scope: `public_html_ready/` (and the identical `public_html_ready.zip`),
the deployable subset of `independent-static-site/`. This report covers
the production-readiness review requested after the initial Webflow →
static conversion (see `independent-static-site/MIGRATION_NOTES.md` for
that earlier phase's own record).

**Testing method:** All pages were served locally over plain HTTP
(`python3 -m http.server`) and driven with a headless Chromium browser via
Playwright, for both automated interaction testing and full-page
screenshots at the requested breakpoints. This environment's network
policy blocks outbound access to arbitrary external domains (confirmed via
direct `curl`, `WebFetch`, and a Playwright-driven browser — all return
`403`/tunnel failures for `www.acctra.com.mx`, `google.com`, etc.), so a
live pixel-diff against the original Webflow-hosted site or a live test of
the Google Maps embed was **not possible** from this environment. Where
that limits verification, it's called out explicitly below.

---

## 1. Pages tested

All 10 pages that ship in `public_html_ready/`:

`index.html`, `quienes-somos.html`, `servicios.html`,
`infraestructura.html`, `proyectos.html`, `contacto.html`,
`aviso-de-privacidad.html`, `codigo-de-etica.html`, `404.html`, `401.html`.

(`detail_blog-posts.html` and `detail_faq.html` were intentionally
**excluded** from the production package — see §9.)

## 2. Viewports tested

Full-page screenshots were captured for every page above at all six
requested widths: **1440px, 1280px, 1024px, 768px, 480px, 375px**
(each scrolled through in steps first so every scroll-reveal animation had
actually completed before capture, not just a snapshot of the initial
paint). Reviewed for: typography/line-height/text wrapping, container
widths, image rendering, navbar/mobile-menu behavior at the breakpoint
where it switches (991px, unchanged from the original CSS), card/grid
layout, and footer layout. No layout defects were found at any tested
breakpoint. One real bug **was** caught this way and fixed (see §9) — a
mobile-only issue where the homepage hero images stayed invisible below
480px width, caused by two of this project's own scripts overwriting each
other's inline styles.

## 3. Interactions tested

- Mobile nav: open, close-on-link-click, close-on-outside-click, close on
  `Escape`, keyboard open/close via Enter/Space on the hamburger button.
- Scroll-reveal fade/slide-up animations: verified an above-fold element
  reaches full opacity on load, and a below-fold element reaches full
  opacity after scrolling to it.
- Homepage scroll-scrubbed hero collage: verified the middle image's width
  interpolates from `30vw` to `90vw` as the page scrolls through the pinned
  section, matching the original's keyframe data.
- `proyectos.html` lightbox: open on click, image is served from a local
  path (not any external CDN), `next` advances to the correct image, and
  `Escape` closes it and returns focus.
- Every internal link and every internal asset reference (`href`, `src`,
  `srcset`) across all 10 shipped pages was checked programmatically
  against the actual files present — **zero broken internal references**.
- Console/network check on every page: zero JavaScript console errors,
  zero failed asset requests, except two **expected, non-defect** items
  present on every test run (not introduced by this migration):
  - `videos/AV_1_1-transcode.mp4` occasionally logs `net::ERR_ABORTED` —
    standard multi-`<source>` `<video>` browser behavior (the browser
    picks one source and cancels the fetch for the alternate), harmless.
  - The `contacto.html` Google Maps `<iframe>` fails to load
    (`ERR_TUNNEL_CONNECTION_FAILED`) **only** in this sandboxed test
    environment, which blocks all outbound traffic to `google.com`. The
    markup itself is untouched from the original and should be verified
    on the live host with normal internet access (see §11).

## 4. Broken links / issues corrected

| Issue | Where | Fix |
|---|---|---|
| Mobile-menu "Contacto" button linked to `href="#"` (dead end) on every page | All 12 pages (10 shipped) | Repointed to `contacto.html`, matching its working desktop twin |
| `srcset` on 6 images in `proyectos.html` used decomposed-Unicode (NFD) accented filenames that didn't byte-match the actual NFC-normalized files on disk, causing silent 404s | `proyectos.html` (17 individual `srcset` candidates across 6 images) | Normalized all 17 references to match the on-disk filenames exactly; verified 0 remaining unresolved references |
| Mobile-only bug: `scroll-progress.js`'s hero-collage reset (at ≤479px) was clearing the `opacity`/`transform` that the separate scroll-reveal system needed to fade the same images in | `js/scroll-progress.js` (affects `index.html` on phones) | Scoped the reset to only the `width`/`height` properties that script actually owns |
| 5 elements on the two orphaned template pages had `opacity:0` with no script ever set to reveal them (permanently invisible content) | `detail_blog-posts.html`, `detail_faq.html` | Added their `data-w-id` values to the reveal config with their original delay/effect values, pulled from the source Webflow interaction data — moot for the shipped package since these two pages are excluded from it, but fixed at the source in `independent-static-site/` too |

No external links, `tel:`/`mailto:`/WhatsApp links, dropdowns, tabs,
sliders, or accordions exist anywhere in this project to test (confirmed
absent in the original audit and reconfirmed here) — see §11 for the
WhatsApp/contact-link gap, which is a content decision, not a bug.

## 5. Webflow JS runtime dependency verification — **fully removed**

Searched the entire shipped package (`public_html_ready/`) for `webflow`,
`website-files`, `Webflow.push`, `Webflow.require`, `webflow.js`:

- **`js/webflow.js` does not exist in this project at all** — it was
  deleted in the prior migration phase, and no page references it.
- **Zero** calls to `Webflow.push`/`Webflow.require` anywhere (the only
  matches for the word "Webflow" are inside this project's own code
  comments explaining what was replaced and why — not live code).
- `w-nav`, `w-nav-menu`, `w-nav-button`, `w-nav-brand` **class names**
  remain (12 pages × 4 classes) — these are CSS hooks read by
  `css/webflow.css` and this project's own `js/site.js` (which toggles the
  `[data-nav-menu-open]` attribute and `.w--open` class the CSS already
  understands); they are **required**, not a runtime dependency, and
  contain no reference to any Webflow server or script.
- `w-slider`, `w-dropdown`, `w-tab` — **zero occurrences** anywhere in the
  project. These components were never used on this site.
- `w-lightbox` class remains on the `proyectos.html` gallery links —
  cosmetic/CSS-only at this point (base cursor/reset styles from
  `webflow.css`); the actual lightbox **behavior** is fully handled by
  this project's own `js/lightbox.js`, with zero Webflow JS involved.

**Conclusion: this site has no runtime or hosting dependency on Webflow's
JavaScript whatsoever.** It will function identically whether or not
Webflow.com is reachable.

## 6. `w-node-*` / `data-w-id` attribute audit

**`w-node-*` (`id="w-node-..."`, 10 found):**
All 10 are CSS Grid placement selectors, referenced by exact ID in
`css/demo-acctra.webflow.css` (`place-self`, `grid-area` rules controlling
the "Nuestros Valores" card grid on `quienes-somos.html`, and one FAQ item
on the excluded `detail_faq.html`). **All 10 are required** — removing or
renaming any of them would break that grid's layout. None were touched.

**`data-w-id` (interaction identifiers):**

| | Count |
|---|---|
| Total `data-w-id` attribute occurrences in the shipped 10 pages | 72 |
| Unique `data-w-id` values in the shipped 10 pages | 34 |
| Of those, actively driving a working animation (read by `js/site.js`'s reveal system, using the exact delay/effect extracted from the original Webflow interaction data) | **33** |
| Of those, not referenced by any current script | **1** |
| Removed | **0** |

The one unreferenced ID (`6deb3682-e1f7-9f5f-adeb-87fc1448026f`, on the
navbar logo link, present on every page) was individually investigated,
not assumed: cross-checking it against the *original* Webflow interaction
data (extracted from the now-deleted `webflow.js`) showed it had exactly
one associated event even in the original site — a hover-out effect whose
target elements belong to a different, unrelated template context that
was never part of this export. **It was already non-functional on the
original Webflow-hosted site**, not something broken by this migration.
It was left in place rather than stripped, per the instruction to treat
this as optional polish rather than a blocking cleanup — it has zero
visual or functional effect either way.

No blanket find-and-replace was performed on any `data-w-id` or
`w-node-*` attribute; each of the 34 + 10 identifiers was evaluated by
cross-referencing it against both the live CSS/JS and the original
Webflow interaction data before any decision was made.

## 7. Webflow-hosted CDN asset localization — **fully localized**

Searched the entire shipped package's HTML, CSS, and JS (including every
`<meta>` tag, every `url()` in CSS, every `img`/`video`/`source`/`srcset`
attribute) for `website-files.com`, `webflow.io`,
`uploads-ssl.webflow.com`, `assets-global.website-files.com`,
`cdn.prod.website-files.com`, and the Webflow-operated jQuery mirror
`d3e54v103j8qbb.cloudfront.net`. **Zero remaining references anywhere** —
re-confirmed directly against the final ZIP contents (see §12). Full list
of what was found and localized during this and the prior phase:

| Asset | Was | Now |
|---|---|---|
| `og:image` / `twitter:image` (10 pages) | `https://cdn.prod.website-files.com/.../AcctraOpenGraph.png` | `https://www.acctra.com.mx/images/AcctraOpenGraph.png` (file already existed locally at `images/AcctraOpenGraph.png`) |
| `og:image` / `twitter:image` (`401.html`, `404.html`) | A completely unrelated Webflow starter-template image on a different Webflow site's CDN path (leftover "Entropy" template default) | Same local `AcctraOpenGraph.png`, matching the rest of the site |
| `proyectos.html` lightbox full-resolution photos (14 galleries → 25 unique images) | `https://cdn.prod.website-files.com/.../<hash>_<filename>.jpg` | Local files in `images/`, matched to their Webflow-CDN originals by filename (see `independent-static-site/MIGRATION_NOTES.md` for the exact mapping) |
| jQuery 3.5.1 | `https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min...js` (Webflow's own CDN mirror), loaded on all 12 pages | Removed entirely — the replacement JS (`js/site.js`, `js/scroll-progress.js`, `js/lightbox.js`) needs no jQuery |
| `401.html` password-lock icon | `https://d3e54v103j8qbb.cloudfront.net/static/utility-lock....svg` | Removed — the non-functional Webflow password form (which posted to `/.wf_auth`, a Webflow-only server route) was replaced with a static notice; no icon needed |
| Favicon / apple-touch-icon | Already local before this migration (`images/favicon.ico`, `images/webclip.png`) | Unchanged, reconfirmed present and linked on all 10 pages |
| Fonts (Satoshi, all 11 weight/style files) | Already local before this migration | Unchanged |

## 8. Accessibility fixes made this pass

- Added exactly one `<h1>` per page (previously zero real heading tags
  existed anywhere — every heading was a styled `<div>`). Verified this is
  visually risk-free: `demo-acctra.webflow.css` already normalizes
  `h1`-`h6` margins to `0` and matches their font-size/weight/line-height
  to the corresponding `.heading-*` classes, so adding the tag changes
  nothing on screen (confirmed via screenshot comparison before/after).
- Added `role="contentinfo"` and changed the footer's wrapping `<section>`
  to a `<footer>` landmark on all 10 pages (zero visual effect — pure
  semantics).
- Fixed `<html lang="en">` → `<html lang="es-MX">` on all 10 pages (all
  visible content is Spanish).
- Confirmed the mobile-menu button already has (from the prior phase)
  `role="button"`, `tabindex="0"`, `aria-label="Menu"`, and toggling
  `aria-expanded` — full keyboard support (Enter/Space to toggle, Escape
  to close) was already in place and re-verified working.
- Confirmed no `<img>` is missing an `alt` attribute outright (a real
  WCAG failure); many meaningful content photos use `alt=""` (decorative),
  which is pre-existing from the original export. **Not rewritten in this
  pass** — writing accurate descriptive alt text for 100+ project photos
  would mean inventing content not present in the source, which this
  task's instructions explicitly say not to do. Flagged as a recommended
  manual follow-up in §11.
- Deeper heading-hierarchy restructuring (h2/h3 for sub-sections) was
  **not** attempted beyond the one h1 per page — assessed as a real
  improvement but a broader change than "obvious, easily correctable" for
  this pass; each page's sub-heading levels would need individual
  judgment calls best made with sight of the rendered page.

## 9. Production package decisions

- **`detail_blog-posts.html` and `detail_faq.html` excluded from
  `public_html_ready/`.** These are orphaned Webflow CMS
  collection-template pages carrying entirely unrelated "AI solutions"
  placeholder content (leftover from the Webflow starter template this
  site was built on), not linked from anywhere in the site's navigation or
  footer, and already marked `noindex, nofollow`. They remain present in
  `independent-static-site/` (the rollback-safe development copy, per that
  phase's own requirement not to delete anything), but shipping them to a
  live production server serves no purpose and risks a visitor stumbling
  on off-topic filler content by guessing the URL. `robots.txt` was
  updated to drop the now-moot `Disallow` entries for these two files.
- **`401.html` and `404.html` are included** — `404.html` is wired as
  Apache's `ErrorDocument 404`, and `401.html` as `ErrorDocument 401`
  (used only if Basic Auth is ever configured on some page in the
  future — see `independent-static-site/MIGRATION_NOTES.md` §6).
- No `.md` documentation files, no `_migrate.py`/dev scripts, no source
  maps, and no editor/OS junk files (`.DS_Store`, `Thumbs.db`, etc. —
  confirmed absent) ship in `public_html_ready/`.

## 10. Apache / `.htaccess` review

`.htaccess` (see the file itself for full comments) provides:
HTTPS redirect, `www` canonicalization, clean-URL support
(`/quienes-somos` → serves `quienes-somos.html`), `ErrorDocument 404` /
`401`, `Options -Indexes` (no directory listing), gzip/deflate compression,
browser caching (`mod_headers` primary, `mod_expires` fallback for hosts
without `mod_headers`), and three safe security headers
(`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`). Verified
no redirect-loop risk (traced all combinations of http/https × www/non-www
through the rule set — each resolves in at most 2 sequential redirects,
never a cycle). **No Content-Security-Policy header was added** — a
misconfigured CSP could silently block the Google Maps iframe or another
legitimate embed, and this could not be tested against a live Maps embed
from this sandboxed environment; recommended as a follow-up once it can be
verified on the real deployed site.

## 11. Manual checks still recommended (could not be verified from this environment)

- **Live visual comparison against the original `www.acctra.com.mx`.**
  This environment cannot reach that domain (or any external site) at all.
  All fidelity work was done against the exported source code and the
  extracted original Webflow interaction data, not a live pixel diff.
  Recommend a side-by-side check once deployed, especially: font
  rendering/weights on real devices, the exact hover/scroll easing feel,
  and the homepage's scroll-scrubbed hero animation.
- **Google Maps embed on `contacto.html`** — untestable here (sandbox
  blocks `google.com`); verify it loads on the live host.
- **Clean-URL canonical direction** — `.htaccess` supports both
  `/page.html` and `/page`; every canonical tag currently points at the
  `.html` form. If Google Search Console shows the live site was actually
  indexed under the clean-URL form, flip the canonical tags to match (see
  `independent-static-site/MIGRATION_NOTES.md` for detail).
- **WhatsApp / clickable contact links** — none exist in the source
  project despite being assumed in the original migration brief;
  `contacto.html` shows plain, unlinked email/phone text. Not invented in
  this pass since nothing to "migrate" existed — needs an explicit
  decision from ACCTRA on whether to add `tel:`/`mailto:`/`wa.me` links (a
  small, low-risk, purely additive follow-up once approved).
- **Footer social icons** link to `#` (placeholder) rather than a real
  destination — see `independent-static-site/MIGRATION_NOTES.md` §1; they
  previously pointed at the Webflow template designer's own accounts, not
  ACCTRA's, and were neutralized rather than left pointing at an unrelated
  third party. Needs real ACCTRA social URLs, or explicit removal, once
  decided.
- **Image compression** was intentionally **not** performed in this pass
  (~280 images, 135MB). This task's own instructions caution against
  optimization "without verifying every page, state, and breakpoint," and
  no visual-diffing tool against a reference render was available in this
  environment to safely verify lossless results at that volume.
  Recommend a dedicated pass (e.g. Squoosh, ImageOptim) with visual
  spot-checks before/after, as a follow-up — not a blocker for launch.
- **Explicit `width`/`height` attributes** on the ~127 images that lack
  them were likewise not added in bulk, for the same reason (risk of
  aspect-ratio mismatches with `object-fit: cover` containers without
  per-image verification) — flagged as a follow-up performance
  optimization (reduces layout shift), not a blocker.

## 12. Final package verification

- `public_html_ready.zip` was extracted into a clean temporary directory
  and served independently.
- Confirmed `index.html` sits directly at the ZIP root (no nested
  `public_html_ready/` wrapper folder inside the archive).
- Confirmed `.htaccess` is present in the archive (a first packaging
  attempt accidentally excluded all dotfiles via an overly broad zip
  exclusion pattern — caught and corrected before this report).
- Ran the full automated interaction/console-error test suite a second
  time against the extracted copy — identical results to testing the
  source folder directly (only the two expected, non-defect items from
  §3).
- Re-ran the Webflow-CDN-domain search directly against the extracted ZIP
  contents: zero matches anywhere in HTML/CSS/JS/XML/TXT.
- Confirmed no internal link or asset reference across the 10 shipped
  pages points at a missing file.
- 316 files, ~164 MB uncompressed / ~162 MB zipped (image/video assets
  dominate; see §11 on deferred compression).

---

## Summary

| Check | Status |
|---|---|
| Webflow JS runtime dependency | **Fully removed** — `webflow.js` doesn't exist in the project; zero `Webflow.push`/`Webflow.require` calls anywhere |
| Webflow-hosted CDN assets (incl. OG images, favicons, lightbox photos) | **Fully localized** — zero remaining references to any Webflow-owned domain |
| `w-node-*` attributes (10 found) | All required (CSS Grid placement) — kept, untouched |
| `data-w-id` attributes (34 unique / 72 occurrences, shipped package) | 33 functional (drive scroll-reveal animations), 1 confirmed dead-but-harmless (was already non-functional on the original Webflow site too) — 0 removed |
| Broken links found | 1 (mobile "Contacto" button) — fixed |
| Broken asset references found | 17 (accented-filename Unicode mismatch in `proyectos.html`) — fixed |
| Real functional bug found via testing | 1 (mobile hero images invisible below 480px) — fixed |
| External integrations remaining | Google Maps embed only (untestable in this sandbox, unchanged from source) |
| Deployment package | `public_html_ready.zip`, verified via extract-and-retest |
