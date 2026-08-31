---
name: bluey-school-dashboard
description: "Create a local-first, responsive children’s school schedule dashboard with Bluey-inspired colors, live date/time, configurable weather, course tables, H5/WebView support, and print output. Use when the user asks to turn school schedules into a friendly interactive HTML dashboard."
---

# Bluey School Dashboard

Create a single-page HTML dashboard that makes a child’s daily schedule easy to scan on desktop, mobile H5, and APP WebView. Keep the implementation local-first and configurable: never hard-code a specific city, district, province, address, latitude, longitude, school, or family detail unless the user explicitly supplies it for the current task.

## Core layout

- Use a friendly card-dashboard layout with the child’s title, current date, Chinese weekday, and a live digital clock.
- Make today’s courses and current schedule progress the primary cards.
- Keep the weather card compact and secondary. Show current weather plus a separate tomorrow forecast card.
- Add tabs for the user’s opening-period schedule, normal seasonal schedule, and full Monday-Friday course table.
- Use semantic `table`, `caption`, `thead`, `tbody`, `th`, and `scope` markup.
- Include a print button that prints only the active table in A4 landscape and hides dashboard chrome.

## Visual direction

- Use a Bluey-inspired palette: deep navy, bright blue, sky blue, warm orange, sunshine yellow, and cream.
- Prefer user-provided or locally generated character assets. Keep characters and decorations away from important text.
- Suitable decorative motifs include clouds, sun, paw prints, school bags, pencils, bubbles, and light floating motion.
- Respect `prefers-reduced-motion`; animations must never be required to understand or operate the page.

## Data rules

- Treat user-provided schedule files or transcribed tables as the sole authority. Preserve every row, repeated period label, combined subject cell, punctuation, and extension lesson.
- Do not invent lesson times when the source only gives a broad opening-period range.
- Derive the current state from the active schedule: before school, class, break, lunch, extension, finished, or rest day.
- Use browser local time for the clock. Do not request location permission.
- Weather must be configurable from a user-supplied place/coordinate. Prefer a no-key public API such as Open-Meteo when appropriate, and document the exact request fields.
- Fetch current conditions and at least one next-day forecast. Validate finite numbers and expected array entries. On timeout, non-2xx, parse failure, or missing current fields, show a clear unavailable state and a retry button. If only tomorrow’s data is invalid, preserve valid current weather and mark tomorrow unavailable.

## H5 / APP WebView requirements

- Include `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Test source contracts for 360px, 390px, 430px, 768px, and 1280px layouts.
- On narrow screens, shorten the hero, use a single-column card layout, and keep today’s information above the fold.
- Keep the table’s horizontal scrolling inside a `.table-scroll` container; the page itself must not overflow horizontally.
- Make tabs easy to reach and optionally sticky on mobile with an opaque background.
- Give buttons and tabs at least 44 × 44 CSS pixels of touch area. Do not rely on hover.
- Apply `env(safe-area-inset-*)` padding for notches and bottom gesture areas.
- Keep body text readable at a 16px baseline and provide visible keyboard focus states.

## Accessibility and interaction

- Use native buttons for tabs, retry, and print. Expose selected tab state with `aria-selected`, `aria-controls`, and `role="tab"` / `role="tabpanel"`.
- Give character images concise alt text; hide purely decorative shapes from assistive technology.
- Do not put the per-second clock in an `aria-live` region.
- Preserve a user’s manually selected table until reload; only choose a date-driven default on initial load.
- Never show a weekday course list for Saturday or Sunday; display a rest-day state instead.

## Delivery and validation

- Keep the page local-only unless the user separately asks to deploy.
- Keep external network access limited to the configured weather endpoint.
- Add deterministic tests for schedule transcription, date/season boundaries, progress states, weekday/weekend courses, reminder rules, weather normalization, and exact weather URL parameters.
- Add static tests for semantic tables, ARIA hooks, responsive CSS, safe-area support, print rules, and the compact/tomorrow weather UI.
- Verify the local server returns HTTP 200 and that the weather response contains the required finite values before handing off the preview URL.
