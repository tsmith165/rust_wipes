# BaseGame.BonusModal Component Specification

## AI Agent Rules

1. Do not change the structure or delete sections from this spec
2. Use NextJS 15 server actions, not API routes
3. Focus on re-usability for all game types
4. Keep solutions simple, avoid over-abstraction
5. Create wrapper/container components for deeply nested components
6. Document all assumptions in Current Implementation Details
7. Document architectural decisions in Change Log
8. No tests unless requested - suggest manual review points
9. Update spec with all changes
10. Review existing implementation before changes
11. Make decisions for project longevity without over-complication

## Project Details

-   NextJS 15
-   TailwindCSS 3.3.0
-   Framer Motion 10.16.4
-   TypeScript 5.0.4
-   React 18.2.0
-   Dynamic imports for Confetti

## End Goal

Create a reusable BaseGame.BonusModal component that can:

1. Support both wheel and slot games bonus selection
2. Handle confetti animations consistently
3. Provide flexible styling options for different game themes
4. Maintain consistent positioning and animations
5. Support future game implementations

## Previous Implementation Overview

File Structure:

```
src/components/games/
├── rusty-slots/
│   ├── RustySlots.BonusModal.tsx
│   └── RustySlots.Container.tsx
├── wheel/
│   ├── Wheel.BonusModal.tsx
│   └── Wheel.Container.tsx
└── base/
    └── BaseGame.Container.tsx
```

Key Components:

1. RustySlots.BonusModal.tsx

    - Handles bonus type selection (normal/sticky)
    - Manages confetti animations
    - Uses Framer Motion for animations
    - Positioned relative to container

2. Wheel.BonusModal.tsx

    - Similar functionality to RustySlots
    - Different styling/theme
    - Simpler animation approach

3. BaseGame.Container.tsx
    - Main layout container
    - Handles positioning of game elements

## Updated Implementation Overview

New File Structure:

```
src/components/games/
├── base/
│   ├── BaseGame.BonusModal.tsx (NEW)
│   └── BaseGame.Container.tsx
├── rusty-slots/
│   └── RustySlots.Container.tsx (UPDATED)
└── wheel/
    └── Wheel.Container.tsx (UPDATED)
```

## Current Proposed Solution

1. Create BaseGame.BonusModal.tsx with:

    - Flexible props interface for different bonus types
    - Consistent animation system
    - Theme-able styling system
    - Standardized positioning logic
    - Optional confetti overlay

2. Update existing containers to use new component
    - Migrate RustySlots bonus logic
    - Migrate Wheel bonus logic
    - Ensure backward compatibility

## Next Steps

1. Create BaseGame.BonusModal.tsx:

    - Define comprehensive props interface
    - Implement Framer Motion animations
    - Add confetti integration
    - Create theme system

2. Update RustySlots.Container.tsx:

    - Replace current BonusModal import
    - Migrate props to new format
    - Test functionality

3. Update Wheel.Container.tsx:

    - Replace current BonusModal import
    - Migrate props to new format
    - Test functionality

4. Update BaseGame.Container.tsx:
    - Add support for modal positioning
    - Ensure proper z-index handling

## Current Unresolved Issues

1. Need to determine best approach for theme customization
2. Consider performance impact of confetti animations
3. Evaluate accessibility requirements for modals

## Change Log

-   Initial spec creation (2024-01-01)

    -   Outlined component requirements
    -   Defined file structure
    -   Created implementation plan

-   BaseGame.BonusModal Implementation (2024-01-01)

    -   Created reusable BaseGame.BonusModal component
    -   Added flexible theming system
    -   Implemented responsive design
    -   Added comprehensive TypeScript interfaces
    -   Added detailed component documentation

-   Integration Complete (2024-01-01) - Added generic type support for bonus options - Updated RustySlots.Container.tsx to use new component - Updated Wheel.Container.tsx to use new component - Removed old bonus modal components - Verified type safety across implementations

## Current Implementation Details

1. BaseGame.BonusModal.tsx has been created with:

    - Flexible props interface for different bonus types
    - Theme customization system
    - Mobile-responsive design
    - Confetti integration
    - Framer Motion animations
    - Generic type support for bonus options

2. Implementation Assumptions:

    - All games will use similar bonus selection pattern (2 options with images)
    - Games will provide their own image assets
    - Container ref will be available for positioning
    - Tailwind classes will be available for styling
    - Bonus types will be string literals (e.g., 'normal' | 'sticky')

3. Integration Status:

    - Successfully integrated with RustySlots.Container.tsx
    - Successfully integrated with Wheel.Container.tsx
    - Both implementations use type-safe bonus selection

## Next Steps

1. Manual Testing Required:

    - Verify modal positioning in both games
    - Test mobile responsiveness
    - Verify confetti animations
    - Check theme customization
    - Test bonus selection flow in both games

2. Potential Future Improvements:

    - Add animation customization options
    - Create preset themes for different game styles
    - Add accessibility features (ARIA labels, keyboard navigation)
    - Consider adding sound effect integration

## Current Unresolved Issues

1. Need to verify performance impact of confetti animations
2. Consider adding automated tests for component reusability
3. May need to add more theme customization options based on future game needs
