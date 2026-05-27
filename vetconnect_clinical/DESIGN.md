# Design System Strategy: Clinical Vitality

## 1. Overview & Creative North Star
**Creative North Star: "The Living Sanctuary"**

This design system moves away from the sterile, cold aesthetics of traditional medical software. Instead, it embraces a high-end editorial approach that balances clinical precision with organic warmth. We achieve this by breaking the "rigid grid" through **intentional asymmetry** and **tonal layering**. 

Rather than boxing medical data into a series of static containers, we treat the UI as a living document. Data is prioritized through dramatic typographic scale—mixing the architectural strength of *Manrope* for headlines with the functional clarity of *Inter* for data density. The result is a system that feels "custom-tailored" for veterinary professionals who require high-speed information retrieval without the cognitive fatigue of a standard "spreadsheet" interface.

---

## 2. Colors & Surface Philosophy
The palette utilizes the vitality of **Vibrant Grass Green** for primary actions and the authoritative depth of **Burgundy Wine** for critical medical alerts and secondary navigation.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Definition must be achieved through:
*   **Background Shifts:** Use `surface-container-low` for page backgrounds and `surface-container-lowest` for primary content modules.
*   **Tonal Transitions:** Define boundaries by moving from a `surface` to a `surface-variant` rather than drawing a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper layers. 
*   **Level 0 (Base):** `surface` (#f8faf8)
*   **Level 1 (Sections):** `surface-container-low` (#f2f4f2)
*   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff)
*   **Level 3 (Popovers/Overlays):** `surface-bright` with 80% opacity and a 12px backdrop-blur (Glassmorphism).

### The "Glass & Gradient" Rule
To elevate the "Vibrant Grass Green" from a flat color to a premium signature, use a subtle **Vitality Gradient** for primary CTAs and header accents:
*   **Gradient:** Linear (135deg) from `primary` (#276a0b) to `primary-container` (#408326).
*   This provides a "soul" to the interface that feels high-end and intentional.

---

## 3. Typography
We employ a dual-typeface system to bridge the gap between "Professional Care" and "Modern Technology."

*   **Display & Headlines (Manrope):** Used for "The Human Moment"—patient names, clinic stats, and welcoming headers. Its geometric curves reflect the "Roundedness Scale."
*   **UI & Data (Inter):** Used for medical records, lab results, and administrative forms. Its high x-height ensures legibility even on small mobile screens.

**Key Scales:**
*   **Headline-LG (Manrope, 2rem):** Used for Patient Names. High contrast against body text.
*   **Body-MD (Inter, 0.875rem):** The workhorse for medical notes.
*   **Label-SM (Inter, 0.6875rem):** Used for metadata (e.g., timestamps, dosages) using `on-surface-variant` to de-emphasize secondary info.

---

## 4. Elevation & Depth
In this system, depth is a function of light, not lines.

*   **The Layering Principle:** A `surface-container-lowest` card placed on a `surface-container-low` background creates a "soft lift." This is our primary method of organization.
*   **Ambient Shadows:** For floating elements (Modals/FABs), use a shadow with a 24px blur and 4% opacity, tinted with `on-surface` (#191c1b). It should look like a soft glow of depth, not a drop shadow.
*   **The "Ghost Border" Fallback:** If a container requires further definition (e.g., a white card on a white background), use a **Ghost Border**: `outline-variant` (#c1c9b7) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** Vitality Gradient (Green), `xl` (1.5rem) roundedness. 
*   **Secondary:** `secondary` (Burgundy) text on `secondary-fixed` background. No border.
*   **Tertiary:** Ghost style. `on-surface` text. Only visible on hover/tap via a `surface-variant` background shift.

### Input Fields
*   **Style:** Minimalist. No bottom line or full box. Use a `surface-container-high` background with `xl` roundedness. 
*   **Focus State:** A subtle `primary` (Green) Ghost Border (20% opacity).

### Cards & Medical Timelines
*   **Strict Rule:** No dividers. Use `spacing-8` (1.75rem) to separate entries.
*   **Contextual Nesting:** Use `surface-container-highest` for internal data chips (e.g., "Vaccination Status") within a `surface-container-lowest` card.

### Signature Component: The "Vitality Badge"
*   For pet health status. Instead of a standard tag, use a large, soft-pill shape (`full` roundedness) with a Glassmorphism blur and a small, pulsing `primary` dot to indicate "Active/Healthy."

---

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a structural element. If a section feels cluttered, increase spacing to `10` (2.25rem) before considering a divider.
*   **DO** use Material Symbols with a "Rounded" weight to match the `xl` corner radius of the UI.
*   **DO** use Burgundy (`secondary`) sparingly for "High Emotion" or "High Risk" items (e.g., Emergency Alerts, Overdue Payments).

### Don't:
*   **DON'T** use pure black (#000000) for text. Use `on-surface` (#191c1b) to maintain the "Living Sanctuary" softness.
*   **DON'T** use standard 4px or 8px rounding. Stick to the `md` (0.75rem) or `xl` (1.5rem) scales to ensure the system feels distinctively "rounded and welcoming."
*   **DON'T** stack more than three levels of surface containers. If you need a fourth level, use a Glassmorphism overlay.