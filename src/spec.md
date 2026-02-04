# Specification

## Summary
**Goal:** Fix the runtime “loading error” that prevents the React app from rendering on startup, and ensure initialization/authentication failures are handled without crashing.

**Planned changes:**
- Investigate and resolve the startup-time crash in the authentication/bootstrap layer so the app renders the AppShell and default route (Invoices) without a blank screen.
- Remove/replace any Node-only runtime environment access in the frontend (notably `process.env`), ensuring Internet Identity configuration is browser-safe and includes a safe fallback II URL or a non-crashing missing-config state.
- Add user-visible, non-crashing error UI for initialization/authentication failures using existing UI patterns (e.g., `AsyncState`), including clear guidance and a retry action/instructions.

**User-visible outcome:** Opening the app reliably loads to the main route (Invoices) without uncaught console exceptions; if authentication/initialization fails, users see a clear in-app error with retry guidance instead of an indefinite loading/blank screen.
