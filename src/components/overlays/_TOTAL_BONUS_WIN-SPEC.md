# Total Bonus Win Tracking and Display - SPEC

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions, not API routes
3. Focus on re-usability of components
4. Favor simple solutions over complex abstractions
5. Create wrapper/container components when nesting exceeds 5-6 levels
6. Document all assumptions in Current Implementation Details
7. Document architectural decisions in Change Log
8. No tests unless requested - suggest manual review points
9. Keep SPEC updated with all changes
10. Review existing implementation before changes
11. Make decisions for project longevity without over-abstracting

## Project Details

-   NextJS 15
-   TailwindCSS
-   Drizzle ORM with PostgreSQL
-   Server Actions (no API routes)
-   Framer Motion for animations
-   TypeScript

Dependencies:

-   drizzle-orm: latest
-   @neondatabase/serverless: latest
-   framer-motion: latest
-   tailwindcss: latest
-   typescript: latest

## End Goal

Add tracking and display of total wins accumulated during bonus spins in the slot machine game. This includes:

1. Database schema update to track total wins
2. New or modified overlay to display total bonus wins
3. Logic to aggregate wins across bonus spins
4. Integration with existing bonus spin system

## Previous Implementation Overview

Key existing files:

-   src/db/schema.ts: Contains database schema including bonus_spins table
-   src/db/db.ts: Database connection and exports
-   src/components/overlays/templates/Modal.Win.tsx: Existing win display modal
-   src/app/games/rusty-slots/RustySlots.Actions.ts: Server actions for slot machine
-   src/app/games/rusty-slots/RustySlots.Container.tsx: Main game container

Current bonus_spins table structure:

```typescript
bonus_spins: {
    id: serial;
    user_id: integer;
    spins_remaining: integer;
    bonus_type: string;
    sticky_multipliers: jsonb;
    last_updated: timestamp;
    pending_bonus: boolean;
    pending_bonus_amount: integer;
}
```

## Updated Implementation Overview

Planned changes:

1. Schema Updates:

    - ✅ Add total_win field to bonus_spins table (jsonb type)

2. Win Tracking:

    - ✅ Added aggregateWins helper function
    - ✅ Updated spinSlotMachine to track total wins
    - ✅ Implemented win aggregation logic
    - ✅ Added total_win to SpinResult interface

3. UI Updates:

    - ✅ Modified Modal.Win.tsx to handle total wins
    - ✅ Added new props for total win display
    - ✅ Updated RustySlots.Container.tsx to show total wins
    - ✅ Added total win modal state and display logic

## Current Proposed Solution

1. Schema Update:

    - ✅ Added total_win as jsonb field to track accumulated wins
    - ✅ Format: { item: string, full_name: string, quantity: number }[]

2. Win Display:

    - ✅ Extended Modal.Win.tsx with new features:
        - ✅ Added isTotalWin prop
        - ✅ Added customTitle prop
        - ✅ Updated confetti behavior for total wins
        - ✅ Disabled close button for total wins
        - ✅ Updated type constraints to support both payout and totalWin
    - ✅ Integrated with RustySlots.Container.tsx:
        - ✅ Added showTotalWinModal state
        - ✅ Added logic to show total wins after bonus round
        - ✅ Implemented total win display timing

3. Win Tracking:

    - ✅ Update bonus_spins table on each spin
    - ✅ Aggregate quantities for same items
    - ✅ Store in standardized format matching payout structure

## Next Steps

1. Testing and Validation:

    - Test bonus round completion flow
    - Verify win aggregation accuracy
    - Test edge cases:
        - Interrupted bonus rounds
        - Multiple bonus rounds
        - Server disconnections
    - Manual review of UI/UX flow

2. Documentation:

    - Add comments explaining total win logic
    - Document timing of modal displays
    - Update component documentation

3. Future Improvements:

    - Consider adding animation transitions between modals
    - Add persistence for interrupted bonus rounds
    - Consider adding win history feature

## Current Unresolved Issues

1. ✅ Determined format for total_win JSON structure: Matches existing payout format
2. ✅ Implemented win aggregation logic
3. ✅ Decision made: Show total wins after bonus round ends (when spins_remaining reaches 0)
4. ✅ Edge cases handled in UI:
    - ✅ Modal conflicts prevented with timing delays
    - ✅ User departure handled by state reset
    - Future consideration: Add persistence for interrupted rounds

## Change Log

[2024-01-02] Initial SPEC Creation

-   Created SPEC file for Total Bonus Win feature
-   Outlined initial implementation approach
-   Documented existing system structure
-   Proposed solution using existing Modal.Win.tsx component

[2024-01-02] Schema Update

-   Added total_win field to bonus_spins table
-   Successfully ran database migration
-   Updated SPEC to reflect completed schema changes
-   Refined next steps for implementation

[2024-01-02] Win Tracking Implementation

-   Added aggregateWins helper function
-   Updated spinSlotMachine action to track total wins
-   Implemented win aggregation logic
-   Added total_win to SpinResult interface
-   Updated bonus_spins table operations to handle total_win field
-   Decided to show total wins after bonus round ends

[2024-01-02] Modal.Win.tsx Updates

-   Extended Modal.Win.tsx to support total bonus wins
-   Added isTotalWin and customTitle props
-   Enhanced confetti display for total wins
-   Disabled close button for total win display
-   Updated component documentation
-   Updated type constraints to support both payout and totalWin

[2024-01-02] RustySlots.Container.tsx Integration

-   Added showTotalWinModal state
-   Implemented total win display logic
-   Added timing controls for modal display
-   Integrated with existing win display system
-   Added total win modal with custom styling

[2024-01-02] Win Display Order Fix

-   Updated win display logic order in handleSpin:

1. Check for bonus trigger (show bonus selection modal)
2. Check for final bonus spin (show total win modal)
3. Check for regular wins (show single spin win modal)

-   Adjusted timing of total win modal to match other modals (1500ms)
-   Added early return after bonus trigger to prevent multiple modals
-   Added auto-spin stop when bonus round ends
-   Updated SPEC to reflect new display order and timing

[2024-01-02] Auto-Spin and Total Win Display Fixes

-   Updated auto-spin behavior:
-   Stop auto-spinning when reaching last bonus spin (spins_remaining = 1)
-   Added logging for auto-spin state changes
-   Fixed total win persistence:
-   Separated total_win reset from other bonus state resets
-   Added delayed cleanup of total_win field (5s after final spin)
-   Ensures total win modal shows correct values
-   Updated SPEC to reflect timing and state management changes
-   Added documentation for total win cleanup process

[2024-01-02] Total Win Display and Auto-Spin Fixes

-   Fixed auto-spin stop condition:
-   Now stops when spins_remaining === 1 (before final spin)
-   Ensures player sees the final spin and total win display
-   Fixed total win display:
-   Updated modal title to "Total Bonus Winnings!"
-   Modified spinResult to include totalWin on final spin
-   Fixed condition for including totalWin in response
-   Updated SPEC to reflect timing and display fixes
-   Added additional logging for debugging

[2024-01-02] Total Win Overlay Closing Behavior

-   Added ability to close total win overlay:
-   Added showCloseButton prop to Modal.Win component
-   Made total win overlay closeable
-   Close overlays when starting new spin
-   Updated Modal.Win component:
-   Added showCloseButton prop with default behavior
-   Uses provided value or falls back to !isTotalWin
-   Updated RustySlots.Container:
-   Added overlay cleanup at start of spin
-   Closes all overlays before starting new spin
-   Added explicit showCloseButton for total win modal
