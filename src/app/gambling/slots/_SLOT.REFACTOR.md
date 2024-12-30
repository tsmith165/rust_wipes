# Slot Machine Refactoring Specification

## Original Implementation

### Core Files

1. **@Slot.Actions.ts**

    - Server actions for slot machine
    - Handles spin logic and rewards
    - Uses Steam auth for user verification
    - No database operations, pure game logic

2. **@Slot.Constants.ts**

    - Game configuration constants
    - Symbol definitions and probabilities
    - Payout values and multipliers
    - Winning pattern definitions

3. **@page.tsx**

    - Main page component
    - No direct auth checks (handled by Steam)
    - Simple wrapper for slot container

4. **@Slot.Container.tsx**

    - Main game container
    - Manages game state and animations
    - Handles user interactions
    - Composes all game components

5. **@Slot.Controls.tsx**

    - User control interface
    - Spin button and auto-spin
    - Sound controls
    - Steam profile integration

6. **@Slot.RecentWinners.tsx**

    - Displays recent winning spins
    - Real-time updates
    - Steam profile integration

7. **@Slot.Utils.ts**
    - Game utility functions
    - Random symbol generation
    - Array manipulation helpers
    - No auth or database logic

## Current State

### Completed Components

1. Base Components (`/components/slot/base/`)

    - `Slot.Container.tsx`: Main layout wrapper
    - `Slot.Character.tsx`: Character display with mirroring
    - `Slot.Controls.tsx`: User controls and profile display with Steam integration

2. Game Components (`/components/slot/game/`)

    - `Slot.Grid.tsx`: Main grid with animations
    - `Slot.WinOverlay.tsx`: Win celebration
    - `Slot.BonusModal.tsx`: Bonus selection
    - `Slot.Sound.tsx`: Sound management

3. Default Implementation (`/app/gambling/slots/default/`)

    - `Default.Constants.ts`: Game configuration
    - `Default.Utils.ts`: Utility functions
    - `Default.Actions.ts`: Server actions with Steam auth
    - `Default.Container.tsx`: Main container with Steam integration
    - `page.tsx`: Page component

4. State Management
    - Created types for state and props
    - Implemented Zustand store
    - Added Steam user integration

### Recent Changes

1. **Fixed Layout Issues**

    - Updated container layout to match original implementation
    - Fixed controls positioning below slot machine
    - Added proper Steam sign-in modal
    - Added proper character positioning
    - Added proper grid sizing and spacing
    - Added proper controls layout
    - Added proper recent winners section

2. **Fixed Controls Component**

    - Added proper Steam profile display
    - Added proper credits display
    - Added proper free spins display
    - Added proper auto-spin functionality
    - Added proper sound controls
    - Added proper tooltips
    - Added proper button states
    - Added proper type safety

3. **Fixed WinOverlay Component**

    - Added proper confetti animation
    - Added proper win celebration
    - Added proper payout display
    - Added proper bonus spins display
    - Added proper type safety
    - Added proper cleanup

4. **Fixed BonusModal Component**

    - Added proper bonus type selection
    - Added proper animations
    - Added proper hover effects
    - Added proper confetti
    - Added proper type safety
    - Added proper cleanup

5. **Fixed Sound System**

    - Added proper sound file paths
    - Added proper sound preloading
    - Added proper volume control
    - Added proper fade effects
    - Added proper error handling
    - Added proper cleanup

### Current Issues

1. **Missing Features**

    - Recent winners section not implemented
    - Winning lines display not complete
    - Credits animation not implemented

2. **Type Safety**

    - Need to add proper type validation for server responses
    - Need to add proper error handling for failed requests
    - Need to add proper loading states

3. **Testing**

    - Need to add unit tests
    - Need to add integration tests
    - Need to add end-to-end tests

4. **Type Safety in Default.Container.tsx**

    - Improper handling of `SpinResult` data destructuring
    - Incorrect typing for `setAutoSpinning` function
    - Missing props in `SteamSignInModal` component
    - Implicit any types in callback functions

5. **Component Integration**

    - Steam sign-in modal missing required props
    - Auto-spin state management needs proper typing
    - Result data handling needs null safety

6. **Layout Consistency**

    - Need to maintain exact layout from original implementation
    - Controls positioning must match original design
    - Character positioning and scaling needs verification

## Required Changes

1. **Recent Winners**

    ```tsx
    <div className="mt-4 w-full max-w-[1200px] px-4 pb-4">
        <div className="rounded-lg bg-stone-700 p-4">
            <SlotRecentWinners winners={winners} isLoading={loadingWinners} error={winnersError} />
        </div>
    </div>
    ```

2. **Winning Lines**

    ```tsx
    <div className="absolute inset-0 z-10">
        <svg className="h-full w-full">
            {winningLines.map((line, index) => (
                <polyline
                    key={index}
                    points={line
                        .map(([x, y]) => `${x * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2},${y * (ITEM_HEIGHT + GAP) + ITEM_HEIGHT / 2}`)
                        .join(' ')}
                    className="stroke-primary_light stroke-2"
                    fill="none"
                />
            ))}
        </svg>
    </div>
    ```

3. **Credits Animation**

    ```tsx
    <motion.span
        key={credits}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="text-xl font-bold text-white"
    >
        {credits.toLocaleString()}
    </motion.span>
    ```

4. **Type Safety Fixes in Default.Container.tsx**

    ```typescript
    // 1. Safe SpinResult handling
    const handleSpin = React.useCallback(async () => {
        if (!steamId || !authCode || isSpinning) return;
        if (freeSpins < 1 && (credits === null || credits < 5)) {
            setAutoSpinning(false);
            return;
        }

        setSpinning(true);
        setShowWinOverlay(false);
        setShowConfetti(false);

        try {
            const result = await spin(steamId, authCode);
            if (!result.success || !result.data) {
                setError(result.error || 'An error occurred during spin');
                setSpinning(false);
                return;
            }

            const spinResult = result.data;
            setGrid(spinResult.finalVisibleGrid);
            setSpinAmounts(spinResult.spinAmounts);
            setCredits(spinResult.credits);
            setFreeSpins(spinResult.freeSpinsAvailable);
            setWinningCells(spinResult.winningCells);
            setBonusCells(spinResult.bonusCells);
            setWinningLines(spinResult.winningLines);
            setLastResult(spinResult);

            if (spinResult.needsBonusTypeSelection) {
                setShowBonusModal(true);
                setShowConfetti(true);
                setAutoSpinning(false);
            } else if (spinResult.payout.length > 0 || spinResult.bonusSpinsAwarded > 0) {
                setShowWinOverlay(true);
                setShowConfetti(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setSpinning(false);
        }
    }, [steamId, authCode, isSpinning, credits, freeSpins, setSpinning, /* ... other deps */]);

    // 2. Proper auto-spin state management
    interface SlotGameState {
        // ... other state properties
        isAutoSpinning: boolean;
        setAutoSpinning: (value: boolean | ((prev: boolean) => boolean)) => void;
    }

    // 3. Complete Steam sign-in modal implementation
    const [steamInput, setSteamInput] = React.useState('');
    const [code, setCode] = React.useState('');

    if (!isVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-800">
                <SteamSignInModal
                    onVerify={handleVerify}
                    steamInput={steamInput}
                    setSteamInput={setSteamInput}
                    code={code}
                    setCode={setCode}
                />
            </div>
        );
    }
    ```

5. **Store Type Updates**

    ```typescript
    // slot_game_store.ts
    interface SlotGameState {
        // ... existing state properties
        setAutoSpinning: (value: boolean | ((prev: boolean) => boolean)) => void;
    }

    export const useSlotGame = create<SlotGameState>((set) => ({
        // ... existing state
        setAutoSpinning: (value) =>
            set((state) => ({
                isAutoSpinning: typeof value === 'function' ? value(state.isAutoSpinning) : value,
            })),
    }));
    ```

6. **Steam Authentication Types**

    ```typescript
    // steam_user_store.ts
    interface SteamSignInModalProps {
        onVerify: (profileData: SteamProfile) => Promise<void>;
        steamInput: string;
        setSteamInput: (value: string) => void;
        code: string;
        setCode: (value: string) => void;
    }

    interface SteamProfile {
        name: string;
        avatarUrl: string;
        steamId: string;
    }
    ```

## Next Steps

1. **Recent Winners**

    - Implement recent winners component
    - Add real-time updates
    - Add Steam profile integration
    - Add proper error handling

2. **Winning Lines**

    - Implement winning lines display
    - Add pattern animations
    - Add hover effects
    - Add pattern descriptions

3. **Credits Animation**

    - Implement credits animation
    - Add particle effects
    - Add highlight effects
    - Add proper cleanup

4. **Type Safety Implementation**

    - Update `Default.Container.tsx` with safe SpinResult handling
    - Fix auto-spin state management
    - Complete Steam sign-in modal integration
    - Add proper error boundaries

5. **Steam Integration**

    - Complete Steam sign-in modal props
    - Implement proper state management
    - Add proper error handling
    - Maintain session state

6. **Layout Structure**

    ```tsx
    <div className="relative flex h-[calc(100dvh-50px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-stone-800 text-white">
        {/* Main Content Layer */}
        <div className="z-10 flex w-full flex-col items-center">
            {/* Slot Machine Section */}
            <div className="flex w-full flex-row items-center justify-center">
                {/* Characters and Grid Layout */}
                <div className="z-100 hidden h-full w-1/4 items-end justify-end md:!flex">{/* Left Character */}</div>
                <div className="z-50 w-full p-4 md:w-1/2">{/* Grid and Controls */}</div>
                <div className="z-100 hidden h-full w-1/4 items-end justify-start md:!flex">{/* Right Character */}</div>
            </div>
            {/* Recent Winners Section */}
            <div className="mt-4 w-full max-w-[1200px] px-4 pb-4">{/* Winners Content */}</div>
        </div>
    </div>
    ```

## Action Items

1. Create recent winners component
2. Create winning lines display
3. Create credits animation
4. Add proper testing
5. Add proper documentation
6. Update type definitions in `Default.Container.tsx`
7. Fix Steam sign-in modal integration
8. Verify layout matches original
9. Add proper error handling
10. Implement proper state management
11. Add comprehensive testing

## Notes

-   Keep exact original behavior
-   Maintain Steam integration
-   Focus on type safety
-   Document any remaining differences
-   Add proper error boundaries
-   Improve loading states
-   Add proper animations
-   Ensure responsive design
-   Add proper accessibility
-   Add proper documentation
-   Add proper testing
-   Add proper error handling
-   Add proper cleanup
-   Add proper performance optimizations
-   Maintain exact original behavior
-   Ensure type safety throughout
-   Keep layout consistent with original
-   Add proper error boundaries
-   Improve state management
-   Add comprehensive testing
-   Document all changes
-   Verify responsive design
-   Test all edge cases
