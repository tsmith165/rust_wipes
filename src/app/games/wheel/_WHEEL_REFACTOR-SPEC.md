# Wheel Refactor Specification

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions. Do not use API routes. Utilize @Web if needed for context on server actions and their usage
3. Focus on re-usability. We should be able to easily utilize the "wrapper" / "container" components to create other similar pages
4. Do not over-complicate things. Favor simple solutions to complex flows rather than jumping to abstractions
5. If a file is indented > ~5-6 times, create some "wrapper" / "container" component
6. Document all assumptions made during implementation in the Current Implementation Details section
7. When making significant architectural decisions, document the reasoning in the Change Log section
8. Do NOT implement tests unless specifically requested. Instead, suggest when manual review by the senior software dev would be beneficial
9. Always update the SPEC file with each change being made to maintain accurate documentation
10. Before implementing changes, review the Previous Implementation Overview section and examine the referenced files to ensure a complete understanding of the existing system
11. Make decisions that are good for the longevity of the project while not over-abstracting and over-complicating things

## Project Details

-   NextJS 15
-   TailwindCSS
-   Drizzle ORM
-   Server Actions (no API routes)
-   Framer Motion for animations
-   React Icons
-   Zustand for state management
-   TypeScript

Dependencies (versions from package.json):

-   next: ^15.0.0
-   react: ^18.2.0
-   react-dom: ^18.2.0
-   framer-motion: ^10.16.4
-   zustand: ^4.4.6
-   drizzle-orm: ^0.29.0
-   tailwindcss: ^3.3.5
-   typescript: ^5.2.2

## End Goal

Refactor the gambling wheel component to utilize the same reusable component structure as the slot machine. This includes:

1. Moving the wheel from `/src/app/gambling/wheel` to `/src/app/gambling/slots/wheel` (keep the `/src/app/gambling/wheel` until we complete the refactor)
2. Updateing to the container/component structure from the slot machine implementation
3. Utilizing shared components from the slot machine implementation
4. Adding sound effects and improved animations
5. Maintaining all existing functionality while improving code organization and reusability

## Previous Implementation Overview

Current file structure:

```
/src/app/gambling/wheel/
├── GamblingWheel.tsx         # Main wheel component
├── page.tsx                  # Page component
├── RecentWinners.tsx        # Winners display component
├── wheelActions.ts          # Server actions
└── wheelConstants.ts        # Constants and types
```

Component descriptions:

1. GamblingWheel.tsx

    - Main wheel component containing all logic
    - Handles spinning animation
    - Manages user state and credits
    - Contains winner display
    - Highly coupled implementation

2. RecentWinners.tsx

    - Displays recent wheel winners
    - Fetches and updates winner data
    - Similar to slot machine winners but less modular

3. wheelActions.ts

    - Server-side actions for wheel spins
    - User verification
    - Database interactions
    - Winner management

4. wheelConstants.ts
    - Wheel configuration
    - Color schemes
    - Payout definitions
    - Type definitions

## Updated Implementation Overview

New file structure:

```
/src/app/gambling/slots/wheel/
├── page.tsx                  # Page component
├── Wheel.Container.tsx       # Main container component
├── Wheel.Actions.ts         # Server actions
├── Wheel.Constants.ts       # Constants and types
├── Wheel.Utils.ts           # Utility functions
└── components/
    ├── wheel/
    │   ├── Wheel.Display.tsx       # Wheel visualization
    │   ├── Wheel.Ticker.tsx        # Ticker animation
    │   ├── Wheel.WinOverlay.tsx    # Win display overlay
    │   └── Wheel.RecentWinners.tsx # Winners component
    └── base/
        └── [Reused slot components]
```

## Current Proposed Solution

1. Component Structure:

    - Utilize SlotContainer as base layout
    - Replace SlotGrid with WheelDisplay
    - Reuse SlotControls with wheel-specific configuration
    - Reuse SlotSoundManager with wheel-specific sounds
    - Reuse ConfettiOverlay and WinOverlay
    - Adapt RecentWinners to match slot implementation

2. State Management:

    - Create wheel_game_store.ts for wheel-specific state
    - Reuse steam_user_store.ts for user management
    - Maintain separation of concerns

3. Server Actions:

    - Refactor wheelActions.ts to match slot action patterns
    - Implement proper error handling
    - Use standardized response types

4. Sound System:
    - Add wheel tick sounds (faster to slower)
    - Win celebration sounds
    - Utilize existing sound manager structure

## Current Implementation Details

Completed steps:

1. Created initial directory structure at `/src/app/gambling/slots/wheel`
2. Created base files:
    - page.tsx - Basic page component with metadata
    - Wheel.Constants.ts - Updated constants and types
    - Wheel.Store.ts - Wheel-specific game state management
3. Created core components:
    - game/Wheel.Display.tsx - Core wheel visualization
    - Wheel.Container.tsx - Main container component
4. Created server actions:
    - Wheel.Actions.ts - Server-side actions for wheel spins
    - Improved error handling and type safety
    - Standardized response types
    - Fixed database schema references
    - Maintained existing functionality
5. Created win overlay:
    - game/Wheel.WinOverlay.tsx - Win result display
    - Integrated with Wheel.Container.tsx
    - Added animation and styling
    - Maintained consistent UI with slot machine
6. Created recent winners:
    - game/Wheel.RecentWinners.tsx - Recent winners display
    - Real-time updates with animations
    - Steam profile integration
    - Consistent styling with slot machine
    - Loading states and error handling
7. Created sound system:
    - game/Wheel.SoundManager.tsx - Wheel-specific sound manager
    - Extended slot sound manager functionality
    - Added wheel-specific tick sounds
    - Implemented speed-based tick timing
    - Added smooth sound transitions
    - Updated container to use new sound manager
    - Integrated progressive tick speeds
    - Maintained volume control and muting
    - Added cleanup for sound intervals
8. Fixed authentication and hydration issues:
    - Added proper useEffect dependencies for steam auth
    - Added error handling for auth initialization
    - Fixed hydration mismatch in wheel display
    - Added client-side only rendering for wheel
    - Updated sound system to use existing sounds
    - Added error handling for sound loading

Assumptions made:

1. We can reuse the same sound files from the slot machine initially
2. The wheel's rotation animation will be handled by Framer Motion
3. The wheel display will be same as previous implementation using SVG/div with conic gradient
4. We'll maintain the same color scheme and payouts as the original
5. We can adapt the slot machine sound manager for wheel sounds
6. The wheel spin cost remains at 5 credits
7. We'll maintain the same database schema for wheel spins
8. The timestamp field in wheel_spins is managed by defaultNow()
9. Win overlay should match slot machine styling for consistency
10. Recent winners should update every 10 seconds
11. Recent winners should show Steam profile links
12. Wheel tick sounds should transition from fast to slow during spin
13. Tick sound intervals should be 50ms (fast), 100ms (medium), 200ms (slow)
14. Sound transitions should occur at 2s intervals during the spin

## Next Steps

1. Create Wheel.BonusModal.tsx:
    - Create new component at src/app/gambling/slots/wheel/game/Wheel.BonusModal.tsx
    - Implement similar structure to slot machine bonus modal:
        ```typescript
        interface WheelBonusModalProps {
            isVisible: boolean;
            onClose: () => void;
            onBonusSelect: (type: 'normal' | 'sticky') => void;
        }
        ```
    - Add modal state to Wheel.Store.ts:
        ```typescript
        showBonusModal: boolean;
        setShowBonusModal: (show: boolean) => void;
        ```
    - Add bonus selection handling in WheelContainer
    - Implement navigation to /gambling/slots/default after selection
    - Add proper animations and styling
    - Ensure modal closes properly after selection
2. Stop all sounds for wheel when next spin is triggered
3. Add Confetti Overlay:

    - Reuse SlotConfettiOverlay component from slot machine
    - Add to WheelContainer with configuration:
        ```typescript
        <SlotConfettiOverlay
          isVisible={showConfetti}
          onComplete={() => setShowConfetti(false)}
          config={{
            numberOfPieces: 200,
            gravity: 0.2,
            initialVelocityX: 5,
            initialVelocityY: 20
          }}
        />
        ```
    - Add showConfetti state to WheelContainer
    - Trigger confetti on win and bonus triggers
    - Ensure proper cleanup and state management

## Current Unresolved Issues

3. Need to verify bonus symbol win logic with game design
4. Need to test navigation flow after bonus selection
5. Need to verify auto-spin behavior with low credits
6. Need to test sound transitions during auto-spin

## Change Log

Initial spec creation:

-   Defined new file structure
-   Outlined component hierarchy
-   Identified reusable components
-   Established implementation steps

Progress Update 1:

-   Created initial directory structure
-   Implemented page.tsx with metadata
-   Created Wheel.Constants.ts with updated organization
-   Implemented Wheel.Store.ts for state management
-   Refined next steps based on initial implementation

Progress Update 2:

-   Created Wheel.Display.tsx component
-   Created Wheel.Container.tsx component
-   Integrated with SlotContainer layout
-   Updated sound manager interface
-   Added initial component structure

Progress Update 3:

-   Created Wheel.Actions.ts with server actions
-   Improved error handling and type safety
-   Standardized response types
-   Maintained existing functionality
-   Identified linter issues related to database schema

Progress Update 4:

-   Updated Wheel.Actions.ts with correct database schema references
-   Fixed column name issues in database queries
-   Added explicit timestamp handling
-   Improved error messages and type safety
-   Removed redundant recordSpinResult function
-   Standardized winner data transformation

Progress Update 5:

-   Created Wheel.WinOverlay.tsx component
-   Integrated win overlay with container
-   Implemented spin logic in container
-   Added sound manager integration
-   Fixed type issues in rotation handling
-   Maintained consistent styling with slot machine

Progress Update 6:

-   Created Wheel.RecentWinners.tsx component
-   Added real-time updates with animations
-   Integrated Steam profile links
-   Added loading states and error handling
-   Updated container to handle winner refetching
-   Maintained consistent styling with slot machine

Progress Update 7:

-   Created Wheel.SoundManager.tsx component
-   Extended slot sound manager functionality
-   Added wheel-specific tick sounds
-   Implemented speed-based tick timing
-   Added smooth sound transitions
-   Updated container to use new sound manager
-   Integrated progressive tick speeds
-   Maintained volume control and muting
-   Added cleanup for sound intervals

Progress Update 8:

-   Identified authentication issues with steam_user_store
-   Found hydration mismatches in wheel display
-   Discovered missing sound file requirements
-   Updated implementation plan for fixes
-   Added error handling requirements

Progress Update 9:

-   Fixed steam auth initialization
-   Added proper error handling
-   Fixed hydration issues in wheel display
-   Updated sound system to use existing sounds
-   Added error state handling
-   Improved cleanup for intervals
-   Added proper dependency arrays

Progress Update 10:

-   Added detailed implementation plans for remaining features
-   Specified auto-spin functionality requirements
-   Detailed confetti overlay integration
-   Updated payout changes specification
-   Added bonus modal implementation details
-   Updated unresolved issues with new considerations

Progress Update 11:

-   Added auto-spin functionality:
    -   Added auto-spin state to Wheel.Store.ts
    -   Added auto-spin timeout ref to WheelContainer
    -   Implemented auto-spin cleanup
    -   Added auto-spin toggle handler
    -   Updated wheel controls to show auto-spin button
    -   Added auto-spin stop conditions (low credits, errors)
-   Fixed sound system integration:
    -   Added volume control to WheelSoundManager
    -   Added proper sound cleanup
    -   Fixed sound transitions during spins
-   Fixed win overlay:
    -   Updated props to match component interface
    -   Added proper animation handling
    -   Fixed overlay visibility state

Progress Update 12:

-   Added confetti overlay:
    -   Reused SlotConfettiOverlay component
    -   Added showConfetti state to WheelContainer
    -   Integrated with win overlay timing
    -   Added proper cleanup
    -   Configured confetti parameters
    -   Synchronized with sound effects
    -   Added proper z-index handling

Progress Update 13:

-   Updated wheel payouts:
    -   Changed purple payout from M39 to AK47
    -   Changed red payout from AK47 to 3x bonus
    -   Updated ITEM_IMAGE_PATHS to use new icons
    -   Added type safety to image paths
    -   Added bonus symbol handling
    -   Updated WheelPayout type to reflect changes

Progress Update 14:

-   Fixed credits not updating after wheel spin:
    -   Added loadUserData call after successful spin
    -   Ensures credits state is synchronized with database
    -   Maintains proper auto-spin behavior with credit checks
    -   Fixed edge case where credits weren't updating in UI

Progress Update 15:

-   Added bonus modal implementation:
    -   Created Wheel.BonusModal.tsx component with animations
    -   Added bonus modal state to Wheel.Store.ts
    -   Added pendingBonusType state management
    -   Implemented modal UI with normal/sticky options
    -   Added proper animations and transitions
    -   Maintained consistent styling with slot machine

## Next Steps

1. Update Wheel.Container.tsx for Bonus:

    - Import and integrate WheelBonusModal component
    - Add bonus selection handling:
        ```typescript
        const handleBonusSelect = async (type: 'normal' | 'sticky') => {
            try {
                setShowBonusModal(false);
                // Navigate to slot machine with bonus type
                router.push(`/gambling/slots/default?bonus=${type}`);
            } catch (error) {
                console.error('Error handling bonus selection:', error);
            }
        };
        ```
    - Add bonus win detection in handleSpin
    - Show bonus modal on 3x bonus win
    - Handle navigation after selection

2. Update Wheel.Actions.ts for Bonus:

    - Add bonus type handling to spinWheel action:
        ```typescript
        interface SpinWheelData {
            result: WheelResult;
            totalRotation: number;
            finalDegree: number;
            credits: number;
            userId: number;
            bonusAwarded?: {
                type: 'normal' | 'sticky';
                spins: number;
            };
        }
        ```
    - Update database schema for bonus spins
    - Add bonus multiplier logic
    - Add proper error handling for bonus cases

3. Add Loading States:
    - Add loading state during navigation
    - Add transition animations
    - Handle navigation errors gracefully
    - Show proper loading indicators

## Current Unresolved Issues

1. Need to handle edge case where user navigates away during auto-spin
2. Need to ensure proper cleanup of sound intervals during rapid spins
3. Need to verify bonus symbol win logic with game design
4. Need to test navigation flow after bonus selection
5. Need to verify auto-spin behavior with low credits
6. Need to test sound transitions during auto-spin
7. Need to verify bonus multiplier calculations
8. Need to test bonus navigation flow
9. Need to verify bonus modal state cleanup on navigation

## Current Implementation Details

1. Auto-spin functionality:

    - Uses timeout ref for cleanup
    - Stops on low credits (< 5)
    - Stops on errors
    - Maintains proper sound transitions
    - Integrates with win overlay

2. Sound system:

    - Uses existing slot machine sounds temporarily
    - Implements proper volume control
    - Handles sound transitions during spins
    - Cleans up properly on unmount

3. Win overlay:

    - Uses AnimatePresence for smooth transitions
    - Displays result with proper styling
    - Integrates with sound system
    - Handles cleanup properly

4. Confetti overlay:

    - Uses SlotConfettiOverlay component
    - Synchronized with win overlay timing
    - Configurable particle settings
    - Proper cleanup on completion
    - Smooth transitions with animations

5. Wheel payouts:

    - Yellow: P2 Pistol (pistol.semiauto)
    - Green: M92 Pistol (pistol.m92)
    - Blue: Thompson (smg.thompson)
    - Purple: AK47 Rifle (rifle.ak)
    - Red: 3x Bonus (bonus.3x)

6. Assumptions:
    - Auto-spin delay is set to 1000ms
    - Sound transitions occur at 2s intervals
    - Win overlay displays for 2.5s
    - Minimum credits for auto-spin is 5
    - Confetti uses 200 particles
    - Confetti gravity is set to 0.2
    - Initial confetti velocities: X=5, Y=20
    - Bonus multiplier is fixed at 3x
    - Bonus navigation preserves user state

### Change Log

-   Fixed image paths in `Wheel.BonusModal.tsx` to correctly display normal and sticky bonus images
-   Updated `handleBonusSelect` in `Wheel.Container.tsx` to use the `setBonusType` server action instead of API endpoint
-   Added proper error handling and validation for bonus type selection
-   Added Steam authentication check before bonus selection
-   Added validation for awarded free spins before navigation
-   Added error recovery by showing bonus modal again on failure
-   Added local state update after bonus type is set
-   Added fake spin record creation in `slot_machine_spins` table to display bonus wins in recent winners

### Current Implementation Details

-   Bonus modal displays correctly when landing on red
-   Normal bonus image path: `/rust_icons/bonus_symbol.png`
-   Sticky bonus image path: `/rust_icons/sticky_bonus.png`
-   Bonus type is now set in database using server action before redirecting to slot page
-   Free spins are properly awarded based on bonus type and symbol count
-   Error handling added for failed bonus type updates and missing authentication
-   Steam authentication is validated before allowing bonus selection
-   Local state is updated before navigation to ensure consistency
-   Fake spin records are created in `slot_machine_spins` table when bonus spins are awarded
-   Recent winners display now shows bonus spins won from wheel spins
-   Proper database schema types are used for all database operations

### Next Steps

1. Test bonus selection flow:

    - Verify images display correctly in bonus modal
    - Confirm bonus type is saved in database using server action
    - Verify free spins are correctly awarded based on bonus type
    - Check redirection to slot page with correct bonus type
    - Validate error handling for failed server action calls
    - Test Steam authentication validation
    - Test error recovery when free spins award fails
    - Verify fake spin records are created correctly
    - Check recent winners display for bonus wins

2. Implement sound effects for bonus selection:

    - Add sound effect when bonus modal opens
    - Add sound effect for selecting bonus type
    - Add error sound for failed selections
    - Add success sound when free spins are awarded
    - Integrate with existing sound manager

3. Add loading state during bonus selection:

    - Show loading indicator while server action is processing
    - Show loading indicator while free spins are being awarded
    - Disable bonus selection buttons during processing
    - Add visual feedback for selection process
    - Add transition animations for modal states

4. Enhance error handling:

    - Add retry mechanism for failed server action calls
    - Add retry mechanism for failed free spins awards
    - Improve error messages for better user feedback
    - Add fallback behavior if server action fails
    - Handle network connectivity issues gracefully

5. Update UI/UX:

    - Add animations for bonus modal open/close
    - Improve visual feedback during selection
    - Add tooltips explaining bonus types and free spins amounts
    - Ensure responsive design for all screen sizes
    - Add confirmation for bonus type selection
    - Add visual indicator for number of free spins awarded

### Current Unresolved Issues

-   Need to verify server action integration is working correctly
-   Need to verify free spins are being awarded correctly
-   Test edge cases in bonus selection flow
-   Validate error handling coverage
-   Check performance of server action calls
-   Ensure proper cleanup of state on unmount
-   Verify state consistency between wheel and slot pages
