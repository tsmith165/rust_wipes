# Slot Machine Refactor Specification

## End Goal

Create a modular, reusable slot machine component system with the following objectives:

1. **Component Modularity**

    - Break down monolithic structure into reusable components
    - Each component should handle a single responsibility
    - Components should be easily composable for different slot machine variants

2. **State Management**

    - Implement Zustand store for centralized state management
    - Separate game logic from UI components
    - Handle complex state interactions (spinning, wins, bonuses) efficiently

3. **Code Organization**

    - Clear separation between base components and game-specific components
    - Consistent file naming and organization
    - Reusable utilities and constants

4. **Maintainability**
    - Type safety throughout the codebase
    - Clear component interfaces
    - Comprehensive error handling
    - Easy to test component structure

## Rules for changing this spec file

1. Maintain clear section hierarchy and formatting
2. Each section must have a clear purpose and not overlap with others
3. Use consistent bullet point formatting for lists
4. Include specific implementation details with code examples where relevant
5. Keep the end goal section focused on high-level objectives
6. Ensure all implementation details are accurate and up-to-date
7. Document any breaking changes or major updates
8. Use proper markdown formatting for code blocks and sections
9. Include type definitions and interfaces where relevant
10. Reference specific file paths when discussing implementation details

## Previous Implementation Details

The previous implementation was structured as a monolithic application with the following characteristics:

1. **File Structure**

    ```
    src/app/gambling/slot/
    ├── page.tsx                 # Main page component
    ├── Slot.Actions.ts         # All server actions
    ├── Slot.Constants.ts       # Game constants
    ├── Slot.Container.tsx      # Main game container
    ├── Slot.RecentWinners.tsx  # Winners display
    ├── Slot.Utils.ts           # Utility functions
    ├── steam_user_store.ts     # Steam user state
    └── SteamSignInModal.tsx    # Steam auth modal
    ```

2. **Key Issues**
    - Large, monolithic components with multiple responsibilities
    - Tightly coupled game logic and UI components
    - Inconsistent state management
    - Limited reusability for different slot variants
    - Complex component lifecycle management
    - Difficult to test individual components
    - No clear separation between base and game-specific logic

## Updated Implementation Details

The new implementation provides a modular, component-based architecture:

1. **Component Structure**

    ```
    src/components/slot/
    ├── base/                   # Base reusable components
    │   ├── Slot.Character.tsx
    │   ├── Slot.Characters.tsx
    │   ├── Slot.Container.tsx
    │   └── Slot.Controls.tsx
    ├── game/                   # Game-specific components
    │   ├── Slot.AnimationSync.tsx
    │   ├── Slot.BonusModal.tsx
    │   ├── Slot.CreditsDisplay.tsx
    │   ├── Slot.Grid.tsx
    │   ├── Slot.ErrorBoundary.tsx
    │   ├── Slot.RecentWinners.tsx
    │   ├── Slot.Sound.tsx
    │   ├── Slot.SoundManager.tsx
    │   ├── Slot.WinningLines.tsx
    │   └── Slot.WinOverlay.tsx
    ```

2. **State Management**

    - Centralized game state using Zustand store (`slot_game_store.ts`)
    - Separate Steam user state (`steam_user_store.ts`)
    - Clear state interfaces and type definitions

3. **Server Actions**

    - Separated into game-specific actions
    - Clear error handling and response types
    - Type-safe API interfaces

4. **Key Improvements**

    - Modular component architecture
    - Clear separation of concerns
    - Reusable animation and sound systems
    - Type-safe state management
    - Improved error handling
    - Component-specific styling
    - Easier testing capabilities
    - Support for multiple slot variants

5. **State Flow**

    ```
    User Action → Component → Store Update → UI Update
                           ↓
                     Server Action
                           ↓
                     Store Update
    ```

6. **Component Interfaces**
   Each component has clear props and event handlers:

    ```typescript
    interface SlotGridProps {
        grid: string[][];
        spinAmounts: number[];
        spinKey: number;
        isSpinning: boolean;
        winningCells: number[][];
        bonusCells: number[][];
        winningLines: number[][][];
        onSpinComplete?: () => void;
    }
    ```

7. **Store Structure**
    ```typescript
    interface SlotGameState {
        isSpinning: boolean;
        currentGrid: string[][];
        winningCells: number[][];
        bonusCells: number[][];
        winningLines: number[][][];
        // ... additional state
    }
    ```

## Current Status

1. **UI Components**

    - ✅ Slot grid layout
    - ✅ Character animations
    - ✅ Win overlay with payout display
    - ✅ Bonus type selection modal
    - ✅ Recent winners section
    - ❌ Winning lines display
    - ❌ Steam sign-in modal overlay
    - ❌ Actions consolidation
    - ❌ Component exports

## Required Changes

1. **Actions File Consolidation**

    ```typescript
    // Remove /slots/default/actions.ts and consolidate into Default.Actions.ts
    // Update imports in affected files to use Default.Actions.ts

    // Example path structure:
    src/app/gambling/slots/default/
    ├── Default.Actions.ts     # All server actions
    ├── Default.Container.tsx  # Main container
    ├── Default.Constants.ts   # Constants
    └── Default.Utils.ts       # Utilities
    ```

2. **Steam Sign-In Modal Fixes**

    ```typescript
    // Update modal to overlay instead of full-screen
    interface SteamSignInModalProps {
        steamInput: string;
        setSteamInput: (value: string) => void;
        code: string;
        setCode: (value: string) => void;
        onVerify: (profileData: any) => void;
        error?: string;
    }

    // Add cookie-based auto-login
    useEffect(() => {
        const steamInput = Cookies.get('steamInput');
        const authCode = Cookies.get('authCode');
        if (steamInput && authCode) {
            setSteamInput(steamInput);
            setCode(authCode);
        }
    }, []);
    ```

3. **Component Export Fix**

    ```typescript
    // In Default.Container.tsx
    export default function DefaultSlotContainer() {
        // ... implementation
    }

    // In page.tsx
    import DefaultSlotContainer from './Default.Container';
    ```

## Next Steps

1. [ ] **Actions Consolidation**

    - [ ] Move relevant code from `actions.ts` to `Default.Actions.ts`
    - [ ] Update imports in all affected components
    - [ ] Delete `actions.ts`
    - [ ] Test all server actions after consolidation

2. [ ] **Steam Sign-In Updates**

    - [ ] Update modal styling to overlay format
    - [ ] Implement cookie-based auto-login
    - [ ] Test steam profile verification flow
    - [ ] Ensure navbar remains accessible

3. [ ] **Component Fixes**

    - [ ] Fix DefaultSlotContainer export
    - [ ] Verify all component imports
    - [ ] Test component rendering

4. [ ] **Testing**

    - [ ] Test all game functionality
    - [ ] Verify state management
    - [ ] Check animation synchronization
    - [ ] Validate sound system

5. [ ] **Documentation**
    - [ ] Update component documentation
    - [ ] Document state management changes
    - [ ] Update API documentation

## Implementation Notes

1. **Server Actions**

    - Always use `'use server'` directive
    - Use direct database access
    - Add proper validation
    - Handle errors gracefully
    - Do not use API routes, we are using NextJS 15 server actions

2. **Database Access**

    - Use Drizzle ORM
    - Add proper transactions
    - Validate data integrity
    - Handle race conditions

3. **State Management**

    - Validate server state
    - Update client state
    - Handle loading states
    - Add proper cleanup

4. **Type Safety**
    - Use proper types
    - Add validation
    - Handle null cases
    - Add error types

## Notes

-   Never use API routes
-   Always use server actions
-   Validate database state
-   Handle errors gracefully
-   Use proper types
-   Add proper validation
-   Test thoroughly
-   Document clearly
