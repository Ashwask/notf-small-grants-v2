# NoTF BLR Small Grants: v2 microsite (preview)

A one-page site for the **NoTF BLR Small Grants** program of [Neighbourhoods of the Future](https://www.notf.in). It is meant to become a `notf.in` subdomain later.

- **Public preview:** https://notf-small-grants-v2.vercel.app/ (marked not to be indexed)
- **Branch:** `develop` only. Every push to `develop` redeploys the preview through Vercel's GitHub integration.
- **Rule:** there is no `main`. Nothing is merged to `main`, and the live notf.in site is never touched, until Ashwin says "merge to main".

## Run locally
```bash
python3 -m http.server 5175 --bind 127.0.0.1   # http://127.0.0.1:5175/
```
There is no build step. GSAP 3.12.5 and ScrollTrigger load from cdnjs, and Font Awesome 6.5.1 from cdnjs. There are no web fonts.

## Page structure
| # | Section | What it does |
|---|---------|--------------|
| 1 | **Hero** | "The fix is local." (olive and forest, 60px) and "Solve it in ___. Share it with the city." (24px). The neighbourhood name rotates and keeps rotating even with reduced motion. Two buttons. Below them is the island video, which zooms gently and fades on scroll without covering any text. |
| 2 | **About** | "Neighbourhood fixes, funded in Bengaluru and shared with the city.", the lead line, four facts (₹2,00,000 · 6 months · ~10 · 0), the video, and three principles. Animated with the scroll. |
| 3 | **Grant size** | from ₹50,000 ── four growing steps ── to ₹2,00,000, plus a description. Animated with the scroll (the same idea as v1). |
| 4 | **How it works + Is this you?** | A pinned stepper (number card, step list, arc) that the scroll moves through steps 01→04. Then the "Who it's for" and "What we ask at the end" cards, then the 30-second fit checker (nothing is saved or sent). |
| 5 | **FAQs** | Seven questions, one open at a time, and a contact strip. |
| 6 | **Footer** | The "Ready to finish your fix?" card with the video, a links row and a credits line. |

**Always on screen:**
- the animated "Apply now" badge, bottom right;
- the capsule menu pill, bottom centre, with its label following the section you're in.

## Brand
**Colours** come from *NoTF - Brand Colours.pdf* (Studio Ikigai):

| Role | Hex |
|---|---|
| cream | #FEF7E6 |
| light cream | #FFEFD6 |
| terracotta | #C5562C |
| light terracotta | #D2865D |
| mustard | #FAB52A |
| forest | #3C5631 |
| olive | #B5C37C |
| slate | #3E6281 |
| navy | #103657 |
| charcoal | #2C2B32 |

Buttons with white text use #B24C25, a deeper shade of the terracotta, because white on #C5562C is 4.43:1 and fails the WCAG AA contrast minimum. All tokens live in `:root` in `assets/css/style.css`.

**Type** matches www.notf.in: the system font stack (-apple-system, Segoe UI, Roboto, Helvetica Neue, Arial) with bold headings.

## Assets
- `assets/media/hero-island-v2.mp4` is a web copy (1920×1280, 5.1 MB, no audio) of Ashwin's 7052×4700, 134 MB original. Same frames and timing; it's used in the hero, About and footer.
- `assets/img/apply-now-animated.svg` is Ashwin's file, unmodified. It is CSS-animated only, with no scripts.

## Still to come (from Ashwin)
- [ ] Four step images for the How it works arc. The slot is `<!-- step images go here -->` in `#stepScene`.
- [ ] The contact email, which replaces the `[contact email]` placeholders.
- [ ] The application form link: set `APPLY_URL` in `assets/js/main.js`. Until then the Apply buttons show "Form opens soon".
- [ ] The notf.in subdomain: add it under Vercel → Settings → Domains, and add one DNS record on notf.in.

## Accessibility notes
- Reduced motion turns off most animation. By request, the videos and the neighbourhood rotation stay on.
- Keyboard: the steps respond to ↑↓←→, focus rings show, and there is a skip link.
- Checked at 1440×900, 1280×720 and 390×844: no errors and no sideways scrolling.
