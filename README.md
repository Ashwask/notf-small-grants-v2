# NoTF BLR Small Grants: v2 (scroll-story design exploration)

A second, standalone local version of the Small Grants microsite. It uses the same content as `~/notf-small-grants`, with a scroll-driven storytelling layout **inspired by** dairyfoodbg.com: its flow, motion patterns and button style. All graphics are original (hand-built SVG/CSS); no assets or code were taken from the reference.

> Local only. Branch `develop`. Nothing goes to `main` until Ashwin says "merge to main".

## Run
```bash
python3 -m http.server 5175 --bind 127.0.0.1   # http://127.0.0.1:5175/
```
There is no build step. GSAP 3.12.5 and ScrollTrigger load from cdnjs, and the fonts (Bricolage Grotesque, Albert Sans) come from Google Fonts.

## Flow (reference section → NoTF content)
| # | Pattern | Content |
|---|---------|---------|
| 0 | Loader with % counter, slide-up reveal | NoTF logo |
| 1 | Hero over clouds, floating island, dark bottom nav pill; pinned zoom-out → statement → stats one at a time | "The fix is local." / ₹2,00,000 · 6 months · ~10 · 0 |
| 2 | Big text fills word by word; photo panel grows to full bleed; round stamps pop | About + chat bubbles + ₹50K / 6 months / Bengaluru stamps |
| 3 | Pinned showcase: tile flips, cloud speech bubble with Details, pills | What we fund (5 themes) |
| 4 | "from ——— to" line draws, items grow along it | ₹50,000 to ₹2,00,000 |
| 5 | Pinned tabs with active dot, card, arc panel sliding in | How it works (4 steps) |
| 6 | Dark full-screen, pinned word-by-word reveal, checklists | Rolling call / who it's for / what we ask |
| 7 | Title, disc with orbit rings and pins, arrow bullets, green CTA | Bengaluru neighbourhoods (pins illustrative) |
| 8 | Card UI | 30-second fit checker |
| 9 | Accordion | FAQs |
| 10 | "Ready to…?" two buttons, links, rising globe, clouds | Apply / FAQs |

## Motion rules
- Desktop (≥901px): sections 3, 5 and 6 are pinned, and scrolling drives them. Clicking a pill or tab scrolls to that step.
- Mobile: no pinning for 3 and 5 (tap-driven); word reveals still scrub.
- `prefers-reduced-motion` or a blocked CDN: no loader and no pins; all content is visible and the tabs work on click.

## Placeholders / drafts
- Photos: gradient panels marked "Photo for this step" and so on.
- The theme descriptions (section 3) and the range labels (Seed a pilot … Finish the fix) are DRAFT copy written for this version.
- Contact email: `[contact email]`. Apply buttons: set `APPLY_URL` in `assets/js/main.js`.
- English only (the v1 site carries the 11-language system).
