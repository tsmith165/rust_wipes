# Giveaway Overlay Component Specification

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions. Do not use API routes. Utilize @Web if needed for context on server actions and their usage
3. Focus on re-usability. We should be able to easily utilize the "wrapper" / "container" components to create other similar pages
4. Do not over-complicate things. Favor simple solutions to complex flows rather than jumping to abstractions
5. If a file is indented > ~5-6 times, we almost certainly need to create some "wrapper" / "container" component
6. Document all assumptions made during implementation in the Current Implementation Details section
7. When making significant architectural decisions, document the reasoning in the Change Log section
8. Do NOT implement tests unless specifically requested. Instead, suggest when manual review by the senior software dev would be beneficial
9. Always update the SPEC file with each change being made to maintain accurate documentation
10. Before implementing changes, review the Previous Implementation Overview section and examine the referenced files to ensure a complete understanding of the existing system
11. As the AI agent you are crucial in this workflow and need to make decisions that are good for the longevity of the project while not over-abstracting and over-complicating things

## Project Details

-   NextJS 15
-   Tailwind CSS
-   Drizzle ORM
-   Server Actions
-   Framer Motion
-   TypeScript

## End Goal

Create a reusable overlay component structure that can be used to display various types of overlays in the application. The first implementation will be a giveaway overlay that shows the top 10 players with the highest minutes_played from the user_playtime table, along with a progress bar indicating how many users have reached the 10-hour requirement.

## Previous Implementation Overview

N/A - New implementation

## Updated Implementation Overview

### File Structure

```
src/
  components/
    overlays/
      Overlay.Container.tsx
      Overlay.Background.tsx
      Overlay.Header.tsx
      Overlay.Title.tsx
      Overlay.Subtitle.tsx
      Overlay.Contents.tsx
      giveaway/
        GiveawayOverlay.tsx
        GiveawayProgress.tsx
        PlayerList.tsx
  app/
    actions/
      Giveaway.Actions.ts
```

### Component Descriptions

-   `Overlay.Container.tsx`: Main container component that manages the overlay's state and composition. Supports different formats (pill/sidebar) and positions.
-   `Overlay.Background.tsx`: Semi-transparent background that can close the overlay when clicked.
-   `Overlay.Header.tsx`: Contains the title and subtitle of the overlay.
-   `Overlay.Title.tsx`: Displays the overlay's title with consistent styling.
-   `Overlay.Subtitle.tsx`: Displays the overlay's subtitle with consistent styling.
-   `Overlay.Contents.tsx`: Container for the main content of the overlay.
-   `GiveawayOverlay.tsx`: Specific implementation for the giveaway feature.
-   `GiveawayProgress.tsx`: Shows progress towards the giveaway goal.
-   `PlayerList.tsx`: Displays top players with pagination (3 players at a time).

## Current Proposed Solution

1. Create a reusable overlay component structure that can be easily extended for different use cases.
2. Implement a "pill" format overlay that can be positioned at various locations within a parent component.
3. Use server actions to fetch giveaway data from the database.
4. Display top players with pagination and rank indicators.
5. Show progress towards the giveaway goal.

## Next Steps

1. ✅ Create base overlay components
2. ✅ Implement server actions for fetching giveaway data
3. ✅ Create giveaway-specific components
4. ✅ Add pagination to player list
5. ✅ Add rank indicators for players
6. ✅ Integrate with homepage
7. Manual testing of all overlay positions and formats
8. Add loading states and error handling
9. Consider adding animations for page transitions in player list
10. Consider adding tooltips for player stats

## Current Unresolved Issues

1. Need to test overlay positioning in different parent containers
2. Need to verify database query performance with large datasets
3. Consider adding error boundaries for better error handling
4. Consider adding retry logic for failed data fetches

## Change Log

1. Initial creation of SPEC file
2. Created base overlay components with support for different formats and positions
3. Implemented server actions for fetching giveaway data
4. Created giveaway-specific components
5. Added pagination to player list (3 players at a time)
6. Added rank indicators with emojis for top 3 players
7. Updated overlay styling to use a gradient background
8. Made overlay more compact and visually distinct
9. Added navigation arrows for player list pagination
10. Updated title and subtitle to be more engaging
