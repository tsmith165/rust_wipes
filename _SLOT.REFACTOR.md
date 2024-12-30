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

### Current Issues

1. Animation and sound synchronization:
    - Reel animations stop working after the first spin
    - Sounds from previous spins are not stopping
    - Winning cells and lines animations are not smooth
2. Missing features from original implementation:
    - "Show Lines" functionality
    - Pattern preview for winning lines
    - Smooth path drawing animations for winning lines

## Required Changes

### 1. Fix Animation Issues

-   Update `@Slot.Grid.tsx` to properly reset animation state between spins:

```typescript
// Add animation state management
const [isAnimating, setIsAnimating] = React.useState(false);
const [currentReelIndex, setCurrentReelIndex] = React.useState(-1);

// Update spin animation logic
useEffect(() => {
    if (isSpinning) {
        setIsAnimating(true);
        setCurrentReelIndex(-1);
    } else {
        setIsAnimating(false);
    }
}, [isSpinning]);

// Update reel animation
<motion.div
    key={`reel-${i}-${reel.length}-${spinKey}`}
    className="flex flex-col items-center"
    animate={
        isAnimating && spinAmounts.length > 0
            ? {
                  y: [0, -(calculateReelHeight(reel.length) - calculateReelHeight(5))],
              }
            : {
                  y: -(calculateReelHeight(reel.length) - calculateReelHeight(5)),
              }
    }
    transition={
        isAnimating
            ? {
                  duration: 2 + i * 0.5,
                  ease: [0.45, 0.05, 0.55, 0.95],
                  times: [0, 1],
                  onComplete: () => {
                      soundManagerRef?.current?.playSpinEnd();
                      setCurrentReelIndex(i);
                      if (i === grid.length - 1) {
                          onSpinComplete?.();
                          setIsAnimating(false);
                      }
                  },
              }
            : {
                  duration: 0,
              }
    }
>
```

### 2. Add Winning Lines Component

-   Create new `@Slot.WinningLines.tsx` component:

```typescript
export function SlotWinningLines({ lines, itemSize, gap, className, animate = true, onLineHover }: WinningLinesProps) {
    const [hoveredLine, setHoveredLine] = useState<number | null>(null);
    const [showAllLines, setShowAllLines] = useState(true);

    useEffect(() => {
        if (animate) {
            setShowAllLines(false);
            const timer = setTimeout(() => setShowAllLines(true), 500);
            return () => clearTimeout(timer);
        }
    }, [animate]);

    return (
        <div className={cn('relative', className)}>
            <svg className="h-full w-full">
                <AnimatePresence>
                    {lines.map((line, index) => (
                        <LinePattern
                            key={index}
                            pattern={line}
                            itemSize={itemSize}
                            gap={gap}
                            color="#32CD32"
                            opacity={hoveredLine === null || hoveredLine === index ? 1 : 0.3}
                            isHighlighted={hoveredLine === index}
                            isAnimating={!showAllLines && animate}
                        />
                    ))}
                </AnimatePresence>
            </svg>
        </div>
    );
}
```

### 3. Sound Management

-   Update sound handling in `@Default.Container.tsx`:

```typescript
// Add sound cleanup
useEffect(() => {
    return () => {
        soundManagerRef.current?.stopAllSounds();
    };
}, []);

// Update spin handling
const handleSpin = async () => {
    // Stop any playing sounds
    soundManagerRef.current?.stopAllSounds();

    // Play handle pull sound
    soundManagerRef.current?.playHandlePull();

    // Start spin animation
    setSpinning(true);
    soundManagerRef.current?.playSpinStart();

    // ... rest of spin logic ...
};
```

### 4. Pattern Preview

-   Add pattern preview component to `@Slot.WinningLines.tsx`:

```typescript
const PatternPreview: React.FC<PatternPreviewProps> = ({ patterns, itemSize, gap, className, onPatternClick }) => {
    const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

    return (
        <div className={cn('grid grid-cols-2 gap-4', className)}>
            {Object.entries(patterns).map(([type, pattern]) => (
                <motion.div
                    key={type}
                    className="relative cursor-pointer rounded-lg bg-stone-800 p-4"
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => setHoveredPattern(type)}
                    onHoverEnd={() => setHoveredPattern(null)}
                    onClick={() => onPatternClick?.(type)}
                >
                    <svg className="h-full w-full">
                        <LinePattern
                            pattern={pattern[0]}
                            itemSize={itemSize}
                            gap={gap}
                            color={hoveredPattern === type ? '#32CD32' : '#666'}
                            isHighlighted={hoveredPattern === type}
                            isAnimating={hoveredPattern === type}
                        />
                    </svg>
                    <div className="mt-2 text-center text-sm capitalize text-white">
                        {type.replace('_', ' ')}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
```

## Next Steps

1. Implement animation state management in `@Slot.Grid.tsx`
2. Create and integrate `@Slot.WinningLines.tsx` component
3. Update sound management to prevent overlapping sounds
4. Add pattern preview functionality
5. Test all animations and interactions
6. Verify smooth transitions between states
7. Ensure proper cleanup of animations and sounds

## Notes

-   Animation timing should be consistent with the original implementation
-   Sound effects should be properly synchronized with animations
-   Pattern preview should be responsive and interactive
-   All animations should use Framer Motion for consistent behavior
-   Proper cleanup is essential to prevent memory leaks and audio issues
