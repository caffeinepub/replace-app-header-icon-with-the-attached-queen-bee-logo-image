# Specification

## Summary
**Goal:** Provide a dedicated, print-optimized invoice document layout so printing/downloading produces a clean invoice (not a screen print of the invoice detail UI).

**Planned changes:**
- Add a dedicated invoice “document” layout used specifically for print/PDF output, containing only core invoice content (logo, invoice number, paid/unpaid status, customer details, business address, optional text number, line items, totals, and payment instructions).
- Update the Invoice Detail page’s Print and Download PDF actions to use the dedicated invoice document layout (instead of printing the on-screen UI), triggering the browser print dialog for printing/saving as PDF.
- Extend print CSS to ensure consistent page sizing/margins and better page-break behavior (avoid mid-row table breaks and reduce awkward section splitting) while keeping the normal on-screen invoice detail layout unchanged.

**User-visible outcome:** Clicking Print or Download PDF on an invoice generates a clean, black-and-white-friendly invoice document without app navigation/actions, photo sections, or edit/payment UI, and prints with consistent margins and sensible page breaks.
