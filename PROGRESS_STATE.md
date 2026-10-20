# PROGRESS_STATE.md — exact live state (offline-safe checkpoint)

> Verified against the **live feed** with `python tools\check_feed.py`
> (feed source = live, entries = 29, plan = 30, missing = 1).
> Refreshed after the server restart on 2026-10-05.

## Latest live result

```
permalink wrong = 13
label wrong     = 15
missing         = 1      <- post-17 is a DRAFT, so it is absent from the feed
RESULT: FAILED   EXIT=1
```

### What that means

- **posts 01–14 are FULLY correct** (slug **and** label). `post-14`'s label
  was saved by the last `Update` just before the connection dropped —
  confirmed by `label wrong` going 16 -> 15.
- **posts 15–16**: slug ok, **label missing**.
- **post 17**: **DRAFT — unpublished** (this is the `missing = 1`).
- **posts 18–30 (13 posts)**: slug **and** label both wrong.

## IMPORTANT BUG (discovered earlier, still valid)

Setting the label textarea with a JS `value` setter **does not persist**:

```
JS setter  -> textarea shows "Guides"  -> feed shows LABEL live=-   ❌
real keys  -> textarea shows "Guides"  -> feed shows LABEL live=Guides ✅
```

The **permalink input is the opposite**: the JS setter DOES work there,
**but only after the `Automatic -> Custom` radio round-trip**, because the
save payload reads `post.url`, not the DOM input.

=> Correct recipe:

| field | method | verify |
|---|---|---|
| slug | JS `value` setter + blur + radio `Automatic` -> `Custom` | input value === SLUG **and** a body line equals `https://scoutaitools.blogspot.com/2026/09/<slug>.html` |
| label | **real `browser.press` per character** + `input/change/keyup/blur` | textarea value re-read contains the label (case-insensitive), then **`check_feed.py`** |

The primary button is `Publish` on a draft and `Update` on a published post;
a dialog button `CONFIRM` follows publishing (Update may show none).

## Post-by-post state

| pid | post | slug | label | state | next action |
|---|---|---|---|---|---|
| 01–14 | — | ok | ok | published | **done (14 posts)** |
| 15 | `3359307054840827272` | ok | **missing** | published | Labels -> real-type `Guides` -> `Update` |
| 16 | `4175451325680050396` | ok | **missing** | published | same as 15 |
| 17 | `5028796122594099042` | not set | not set | **DRAFT (unpublished)** | full recipe, then `Publish` -> `CONFIRM` |
| 18 | `4937135815721733352` | wrong | none | published | full recipe (Guides) |
| 19 | `236636078081439630` | wrong | none | published | full recipe (Roundups) |
| 20 | `2641645176078373338` | wrong | none | published | full recipe (Roundups) |
| 21 | `3274506210057508980` | wrong | none | published | full recipe (Roundups) |
| 22 | `2978892009671672435` | wrong | none | published | full recipe (Roundups) |
| 23 | `8645018358350560360` | wrong | none | published | full recipe (Roundups) |
| 24 | `6848799701075738345` | wrong | none | published | full recipe (Roundups) |
| 25 | `158086631308042290` | wrong | none | published | full recipe (Trends) |
| 26 | `2910522432393581188` | wrong | none | published | full recipe (Trends) |
| 27 | `6854111663675778332` | wrong | none | published | full recipe (Trends) |
| 28 | `6725575664089555774` | wrong | none | published | full recipe (Trends) |
| 29 | `4804364865993047300` | wrong | none | published | full recipe (Trends) |
| 30 | `666425908158792879` | wrong | none | published | full recipe (Trends) |

Labels by range: **14–18 = `Guides`**, **19–24 = `Roundups`**, **25–30 = `Trends`**.

## Environment facts

- Blog id `4791704820460938856`.
- Editor URL: `https://www.blogger.com/blog/post/edit/4791704820460938856/<pid>`.
- Working tab used this session: `tab_3b649f2f-0c82-45c3-8ea8-3ab536a284cd`.
- Another tab that holds the dashboard/editor state:
  `tab_07597e61-8131-4b11-b794-1b4ae5446119`.
- **Window width 1000 px** -> the `Post settings` sidebar renders normally.
  At 723 px it is `visibility:hidden`; workaround = inject CSS forcing
  `div#i4 { visibility: visible !important; ... }`.
- The Google session **dies after roughly 4 posts**; all Blogger/AdSense tabs
  then bounce to `accounts.google.com/v3/signin/identifier`. First action
  after any interruption must be `browser.tabs.list()`.
- 2FA that works: `Try another way` -> `Tap Yes on your phone or tablet` ->
  pre-send page -> **`Yes`** -> notification to **Galaxy A21s and Galaxy A52s 5G**.
  A security-code path (`skotp`) is also available and does not time out.
- **BLOCKER as of 2026-10-05:** `[browser.disconnected] No desktop browser is
  connected to this session.` -> the user must reopen the session in the
  OpenCode desktop app before any browser work can resume.

## Next steps in order

1. Reconnect the desktop browser (user action).
2. Re-login to Google if the session expired (2FA needs the user).
3. Posts 15/16 -> label only, real typing, `Update`.
4. Post 17 (DRAFT!) -> full recipe -> `Publish` -> `CONFIRM`.
5. Posts 18–30 -> full recipe.
6. `python tools\check_feed.py` -> target
   `permalink wrong = 0, label wrong = 0, missing = 0, RESULT: ALL OK, EXIT=0`.
7. `python tools\verify_live.py --links` -> target `EXIT=0`
   (baseline `9 FAILED, EXIT=1`).
8. Publish `page-05` (Editorial Team) + byline link.
9. Live theme capture -> compare with `blogger/theme.xml` -> Save -> re-render
   checks (`Blog1=1`, 30 unique `postLink`, `no-items=14`, `PERSIST/PROBE=0`).
10. GSC resubmit `sitemap.xml`; update `PENDING_BROWSER_WORK.md`, `LAUNCH.md` §4.
11. User: Namecheap DNS (see `DOMAIN_SETUP.md`) -> custom domain + HTTPS.
