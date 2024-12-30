# Slot Machine Refactor Status

## Current State

### Completed Features

1. Base component architecture with three main sections:
    - Slot Grid
    - Slot Controls
    - Recent Winners
2. Sound management system
3. Initial grid loading with random symbols
4. Basic spin animation
5. Bonus type selection modal
6. Recent winners display with incremental updates
7. Win overlay with confetti
8. Steam authentication integration
9. Simplified winning lines display
10. Centralized state management with Zustand
11. Reusable confetti overlay component

### Current Issues

1. Animation and sound synchronization:
    - Need to ensure sounds stop properly between spins
    - Winning cells animations could be smoother
2. State management:
    - Some components still using local state unnecessarily
    - Need to optimize store selectors
3. Winning Lines:
    - Need to separate actual win lines from possible win lines
    - Add cycling through possible winning patterns
    - Improve line transitions

## Required Changes

### 1. Winning Lines State Update

```typescript
// Update slot_game_store.ts to separate win lines from possible lines
interface SlotGameState {
    winningLines: {
        lines: number[][][]; // Current win lines
        isVisible: boolean; // Whether win lines are visible
    };
    possibleLines: {
        lines: number[][][]; // All possible winning patterns
        isVisible: boolean; // Whether showing possible patterns
        currentLineIndex: number; // Current pattern being shown
    };
}

// Add actions for possible lines
interface SlotGameActions {
    setPossibleLinesVisibility: (isVisible: boolean) => void;
    setCurrentPossibleLine: (index: number) => void;
    cyclePossibleLines: () => void;
}
```

### 2. Animation Synchronization

```typescript
// Update sound and animation cleanup
const showPossibleLines = () => {
    // Stop all current animations and sounds
    soundManagerRef.current?.stopAllSounds();
    setWinningLinesVisibility(false);
    setWinningCells([]);
    setBonusCells([]);

    // Start showing possible lines
    setPossibleLinesVisibility(true);
    startLineCycling();
};
```

### 3. Line Cycling Enhancement

```typescript
// Add line cycling functionality
useEffect(() => {
    if (possibleLines.isVisible) {
        const interval = setInterval(() => {
            cyclePossibleLines();
        }, 2000);
        return () => clearInterval(interval);
    }
}, [possibleLines.isVisible]);
```

## Next Steps

1. [ ] **Winning Lines Update**

    - [ ] Update store with possible lines state
    - [ ] Add line cycling functionality
    - [ ] Update controls button text and behavior
    - [ ] Add cleanup when toggling possible lines

2. [ ] **Animation Synchronization**

    - [ ] Add proper cleanup of animations
    - [ ] Stop sounds when showing possible lines
    - [ ] Improve line transition animations
    - [ ] Add animation timing constants

3. [ ] **State Management**

    - [ ] Add store selectors
    - [ ] Optimize re-renders
    - [ ] Add state persistence where needed
    - [ ] Clean up unused state

4. [ ] **Testing**
    - [ ] Test line cycling
    - [ ] Verify animation cleanup
    - [ ] Check state transitions
    - [ ] Validate display behavior

## Implementation Notes

1. **Winning Lines**

    - Keep actual win lines and possible lines separate
    - Clear win state when showing possible lines
    - Use smooth transitions between lines
    - Maintain consistent timing

2. **State Management**

    - Use selectors for performance
    - Keep state organized and clean
    - Handle transitions smoothly
    - Maintain type safety

3. **Components**

    - Keep focused and simple
    - Use proper cleanup
    - Handle edge cases
    - Maintain consistent styling

4. **Testing**
    - Test edge cases
    - Verify animations
    - Check state updates
    - Validate cleanup

## Notes

-   Follow TypeScript best practices
-   Maintain consistent error handling
-   Use proper cleanup in effects
-   Keep components focused
-   Use store selectors efficiently
-   Handle edge cases gracefully
