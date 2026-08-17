---
name: ux-review
description: Review or design the ViART site's user experience and conversion path — booking flow, price discovery, mobile behaviour, copy clarity and trust signals for a local beauty studio. Use when asked to improve conversion, review a section's UX, add a new section, or judge whether an interaction actually helps the visitor book.
---

# ViART UX review

The site has exactly one job: **turn a visitor into a booking at Yclients or a phone
call.** Everything else — the scroll sequences, the gallery, the video — is in service
of that. When a change makes the site more impressive but the booking path longer,
the change is wrong.

## Who is on this page

A woman or man in Kommunarka or south-west Moscow, on a phone, comparing two or three
studios. They have three questions, in this order:

1. **What does my zone cost?** (price, not "from ₽")
2. **Is it safe and will it be awkward?** (equipment, master, procedure, cleanliness)
3. **How do I book, and is it far?** (address, hours, one tap to Yclients or a call)

Mobile-first is not a layout preference here, it is the primary case. Judge every
change on a 390px viewport first.

## Review checklist

**Booking path**
- Is a booking action reachable within one screenful at any scroll depth?
- Is the phone number tappable (`tel:`) everywhere it appears?
- Does every price row link straight to booking, carrying its service context?
- Does the discount (30% first visit) appear near the price, not only in the hero?
- External Yclients links: `target="_blank" rel="noopener"`, and never the only path.

**Price discovery**
- Can a visitor reach their zone's price in ≤2 taps from the top?
- Are the gender and category filters obvious, and is the current state visible?
- Are empty categories explained ("уточните при записи") rather than blank?
- Do complex/package prices show both the regular and first-visit figure?

**Trust**
- Rating, review count and the Yandex award are visible without scrolling to the end.
- Reviews are real, dated and attributed — never invented or padded.
- Equipment is named (EVERLAS, TURBO G8) and shown in real photography.
- No medical promises. "Помогает сократить рост волос", never "удаление навсегда".

**Friction**
- No interstitials, no cookie walls, no chat bubble covering the CTA.
- The map is heavy — it must not block first paint.
- Nothing important is hidden behind hover on a touch device.
- Scroll sequences must not trap the visitor: the page keeps moving under a swipe.

**Copy**
- Russian, calm, factual, second person. Short sentences.
- Section headings say what the section is, not "Наши преимущества".
- Numbers beat adjectives: "119 оценок · 98 отзывов", "Пн–Вс 10:00–21:00".

## Known gaps worth proposing

These are open, ordered by expected impact. Propose them; do not implement unasked.

1. **Sticky mobile action bar** — "Записаться / Позвонить" fixed at the bottom under
   900px. The hero CTA scrolls away and there is nothing until the promo block.
2. **FAQ section** — preparation, contraindications, number of sessions, aftercare.
   High-intent search traffic, and it removes the top pre-booking objection.
3. **LocalBusiness / BeautySalon JSON-LD** plus `openGraph` metadata — address, hours,
   phone, `aggregateRating`. Directly affects local search for a studio.
4. **Deferred map** — a static preview that loads the Yandex iframe on click.
5. **Masters section** — photo and name. In beauty services the master is the product.
6. **Before/after slider** — the most persuasive asset a studio can show, if the
   studio has rights to the photographs.

## Judging a proposed animation

Ask in this order: does it help the visitor understand something (hierarchy, state,
continuity)? Does it hold attention at a moment that would otherwise lose it? Or is it
just motion? Only the first two justify shipping. An animation that delays a tap or
hides a price is a defect regardless of how good it looks.
