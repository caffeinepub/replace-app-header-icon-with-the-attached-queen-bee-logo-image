# Specification

## Summary
**Goal:** Use the uploaded Queen Bee mark as the invoice logo and a faint watermark on invoice UI screens.

**Planned changes:**
- Create two invoice branding static assets derived from `Queen Bee Guitar Repair 3-1.png` (a header logo and a faint watermark) and add them under `frontend/public/assets/generated` for use via `/assets/generated/<filename>`.
- Update the invoice detail view to display the new invoice logo near the invoice heading with appropriate English alt text and responsive layout.
- Add the watermark behind the invoice content area (line items and totals) with low opacity, non-interactive behavior, acceptable readability in light/dark themes, and sensible print behavior.

**User-visible outcome:** Invoice detail screens show the Queen Bee logo near the invoice header and a subtle Queen Bee watermark behind the invoice content without hurting readability.
