# FedBid Radar

**See every new federal contract award in your lane — free.**

Live browser of real federal contract awards (data: [USAspending.gov](https://www.usaspending.gov), public domain), updated daily.

- **Free:** browse/search all new awards by keyword, category, agency
- **Pro ($49/mo, USDC):** watchlists, weekly curated digest, monthly lane report

## Live site
https://akakk2211.github.io/mintforge-fedbid-radar/

## Product
- `index.html` — award browser (client-side over `data/awards_latest.json`)
- `categories/*.html` — programmatic SEO pages (10 trade categories, live data)
- `checkout.html` — Pro subscription, receive-only USDC payment
- `data/usa_spending_fetch.mjs` — daily fetch from USAspending API (free, no key)
- `.github/workflows/update-data.yml` — daily refresh pipeline

## Integrity
Public-domain data, attributed. Receive-only USDC treasury — this product never initiates outgoing transfers.
