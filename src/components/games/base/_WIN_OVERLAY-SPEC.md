# BaseGame.WinOverlay Component Specification

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
-   Next/Image for optimized image loading

## End Goal

Create a reusable BaseGame.WinOverlay component that can:

1. Support both wheel and slot game win displays
2. Show item images alongside win text
3. Maintain consistent styling with BaseGame.BonusModal
4. Handle confetti animations consistently
5. Support future game implementations
6. Improve UI/UX with compact item display

## Previous Implementation Overview

File Structure:

```
src/components/games/
├── base/
│   └── BaseGame.WinOverlay.tsx
├── wheel/
│   └── Wheel.WinOverlay.tsx
└── rusty-slots/
    └── RustySlots.Container.tsx
```

Key Components:

1. BaseGame.WinOverlay.tsx

    - Basic win display functionality
    - Confetti animation support
    - Simple text-based display
    - No image support
    - Tied to SpinResult type

2. Wheel.WinOverlay.tsx
    - Wheel-specific implementation
    - Image support
    - Different styling approach
    - Uses WheelResult type

## Updated Implementation Overview

New File Structure:

```
src/components/games/
├── base/
│   ├── BaseGame.WinOverlay.tsx (UPDATED)
│   └── BaseGame.Container.tsx (UPDATED)
└── containers/
    ├── RustySlots.Container.tsx (UPDATED)
    └── Wheel.Container.tsx (UPDATED)
```

## Current Proposed Solution

1. Create a unified WinItem interface:

    ```typescript
    interface WinItem {
        quantity?: number;
        displayName: string;
        imagePath: string;
        inGameName?: string;
    }
    ```

2. Update BaseGame.WinOverlay.tsx with:

    - Generic type support for different result types
    - Consistent styling with BonusModal
    - Compact row-based item display
    - Image support for each item
    - Improved animations
    - Theme customization options

3. Migrate both games to use new component:
    - Map existing result types to new WinItem interface
    - Update container components
    - Remove Wheel.WinOverlay.tsx

## Current Implementation Details

1. BaseGame.WinOverlay.tsx has been created with:

    - Generic type support for different result types
    - Flexible theme customization system
    - Mobile-responsive design
    - Image support for won items
    - Improved UI with compact item rows
    - Consistent styling with BonusModal

2. Implementation Assumptions:

    - All games will provide image paths for won items
    - Games will map their result types to WinItem interface
    - Container ref will be available for positioning
    - Tailwind classes will be available for styling
    - All results will have some form of payout property

3. Integration Status:

    - Successfully integrated with RustySlots.Container.tsx
    - Successfully integrated with Wheel.Container.tsx
    - Removed old Wheel.WinOverlay.tsx
    - Both implementations use proper image mapping
    - Both use consistent styling

4. Theme Customization:

    - Background color
    - Text color
    - Title size
    - Item text size
    - Padding
    - Width
    - Border radius

## Next Steps

1. Manual Testing Required:

    - Verify positioning in both games
    - Test mobile responsiveness
    - Verify image loading
    - Check theme consistency
    - Test win scenarios
    - Test confetti animations

2. Potential Future Improvements:

    - Add animation customization options
    - Create preset themes for different game styles
    - Add accessibility features (ARIA labels)
    - Consider adding sound effect integration
    - Add image loading fallbacks

## Current Unresolved Issues

1. Need to verify image loading performance
2. Consider adding fallback for missing images
3. May need to add more theme options for future games

## Change Log

-   Initial spec creation (2024-01-01)

    -   Outlined component requirements
    -   Defined file structure
    -   Created implementation plan
    -   Analyzed existing implementations
    -   Designed new interfaces

-   BaseGame.WinOverlay Implementation (2024-01-01)

    -   Created reusable BaseGame.WinOverlay component
    -   Added generic type support
    -   Added theme customization system
    -   Implemented image support
    -   Added improved UI with compact rows
    -   Maintained consistent styling with BonusModal

-   Integration Complete (2024-01-01)
    -   Updated RustySlots.Container.tsx with proper result mapping
    -   Updated Wheel.Container.tsx with proper result mapping
    -   Added row1Ref to Wheel container
    -   Removed old Wheel.WinOverlay.tsx
    -   Verified type safety across implementations
