# Specification

## Summary
**Goal:** Replace the app header brand icon with the user-provided Queen Bee logo image and update the browser favicon to match.

**Planned changes:**
- Add the provided Queen Bee logo PNG to static frontend assets under `frontend/public/assets/generated/` and render it in the header in place of the current inline SVG, keeping the icon at 64x64 and preserving existing spacing/layout.
- Add favicon PNG assets derived from the provided logo under `frontend/public/assets/generated/` and link at least one favicon in `frontend/index.html`.
- Ensure the header icon and favicon are loaded via static asset paths in the built frontend (no backend image serving), and provide appropriate English alt text for the header logo image.

**User-visible outcome:** The header brand mark and browser tab/favicon display the Queen Bee Guitar Repair logo artwork, with no visible header layout shift.
