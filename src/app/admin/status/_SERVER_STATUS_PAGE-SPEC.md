# Server Status Page Implementation Specification

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions, not API routes. Utilize @Web for context on server actions and their usage
3. Focus on re-usability. Components should be easily reusable for similar pages
4. Favor simple solutions over complex flows. Consult senior dev for overly-complex implementations
5. Create wrapper/container components when file indentation exceeds 5-6 levels
6. Document all assumptions in Current Implementation Details section
7. Document architectural decisions in Change Log section
8. Do not implement tests unless specifically requested
9. Update SPEC file with each change to maintain accurate documentation
10. Review implementation overview and examine referenced files before making changes
11. Make decisions beneficial for project longevity without over-abstracting
12. Use NextJS 15's `use cache` directive instead of legacy `unstable_cache`

## Project Details

-   NextJS 15.0.1 (using `use cache` directive)
-   TailwindCSS 3.4.14
-   Drizzle ORM 0.30.10
-   Server Actions (no API routes)
-   Framer Motion 12.0.0-alpha.1
-   React 19.0.0-rc
-   TypeScript 5.6.3
-   Clerk Auth 6.0.2
-   React Icons 5.3.0
-   Zustand 4.5.5
-   NUQS 2.0.4

## End Goal

Create an admin-protected server status dashboard that:

1. Displays detailed status information for each server in next_wipe_info table
2. Shows real-time server metrics including:
    - Server name and connection details (IP:Port)
    - Player count and max players (from BM API)
    - Current Rust version
    - Time since last restart
    - Time since last wipe
    - Pterodactyl panel link (using truncated server UUID)
    - BattleMetrics link (as control button)
3. Uses reusable card components for consistent display
4. Auto-revalidates every 5 seconds
5. Implements server-side caching
6. Uses Zustand for state management

## Updated Implementation Overview

### File Structure

```
/src
  /app
    /admin
      /status
        _SERVER_STATUS_PAGE-SPEC.md
        page.tsx
        Status.Container.tsx
        Status.Actions.ts
        Status.Constants.ts
        Status.Controls.tsx
  /components
    /ui
      /card
        Card.Container.tsx
        Card.Header.tsx
        Card.Title.tsx
        Card.Content.tsx
        Card.Controls.tsx
        Card.Controls.Button.tsx
        Card.Error.tsx
        Card.Success.tsx
  /stores
    Store.ServerStatus.ts
  /utils
    /battlemetrics
      BattleMetricsAPI.ts
```

### Component Refactoring

1. Card.Controls.tsx:

    - Convert to generic wrapper component
    - Accept children prop for buttons
    - Maintain consistent spacing and layout
    - Remove status-specific logic

2. Status.Controls.tsx:
    - New component for status-specific controls
    - Contains server control buttons
    - Uses Card.Controls.tsx as wrapper
    - Handles server-specific logic

### Data Flow Updates

1. Component Hierarchy:

    ```
    Status.Container.tsx
    └── Card.Container.tsx
        ├── Card.Header.tsx
        ├── Card.Content.tsx
        └── Status.Controls.tsx
            └── Card.Controls.tsx
                └── Card.Controls.Button.tsx
    ```

2. Props Flow:
    - Status.Container.tsx passes server data to Status.Controls.tsx
    - Status.Controls.tsx handles server-specific logic
    - Card.Controls.tsx provides layout and spacing
    - Card.Controls.Button.tsx remains unchanged

## Current Implementation Details

1. Schema:

    - Added bm_id field to next_wipe_info table
    - Field is optional to maintain backward compatibility
    - Using server_uuid field for Pterodactyl panel links
    - Using bm_id for BattleMetrics deep links

2. BattleMetrics API:

    - Using public API endpoint without authentication
    - Caching responses for 60 seconds using Next.js fetch cache
    - Graceful error handling with fallback values
    - BattleMetrics link moved to control button for consistency

3. Component Structure:

    - Card.Controls.tsx:

        - Generic wrapper component
        - Accepts children prop
        - Provides consistent layout
        - No business logic

    - Status.Controls.tsx:
        - Server-specific control component
        - Contains external links
        - Contains server control buttons
        - Handles server-specific logic
        - Uses Card.Controls.tsx as wrapper

4. Revalidation Strategy:
    - Auto-revalidation every 5 seconds
    - Manual refresh capability
    - Loading states during refresh
    - Cache invalidation on command execution

## Next Steps

1. Refactor Card.Controls.tsx:

    - Remove server-specific logic
    - Convert to generic wrapper
    - Add children prop
    - Maintain spacing and layout

2. Create Status.Controls.tsx:

    - Move server controls from Card.Controls.tsx
    - Implement external link buttons
    - Handle server-specific logic
    - Use Card.Controls.tsx as wrapper

3. Update Card.Content.tsx:

    - Update imports
    - Replace Card.Controls with Status.Controls
    - Maintain existing functionality

4. Update Status.Container.tsx:

    - Update component references
    - Ensure proper prop passing
    - Maintain state management

5. Test Implementation:
    - Verify all functionality works
    - Check styling consistency
    - Test revalidation timing
    - Verify button behavior

## Current Unresolved Issues

1. Need to ensure consistent spacing in generic Card.Controls
2. Need to verify reusability of Card.Controls
3. Need to test with different button configurations
4. Previous issues remain...

## Change Log

-   Initial SPEC creation with project structure and requirements
-   Defined component hierarchy and data flow
-   Outlined implementation steps and dependencies
-   Added BattleMetrics API integration plan
-   Added bm_id field to next_wipe_info table
-   Created utility structure for BattleMetrics API
-   Updated data flow to include API integration
-   Added rate limiting considerations
-   Updated next steps with API integration tasks
-   Implemented BattleMetrics API utility
-   Added bm_id field to schema
-   Updated Status.Actions.ts with BattleMetrics integration
-   Added error handling and fallbacks
-   Implemented 60-second cache
-   Updated SPEC with implementation details
-   Added new next steps for testing and deployment
-   Added Pterodactyl panel link button requirements
-   Updated implementation details with Pterodactyl integration
-   Added new next steps for panel link implementation
-   Updated current issues with panel link considerations
-   Moved BattleMetrics link to control button
-   Updated external link handling strategy
-   Consolidated external link styling
-   Updated component structure for consistency
-   Updated component structure for better reusability
-   Created new Status.Controls.tsx component
-   Converted Card.Controls.tsx to generic wrapper
-   Updated revalidation time to 5 seconds
-   Previous changes remain...
