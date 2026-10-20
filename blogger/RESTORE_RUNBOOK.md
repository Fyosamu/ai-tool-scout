# RESTORE RUNBOOK — ⛔ SUPERSEDED (2026-09-27) — DO NOT RUN STEP 1

> **SUPERSEDED BY `THEME_FIX.md`. The prescribed "Theme → Restore" path is
> FORBIDDEN — Restore EMPTIES the layout (diagnosed 2026-09-27).**
> The bug was actually fixed with **`theme-v5.xml`** (3 → 15 declared sections
> + editor **Save**), and the site is verified healthy (Blog1=1 desktop &
> mobile, PERSIST/PROBE=0). Root cause, rejected hypotheses and the rebuild
> runbook now live in **`THEME_FIX.md`**.
> **This file is kept only for:** the **Step 2 verification script** (valid —
> used and passed) and the **Step 3 publish procedure** for posts 02–06
> (payloads unchanged). **Ignore Step 1 and all "Alternate" paths below.**

**Historical gate line (2026-09-26, kept for context):** login required —
gate lifted 2026-09-27 (account: Dazai Osamu / hkay7645@gmail.com).

Bug this fixes (confirmed by independent curl):

| check | current (broken) | expected after fix |
|---|---|---|
| feed posts | 1 | 1 → 6 after Step 3 |
| served `widget Blog` in homepage HTML | **0** | ≥ 1 |
| `no-items` markers | **3** | 0 |
| dated post links `/2026/09/…` on homepage | **0** | ≥ 1 (all published) |
| links on homepage | only `/p/about|contact|privacy-policy|terms` | + post cards |

Root cause: **Blog1 widget missing from the served theme** → nothing renders
posts. Source of truth for the fix: `../theme-current-backup.xml`.

---

## Step 0 — Preconditions (hard gate)

1. User message: "login succeeded" (or equivalent).
2. Verify ourselves: open `blogger.com` → dashboard shows the blog list, **no
   SIGN IN button**, no redirect to `accounts.google.com`.
3. Refresh tab IDs first (`browser.tabs.list`) — stale IDs fail after reload;
   re-call `browser.frames({tabID})` before any `evaluate` (frame IDs change).

## Step 1 — Restore the theme

Target file: **`ai-tool-scout/blogger/theme-current-backup.xml`**
(verified locally: 81,001 bytes · contains `id='Blog1'` · 3 `<b:section>` ·
3 `<b:widget>` · has `name='Main'` · no probe marker).

**Primary path — Theme → Restore:**
1. Blogger → Theme tab → hamburger (⋮) → **Restore**.
2. Upload the file (input accepts local file — `files.upload` with the path
   above works for `<input type=file>`).
3. Wait for the success toast ("Restored" / "Your changes have been saved").

**Alternate A — editor overwrite (if Restore input misbehaves):**
1. Theme → (overflow) → **Edit HTML**.
2. Select-all in CodeMirror, `setValue` = file contents of
   `theme-current-backup.xml`.
3. Click `div.uyYuVb` (the "Save" text button) via synthetic click.
4. **Loud verification:** poll the toast `innerText` every ~400 ms for the
   success/error text, then **reload the editor** and confirm bytes = 81,001
   and `id='Blog1'` present (a silent draft ≠ commit — this happened before).

**Alternate B — force recompile:** Theme Designer save (any trivial change +
Save), or a second editor Save. Prior diagnosis: `SaveDone(true)` was returned
while the live render stayed stale ⇒ **toast alone is NOT proof; only the live
render check in Step 2 is.**

## Step 2 — Verify the render (the only proof that counts)

Within ~60 s of the restore (cache-bust):

```powershell
$cb=[guid]::NewGuid().ToString('N')
$h=((curl.exe -s "https://scoutaitools.blogspot.com/?cb=$cb") -join "`n")
[pscustomobject]@{
  blogWidget = ([regex]::Matches($h,"widget Blog")).Count
  noItems    = ([regex]::Matches($h,"no-items")).Count
  postLinks  = ([regex]::Matches($h,"/20\d\d/\d\d/[a-z0-9-]+\.html")).Count
  pageLinks  = ([regex]::Matches($h,"/p/[a-z0-9-]+\.html")).Count
} | ConvertTo-Json
```

- ✅ `blogWidget ≥ 1`, `noItems = 0`, `postLinks ≥ 1` → proceed to Step 3.
- ❌ still stale → run Alternate B, wait 2–5 min, re-run with a fresh `?cb=`.
  Also check the mobile view `https://scoutaitools.blogspot.com/?m=1`
  (server-side render path differs). If nothing changes after two forced
  saves, stop and report — the republish pipeline itself is stuck (do not
  keep clicking Save).

## Step 3 — Publish posts 02–06

Payloads ready: `blogger/content/post-02.json` … `post-06.json`
(same validated editor pipeline that published post-01).

For each file, in order:
1. Open `blogger.com/post-create` (new post) for the blog.
2. Apply payload (title, labels, body HTML) via the validated direct-editor
   path used for post-01.
3. Click **Publish** → confirm toast → verify the post appears in
   `https://scoutaitools.blogspot.com/feeds/posts/default?alt=json`.

Batch verification:

```powershell
$f=((curl.exe -s "https://scoutaitools.blogspot.com/feeds/posts/default?alt=json") -join "`n") | ConvertFrom-Json
@($f.feed.entry).Count   # expect 6
```

Homepage re-check (Step 2 script): `postLinks ≥ 6`, `noItems = 0`.

## Step 4 — Aftercare

1. Confirm the 4 static pages still linked (`/p/…` = 4 pages × 2 links = 8).
2. Confirm ad-layout widgets (Text1@adtop, Text2@adbottom) survived the
   restore — they are template placeholders; **no ad code is enabled before
   AdSense approval** (course rule, ADSENSE_HANDOFF §2.3).
3. Update `../LAUNCH.md`: mark R2 **fixed** (with timestamp + numbers) and
   refresh the §4 content count (6 published).
4. Then continue the queued pipeline: DMCA page, cookie banner decision,
   posts 07+ (20–30 target), GSC/GA4 (after custom domain).

## Notes / traps

- The backup contains `name='Main'` — **expected; do not "fix" it during the
  restore.** The name-removal experiment is only valid on a *fresh* render
  (the previous test was invalidated by the stale render).
- `VZFXu` (Add-a-Gadget catalog RPC) was the only failing RPC before; it is
  **not** in the critical path of this runbook — ignore unless Step 3 needs
  the gadget dialog.
- Never run `build.js` / deploy the legacy `/dist` — superseded.
- Do not restart `serve-content.js` on :8899 (old process owns the port).
