# Fix "Quem não me segue de volta" (showing everyone you follow)

## What is going wrong
After reading who you follow, the tool asks Instagram, 100 accounts at a time, "does this person follow me?". The code counts the answer as "no" unless Instagram explicitly says "yes".

The web version of that Instagram endpoint usually leaves out the "follows you" field and only reports "you follow them". With nothing to read, every account counts as "doesn't follow back", so the whole list shows up. This is the most likely cause. I couldn't confirm it on a real account from here, so the fix also guards against other causes.

## How it will work
1. Read the list of accounts you follow (with photos), same as now.
2. Read the list of accounts that follow you, which is the most reliable source on your own profile, and compare the two using both the account number and the @username.
3. Use the 100-at-a-time check only when Instagram actually sends the "follows you" field. If it is missing, ignore that answer instead of counting it as "no".
4. Before showing anything, double-check each name on the result list one by one (with short pauses). Anyone Instagram confirms follows you is removed. This step only runs on the short list, so it stays fast.
5. Safety checks:
   - If fewer than about 95% of your followers were loaded, show a warning that the list may be incomplete and offer a "Tentar de novo" button. Don't show a list we can't trust.
   - If almost everyone you follow shows up as "doesn't follow back", treat that as a reading error and run the full comparison again instead of showing it.
6. The progress bar shows each step: "Lendo quem você segue… X de Y", "Lendo seus seguidores… X de Y", "Confirmando N perfis…".
7. Keep the photos, names and the "Deixar de seguir" button as they are now.

## Speed
- Lists load in large pages with short pauses (about 0.5 s).
- The one-by-one check only covers the short list of people who don't follow back, with a small pause between each and a cap so it doesn't trigger Instagram limits.

## Technical details (src/lib/bookmarklet.ts, `nonFollowers`)
- Line ~401: replace `back.set(k, fs[k].followed_by === true)` with a check that only records when `"followed_by" in fs[k]`. Otherwise leave it unknown.
- Always fetch the `followers` list through `listAll`. Build `Set`s of the normalized ID (`String(pk ?? pk_id ?? id)`) and the lowercase username. An account counts as "follows back" if either matches, or if show_many reported `followed_by: true`.
- Read the expected follower and following totals from the collected profile data (`d.followers` / `d.following`, or the page header) for "X de Y" and the 95% completeness check.
- Confirm candidates with `GET /api/v1/friendships/show/{uid}/` (`followed_by`), in sequence with about 250 ms delay, capped at around 150. Remove anyone with `followed_by === true`.
- Sanity guard: if candidates are more than 90% of following and following is over 20, don't render. Show an error with a retry button instead.
- Reminder in the final message: delete the old 🦉 bookmark and drag it again.
