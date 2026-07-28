# FREDXPREX — New Brunswick Courier & Freight

> *When Speed And Trust Travel Together*

A modern, fully responsive, bilingual (EN/FR) marketing and self-service site for FREDXPREX,
a 100% intra-provincial courier and freight network headquartered at
**1318 Miramichi Ave, Bathurst, NB E2A 1Y2**.

No build step, no dependencies. Open `index.html` in a browser, or serve the folder.

```
python -m http.server 5173      # then visit http://localhost:5173
```

---

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Semantic HTML5, inline SVG icon sprite (Lucide-style paths) |
| `assets/css/styles.css` | Design tokens, components, responsive + print + reduced-motion rules |
| `assets/js/data.js` | NB geography, postal-code zones, hub coordinates, rate model |
| `assets/js/i18n.js` | Full English / French dictionary (~250 keys, exact parity) |
| `assets/js/app.js` | All interactivity — map, rate engine, tracking, modals, forms |
| `.claude/launch.json` | Dev-server config for the preview tool. Safe to delete. |

---

## Features

**Header / navigation** — Top bar with HQ address, dispatch line, email, hours and an
EN/FR toggle. Sticky header with scroll-spy nav, a mobile drawer, and a `Ship Now` CTA.

**Hero** — Headline, slogan, and a three-tab widget: *Track*, *Get a Quote (NB postal codes)*,
*Schedule Pickup*. Animated KPI counters below.

**Interactive NB map** — The province outline and 18 hubs are drawn from real
latitude/longitude via an equirectangular projection, so hub positions and lane distances
agree with the rate engine. Hubs are hoverable, tappable and keyboard-focusable; each
reports its region and distance from the Bathurst HQ. Region cards cross-highlight their hubs.

**Rate estimator** — Distance-based pricing across four services, with volumetric weight,
multi-piece, accessorials (residential, liftgate, signature, declared value), rural and
Acadian Peninsula surcharges, a 14.5% fuel surcharge and 15% NB HST. Rejects any postal code
outside New Brunswick and flags same-zone and overweight shipments.

**Tracking** — Enter any waybill number to get a shipment card: status pill, four-stage
progress bar, origin/destination/weight/ETA, and a full scan history. Results are generated
from a hash of the tracking number, so the *same number always returns the same shipment*.

**Leadership** — Direct phone and email for each director, for enterprise inquiries.

**Contact** — Validated contact form, head-office card, FAQ accordion, and a footer with
sitemap, regional routes, and privacy / terms / claims / accessibility documents.

---

## Notes on the rate model

`assets/js/data.js` holds every tunable number in one place:

```js
SERVICES.sameday = { base: 34.95, perKm: 0.62, perKg: 1.45, minCharge: 42.00, ... }
FEES = { fuelPct: 0.145, hstPct: 0.15, residential: 6.75, liftgate: 42.00, ... }
```

Lane distance is the great-circle distance × 1.28 (a New Brunswick road-winding factor) + 4 km.
Adjust `SERVICES` and `FEES` to change pricing; nothing else needs to be touched.

Postal codes resolve through an exact FSA table first, then a rule-based fallback, so any
valid `E##` code lands on a sensible hub rather than being rejected.

---

## Mock behaviour

Tracking results, quotes and form submissions are **client-side simulations** — there is no
back end. Every submit produces a reference number and a confirmation panel. To go live,
replace the handlers in `app.js` (`runTracking`, `computeQuote`, and the `wireModalForm` /
`initContactForm` submit branches) with real API calls.

---

## Accessibility

- Skip link, semantic landmarks, one `h1`, ordered heading outline
- Every form control labelled; errors announced via `role="alert"` and `aria-invalid`
- Modal focus trap, `Escape` to close, focus restored to the trigger
- Keyboard-operable tabs (arrow keys), accordion, and map hubs
- WCAG 2.1 AA contrast throughout
- `prefers-reduced-motion` honoured; layouts reflow to 320px with no horizontal scroll
