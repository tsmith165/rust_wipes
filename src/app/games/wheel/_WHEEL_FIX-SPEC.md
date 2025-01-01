# Wheel Component Fix Specification

## AI Agent Rules

1. Follow NextJS 15 best practices and use server actions instead of API routes
2. Focus on reusability and maintainable component structure
3. Keep solutions simple, avoid over-abstraction
4. Document all assumptions and architectural decisions
5. Update this spec file with each change
6. Review existing implementation before making changes
7. Ensure changes maintain component consistency with RustySlots implementation

## Project Details

-   NextJS 15
-   TailwindCSS
-   Drizzle ORM
-   Framer Motion
-   Server Actions
-   TypeScript

## End Goal

Fix several critical issues in the wheel component:

1. Bonus modal positioning and container structure
2. Auto-spin timing and control
3. Wheel segment overflow and z-index issues

## Previous Implementation Overview

### File Structure

```
src/app/games/wheel/
├── Wheel.Actions.ts
├── Wheel.Constants.ts
├── Wheel.Container.tsx
├── Wheel.Store.ts
└── page.tsx

src/components/games/
├── base/
│   ├── BaseGame.Container.tsx
│   ├── BaseGame.Controls.tsx
│   ├── BaseGame.WinOverlay.tsx
│   └── BaseGame.BonusModal.tsx
└── wheel/
    ├── Wheel.Display.tsx
    └── Wheel.SoundManager.tsx
```

### Current Issues

1. **Bonus Modal Positioning**

    - Not properly positioned in row1 of container
    - Inconsistent with RustySlots implementation
    - Missing proper ref handling

2. **Auto-Spin Behavior**

    - Spamming spins without waiting for completion
    - No proper timing control
    - Missing spin completion check

3. **Wheel Segment Overflow**

    - Segments overflow parent container
    - Overlays controls making them unclickable
    - Z-index hierarchy issues

4. **Wheel Spin Direction**
    - Inconsistent spin direction (randomly going left/right)
    - Lost rotation calculation from main branch
    - Incorrect state management for wheel rotation

### Main Branch Analysis

1. **Rotation Handling (Main Branch)**

```typescript
// Correct rotation calculation
const baseRotation = 5 * 360; // 5 full rotations
const randomExtraRotation = Math.floor(Math.random() * 360);
const totalRotation = baseRotation + randomExtraRotation;
const finalDegree = (currentRotation + totalRotation) % 360;

// Main branch sets rotation cumulatively
setCurrentRotation(currentRotation + totalRotation);
```

2. **State Management (Main Branch)**

```typescript
// Proper state updates with timing
setTimeout(() => {
    setSpinning(false);
    setShowOverlay(true);
    setShowWinOverlay(true);
    // ... other state updates
}, 5000); // Matches wheel animation duration
```

## Updated Implementation Overview

### Component Structure Changes

1. **Wheel.Container.tsx**

    - Add clear row structure comments
    - Implement row1Ref for proper modal positioning
    - Match RustySlots.Container.tsx layout
    - **Restore main branch rotation logic**

2. **BaseGame.Controls.tsx**

    - Increase z-index to prevent wheel overlap
    - Ensure consistent clickability

3. **Auto-spin Logic**

    - Add spin completion tracking
    - Implement proper timing controls
    - Add safety checks

4. **Wheel Rotation Logic**
    - Restore cumulative rotation calculation
    - Ensure consistent clockwise rotation
    - Match animation timing with state updates

## Current Proposed Solution

### 1. Container Structure Fix

```typescript
// Wheel.Container.tsx structure
<div className="relative flex h-[calc(100dvh-50px)] w-full flex-col">
  {/* Row 1: Characters and Wheel Display */}
  <div ref={row1Ref} className="z-10 flex w-full">
    <WheelDisplay />
  </div>

  {/* Row 2: Controls */}
  <div className="z-20 w-full">
    <BaseGameControls />
  </div>

  {/* Row 3: Recent Winners */}
  <div className="z-10 w-full">
    <WheelRecentWinners />
  </div>

  {/* Overlays positioned relative to row1Ref */}
  <BaseGameBonusModal containerRef={row1Ref} />
</div>
```

### 2. Z-index Hierarchy

```css
/* Z-index structure */
.wheel-display {
    z-index: 10;
}
.game-controls {
    z-index: 20;
}
.bonus-modal {
    z-index: 30;
}
```

### 3. Auto-spin Fix

```typescript
const handleAutoSpin = () => {
    if (isSpinning || !isAutoSpinning) return;

    const spinDelay = 3000; // 3 seconds between spins
    const spinTimeout = setTimeout(() => {
        if (!isSpinning) {
            handleSpin();
        }
    }, spinDelay);

    return () => clearTimeout(spinTimeout);
};
```

### 4. Wheel Rotation Fix

```typescript
const handleSpin = async () => {
    if (!steamProfile?.steamId || !steamProfile.code || isSpinning) return;

    try {
        setSpinning(true);
        const spinResult = await spinWheel(steamProfile.steamId, steamProfile.code, currentRotation);

        if (spinResult.success && spinResult.data) {
            // Update rotation cumulatively
            setCurrentRotation(currentRotation + spinResult.data.totalRotation);

            // Wait for animation to complete (5 seconds)
            setTimeout(() => {
                setSpinning(false);
                setShowOverlay(true);
                // ... other state updates
            }, 5000);
        }
    } catch (err) {
        // ... error handling
    }
};
```

## Next Steps

1. **Container Structure Update**

    - [x] Update Wheel.Container.tsx to match RustySlots structure
    - [x] Add proper row comments and organization
    - [x] Implement row1Ref handling

2. **Z-index Hierarchy**

    - [x] Update BaseGame.Controls.tsx z-index
    - [x] Adjust wheel segment container constraints
    - [x] Test control clickability

3. **Auto-spin Logic**

    - [x] Implement spin completion tracking
    - [x] Add proper timing controls
    - [x] Test auto-spin behavior

4. **Wheel Rotation Fix**

    - [ ] Restore main branch rotation calculation
    - [ ] Implement cumulative rotation updates
    - [ ] Sync animation timing with state updates
    - [ ] Test spin direction consistency

5. **Bonus Modal Positioning**
    - [x] Update modal to use row1Ref
    - [x] Test modal positioning
    - [x] Verify consistency with RustySlots

## Current Unresolved Issues

1. Need to verify if wheel animation timing affects auto-spin behavior
2. May need to adjust wheel size based on viewport to prevent overflow
3. Consider mobile responsiveness implications of z-index changes
4. **Verify rotation calculation for different viewport sizes**
5. **Test edge cases for cumulative rotation values**

## Change Log

-   Initial spec creation
-   Identified three main issues: bonus modal positioning, auto-spin behavior, and wheel segment overflow
-   Proposed solutions for each issue with specific implementation details
-   Created step-by-step plan for fixes
-   **Update 1**: Fixed container structure and z-index hierarchy
    -   Updated Wheel.Container.tsx to match RustySlots structure
    -   Added proper z-index hierarchy
    -   Added containerRef to modals and overlays
-   **Update 2**: Fixed auto-spin logic
    -   Added isSpinning check to prevent spin spamming
    -   Added minimum 2-second delay between spins
    -   Set fixed 3-second interval for auto-spins
    -   Added proper cleanup of timeouts
-   **Update 3**: Identified wheel rotation issues
    -   Analyzed main branch implementation
    -   Found inconsistencies in rotation calculation
    -   Documented fixes for spin direction
    -   Added rotation-specific test cases
