# ACCTRA — Deployment Guide

This guide covers deploying `public_html_ready.zip` (or the equivalent
`public_html_ready/` folder) to a traditional Apache hosting account
(Hostinger, GoDaddy, cPanel, or similar). No database, no server-side
language, no build step, and no Webflow account are required.

Assumed production domain throughout this project: **`www.acctra.com.mx`**
(the live reference site named in the migration brief). If the real
production domain differs, see "If your domain differs" at the end of this
guide before going live.

---

## 1. Back up current hosting before touching anything

1. Log in to your hosting control panel (cPanel, hPanel/Hostinger, or
   GoDaddy's hosting dashboard).
2. Open **File Manager**, navigate to `public_html`, select everything
   inside it, and **compress/download a full backup** to your own computer
   (e.g. `public_html_backup_YYYY-MM-DD.zip`). Keep this safe until the new
   site is confirmed working.
3. If the site is currently live on Webflow's own hosting (not this
   Apache account) and you are pointing the domain here for the first
   time, there is nothing on this Apache account to back up yet — skip to
   step 2 below, but keep a note of the domain's current DNS records
   (nameservers / A record) in case you need to revert.

## 2. Upload the files

**Option A — File Manager (simplest, works on any host):**
1. In your hosting control panel, open **File Manager** and go to
   `public_html`.
2. If `public_html` already has old files in it (from a previous site),
   delete them now that you have a backup (step 1) — or upload into an
   empty subfolder first and test there before moving files to the root
   (see step 3, "Where index.html must be located").
3. Click **Upload**, select `public_html_ready.zip`, and upload it.
4. Once uploaded, right-click the zip file in File Manager and choose
   **Extract**. Extract it directly into `public_html` (not into a new
   subfolder).
5. Delete the uploaded `public_html_ready.zip` file from `public_html`
   afterward (it doesn't need to be served, and leaving it there is
   needless dead weight, though it's not a security risk on its own since
   it contains no secrets).

**Option B — FTP/SFTP:**
1. Extract `public_html_ready.zip` on your own computer first.
2. Connect to the host via FTP/SFTP (credentials are in your hosting
   control panel, usually under "FTP Accounts").
3. Upload the **contents** of the extracted folder (not the folder itself)
   directly into `public_html` — i.e. `index.html`, `css/`, `js/`, etc.
   should end up directly inside `public_html`, not inside
   `public_html/public_html_ready/`.
4. Make sure your FTP client is set to show/transfer hidden files, so
   `.htaccess` actually uploads (it's easy for FTP clients to skip
   dotfiles by default — check your client's settings).

## 3. Where `index.html` must be located

`index.html` must sit **directly inside** `public_html` — i.e.
`public_html/index.html`, not `public_html/some-folder/index.html`. That is
exactly how `public_html_ready.zip` is packaged (confirmed in
`FINAL_QA_REPORT.md`), so extracting it straight into `public_html` is
correct. If you see a folder named `public_html_ready` appear inside
`public_html` after extracting, move its contents up one level and delete
the empty folder.

## 4. Configure the domain

- If the domain is already pointed at this hosting account (nameservers or
  A record already set), no DNS change is needed — the site goes live as
  soon as the files are in place.
- If this is a new hosting account, point the domain's nameservers (or A
  record) to the values your host provides in its dashboard. DNS changes
  can take anywhere from a few minutes to ~24-48 hours to fully propagate
  worldwide.
- Confirm in your host's control panel that **both** `acctra.com.mx` and
  `www.acctra.com.mx` are attached to this hosting account (as the primary
  domain and an alias, or via your host's "addon domain" equivalent) —
  `.htaccess` redirects one to the other, but both need to resolve to this
  server first for that redirect to ever run.

## 5. Verify SSL

1. In your hosting control panel, look for **SSL/TLS** (often "Let's
   Encrypt" or "AutoSSL" on shared hosting). Most hosts (Hostinger, GoDaddy,
   cPanel with AutoSSL) issue a free certificate automatically within
   minutes to hours of the domain resolving to the server — no action
   needed beyond confirming it's marked "Active" or "Installed."
2. Once issued, visit `http://www.acctra.com.mx/` (note: `http`, not
   `https`) in a private/incognito browser window. `.htaccess` should
   redirect you automatically to `https://www.acctra.com.mx/` — if it
   does, HTTPS is working end-to-end.
3. Check for the padlock icon in the browser's address bar with no
   "Not Secure" warning.

## 6. Clear hosting cache

Most shared-hosting accounts don't cache HTML by default, but some hosts
(and Cloudflare, if used in front of the domain) do:
- **Hostinger**: hPanel → *Speed* / *Cache Manager* → **Purge Cache**, if
  present on your plan.
- **cPanel with LiteSpeed Cache / built-in cache**: look for a "Cache
  Manager" or "Purge All" button in cPanel.
- **Cloudflare** (if the domain uses it): dashboard → **Caching** →
  **Purge Everything**.
- If none of these apply to your setup, there's nothing to clear — skip
  this step.
- Also clear **your own browser's cache** (or use a private/incognito
  window) before testing, so you're not looking at a stale local copy.

## 7. Test the site after deployment

Work through this checklist on the live URL:
- [ ] `https://www.acctra.com.mx/` loads and shows the homepage correctly
- [ ] `http://www.acctra.com.mx/` redirects to `https://www.acctra.com.mx/`
- [ ] `https://acctra.com.mx/` (non-www) redirects to the `www` version
- [ ] All 5 main nav links work (Inicio, Quiénes somos, Servicios,
      Infraestructura, Proyectos) plus the Contacto button
- [ ] Mobile menu opens/closes on a phone or narrow browser window
- [ ] The homepage's scroll-triggered animations play as you scroll
- [ ] The `proyectos.html` photo galleries open in the lightbox and
      next/prev/close work
- [ ] The Google Maps embed loads on `contacto.html`
- [ ] Visiting a non-existent URL (e.g.
      `https://www.acctra.com.mx/does-not-exist`) shows the custom 404 page,
      not a generic Apache error
- [ ] View page source on a couple of pages and confirm no errors/blank
      spots where content should be
- [ ] Open the browser's developer console (F12) on a few pages and
      confirm there are no red errors (some ad-blockers/privacy extensions
      can produce unrelated console noise — that's not a site bug)
- [ ] Test on both desktop and a real mobile device, not just a resized
      desktop browser window

## 8. How to roll back if necessary

If something goes wrong after deployment:
1. In File Manager (or via FTP), delete everything you uploaded from
   `public_html`.
2. Re-upload/extract your step-1 backup back into `public_html`.
3. If you changed DNS/nameservers in step 4 and need to fully revert to
   the old host, change them back to the values you noted before starting.
4. If only specific pages are broken (not the whole site), you likely
   don't need a full rollback — check the browser console for the exact
   failing request first; most issues at this stage are a single missing
   or misnamed file, not a systemic problem.

---

## If your production domain differs from `www.acctra.com.mx`

Everything in this project assumes `https://www.acctra.com.mx` as the
final domain (it's the live reference site named in the migration brief).
If the real domain turns out to be different, update it in these exact
places before going live:

- `.htaccess` — the redirect logic itself is domain-agnostic (it redirects
  to whatever host the request came in on), so no change is strictly
  required there, but the explanatory comment at the top references this
  domain.
- `robots.txt` — the `Sitemap:` line.
- `sitemap.xml` — every `<loc>` entry.
- Every page's `<link rel="canonical">` tag and `og:image` /
  `twitter:image` meta tags (currently absolute URLs pointing at
  `https://www.acctra.com.mx/...`).

## Support-free by design

This site has no database, no server-side application code (PHP, Node,
etc.), no npm/build dependency, and no ongoing Webflow account
requirement. Routine maintenance is just editing the HTML/CSS/JS files
directly and re-uploading — there is nothing to "keep running" beyond
standard Apache web hosting.
