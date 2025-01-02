# Winning Logic Fix Specification

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions, not API routes. Utilize @Web for server actions context if needed
3. Focus on re-usability - components should be easily adaptable for similar pages
4. Favor simple solutions over complex abstractions. Consult senior dev for complex flows
5. Create wrapper/container components if nesting depth exceeds 5-6 levels
6. Document all assumptions in Current Implementation Details
7. Document architectural decisions in Change Log
8. No tests unless requested - suggest manual review points instead
9. Keep SPEC updated with all changes
10. Review Previous Implementation before changes
11. Make decisions balancing longevity and simplicity

## Project Details

-   NextJS 15
-   TailwindCSS for styling
-   Framer Motion for animations
-   TypeScript for type safety
-   Current dependencies:
    -   next: ^15.0.0
    -   react: ^18.2.0
    -   framer-motion: ^10.16.4
    -   tailwindcss: ^3.3.0
    -   typescript: ^5.0.0

## End Goal

Restore and improve the winning logic calculation and display in the slot game, ensuring:

1. Winning lines are correctly calculated and displayed
2. Winning cells are highlighted appropriately
3. Win overlay modal appears with correct timing
4. Animations and transitions are smooth
5. Integration with the new Modal.Win.tsx template
6. Maintain all existing functionality while using the new component structure

## Previous Implementation Overview

The winning logic was previously implemented across several files:

1. RustySlots.Container.tsx:

    - Handled spin result processing
    - Managed win state and animations
    - Controlled win overlay visibility
    - Integrated with sound effects

2. RustySlots.Actions.ts:

    - Contained server-side win calculation logic
    - Processed payouts and bonus triggers
    - Managed multiplier calculations
    - Handled winning line detection

3. RustySlots.WinningLines.tsx:

    - Rendered winning line animations
    - Managed line cycling and visibility
    - Handled different line types and colors

4. RustySlots.Grid.tsx:

    - Displayed the slot grid
    - Highlighted winning cells
    - Integrated with winning line display

5. slot_game_store.ts:
    - Managed game state including wins
    - Controlled winning line visibility
    - Stored current winning cells

## Updated Implementation Overview

The winning logic will be restored while integrating with the new Modal.Win.tsx:

1. RustySlots.Container.tsx:

    - Update to use Modal.Win.tsx
    - Maintain existing win calculation triggers
    - Keep sound effect integration
    - Preserve animation timing

2. RustySlots.Actions.ts:

    - No changes needed (server-side logic intact)

3. RustySlots.WinningLines.tsx:

    - Restore winning line animations
    - Keep existing line cycling logic
    - Maintain line type handling

4. RustySlots.Grid.tsx:

    - Restore winning cell highlights
    - Keep grid animation logic
    - Maintain integration with winning lines

5. slot_game_store.ts:
    - Restore winning state management
    - Keep line visibility controls
    - Maintain winning cell tracking

## Current Proposed Solution

1. Identify missing state updates in slot_game_store.ts
2. Restore winning line visibility triggers in RustySlots.Container.tsx
3. Ensure winning cell highlights are properly set
4. Integrate Modal.Win.tsx with existing win logic
5. Maintain animation timing and sequencing

## Next Steps

1. [ ] Review slot_game_store.ts

    - Check win state management
    - Verify line visibility controls
    - Ensure winning cell tracking
    - Document any missing functionality

2. [ ] Update RustySlots.Container.tsx

    - Replace old win overlay with Modal.Win.tsx
    - Restore winning line visibility triggers
    - Verify animation timing
    - Test sound effect integration

3. [ ] Verify RustySlots.Grid.tsx

    - Check winning cell highlight logic
    - Test grid animations
    - Verify winning line integration

4. [ ] Test RustySlots.WinningLines.tsx

    - Verify line animations
    - Test line cycling
    - Check line colors and types

5. [ ] Integration Testing
    - Test complete spin cycle
    - Verify win calculations
    - Check animation sequence
    - Test sound effects
    - Validate modal behavior

## Current Implementation Details

1. Missing Functionality:

    - Win state updates in slot_game_store.ts
    - Winning line visibility triggers
    - Winning cell highlight updates
    - Modal.Win.tsx integration

2. Required State Management:

    - Winning lines visibility
    - Current winning cells
    - Win overlay display
    - Animation sequencing

3. Animation Requirements:
    - Grid spin animation
    - Winning line drawing
    - Cell highlight pulses
    - Modal transitions

## Current Unresolved Issues

1. Win calculation trigger timing
2. Animation sequence coordination
3. Sound effect synchronization
4. Modal transition timing
5. State update order

## Change Log

-   Initial SPEC creation
-   Identified missing winning logic components
-   Documented required state management
-   Listed animation requirements
-   Outlined integration steps
