# Timer and profile photos for "Quem não me segue de volta"

## 1. Time remaining
- Under the progress bar, show "Tempo restante: ~3 min 20 s" plus the time already spent ("Decorrido: 1 min 05 s").
- The estimate uses the real speed measured so far, not a fixed guess. It updates every second and evens out sudden jumps.
- At the start, before any data has arrived, show "Calculando tempo…" for a few seconds.
- If Instagram asks for a pause, show "Pausa do Instagram, retomando em 30 s" and add the pause to the estimate.
- When it finishes, show "Concluído em 2 min 40 s".

## 2. Profile photos
Likely causes (to confirm during the fix):
- Instagram's page security blocks the small piece of code that hides a broken photo, so a failed photo can't fall back cleanly.
- The setting that hides where the photo request comes from can make Instagram's photo server reject the photo.
- Some photo links expire or are missing on certain accounts.

Fix:
- Load photos the normal way the Instagram page does (remove that setting) and handle errors from the tool's own code instead of inline.
- Keep the colored initial behind each photo so the row never looks empty.
- If a photo still fails, try to load it a second way using the logged-in session and show it from memory.
- Load photos a few at a time while scrolling so long lists stay fast.

## Technical details (src/lib/bookmarklet.ts)
- Timer: record `t0`, then work rate = done/elapsed over a moving window (EMA). ETA = (total - done)/rate + pending pause time. Show it in a new `#eta` line, updated with `setInterval(1000)` and cleared at the end or on error. Phase weights: following list, then per-profile checks.
- Photos: remove `referrerpolicy="no-referrer"` and `onerror="..."`. After rendering, attach `img.addEventListener('error')` in JS. On error, fetch `profile_pic_url` with `fetch(url,{credentials:'omit'})` and use the result as a `URL.createObjectURL(blob)` URL. If that also fails, call `/api/v1/users/{pk}/info/` (limited, sequential) for `profile_pic_url` / `hd_profile_pic_url_info.url`. Use IntersectionObserver for lazy loading. Revoke blob URLs when the panel closes.
- Reminder: delete the old 🦉 bookmark and drag it again.
