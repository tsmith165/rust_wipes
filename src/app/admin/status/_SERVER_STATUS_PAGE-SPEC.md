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
3. Uses reusable card components for consistent display
4. Auto-revalidates every 60 seconds
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
  /components
    /ui
      /card
        Card.Container.tsx
        Card.Header.tsx
        Card.Title.tsx
        Card.Content.tsx
  /stores
    Store.ServerStatus.ts
  /utils
    /battlemetrics
      BattleMetricsAPI.ts
```

### Database Schema Changes

Added to next_wipe_info table:

-   bm_id: varchar (BattleMetrics server ID)

### BattleMetrics API Integration

Implemented:

-   Public API endpoint integration
-   60-second response caching
-   Error handling for failed requests
-   Fallback values for offline servers

## Current Implementation Details

1. Schema:

    - Added bm_id field to next_wipe_info table
    - Field is optional to maintain backward compatibility

2. BattleMetrics API:

    - Using public API endpoint without authentication
    - Caching responses for 60 seconds using Next.js fetch cache
    - Graceful error handling with fallback values

3. Data Flow:
    - Server-side data fetching with React cache
    - Zustand store for client-side state management
    - 60-second auto-revalidation
    - Error states for offline/unreachable servers

## Next Steps

1. Create database migration for bm_id column
2. Add bm_id values for existing servers
3. Test BattleMetrics API integration:
    - Test with valid bm_id
    - Test with invalid bm_id
    - Test with rate limiting
    - Test offline server handling
4. Add loading states to UI
5. Implement error boundaries
6. Add retry mechanism for failed API calls
7. Document BattleMetrics API usage
8. Monitor API rate limits in production

## Current Unresolved Issues

1. Need to create database migration
2. Need to populate bm_id for existing servers
3. Need to test rate limiting in production
4. Need to implement proper error boundaries
5. Need to add loading states
6. Need to document API usage and limitations

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
