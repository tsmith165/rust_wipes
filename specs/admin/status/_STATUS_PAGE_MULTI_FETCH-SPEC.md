# Status Page Multi-Fetch Optimization Spec

## AI Agent Rules

1. Do not modify spec structure, only add to sections
2. Use NextJS 15 server actions, not API routes
3. Focus on component reusability
4. Favor simple solutions over complex abstractions
5. Create wrapper/container components for deep nesting
6. Document all implementation assumptions
7. Document architectural decisions in Change Log
8. Skip tests unless requested, suggest manual review points
9. Keep spec updated with all changes
10. Review existing implementation before changes
11. Make decisions for project longevity without over-abstraction

## Project Details

-   NextJS 15.0.1
-   React 19.0.0-rc
-   TypeScript 5.6.3
-   TailwindCSS 3.4.14
-   Drizzle ORM 0.30.10
-   Framer Motion 12.0.0-alpha.1
-   Zustand 4.5.5
-   Axios 1.7.7

## End Goal

Optimize BattleMetrics API usage in the Status page by implementing bulk server data fetching instead of individual requests. This will reduce API calls from 8 requests per refresh to 1 request, significantly reducing API load and improving performance.

## Previous Implementation Overview

File Structure:

```
src/app/admin/status/
├── Status.Actions.ts      # Server actions for status operations
├── Status.Container.tsx   # Main container component
├── Status.Controls.tsx    # Control components
└── page.tsx              # Page component
```

Current Implementation:

-   Status.Actions.ts fetches server data individually for each server
-   Each refresh triggers multiple BattleMetrics API calls
-   Auto-refresh every 5 seconds multiplies API call frequency
-   No caching or bulk fetching implemented

## Updated Implementation Overview

File Structure (Same as previous, no new files needed):

```
src/app/admin/status/
├── Status.Actions.ts      # Updated with bulk fetching
├── Status.Container.tsx   # Updated to handle bulk data
├── Status.Controls.tsx    # Unchanged
└── page.tsx              # Unchanged
```

Changes:

-   Modified Status.Actions.ts to use fetchBattleMetricsServers for bulk fetching
-   Removed individual fetchBattleMetricsData function
-   Added proper TypeScript interfaces for plugin data
-   Implemented bulk server data processing
-   Utilizing existing caching mechanism from actions.ts

## Current Proposed Solution

1. Utilize existing fetchBattleMetricsServers function from actions.ts
2. Modify getServerStatus to fetch all server data in one request
3. Update data processing to handle bulk response
4. Maintain existing UI components and functionality
5. Implement caching with 5-second TTL

## Next Steps

1. Update Status.Actions.ts:

    - Import and use fetchBattleMetricsServers
    - Modify getServerStatus to collect all server IDs first
    - Update data processing for bulk response
    - Implement caching mechanism

2. Verify Implementation:

    - Manual testing of auto-refresh functionality
    - Verify server status accuracy
    - Check network tab for reduced API calls
    - Ensure all server data is correctly displayed

3. Documentation:

    - Update comments in Status.Actions.ts
    - Document the caching mechanism
    - Add performance improvement metrics

## Change Log

Initial spec creation - [Current Date]

-   Documented current implementation
-   Outlined optimization strategy
-   Defined next steps for implementation

Implementation Phase 1 - [Current Date]

-   Updated Status.Actions.ts to use bulk fetching
-   Removed individual server fetching
-   Added proper TypeScript interfaces
-   Implemented bulk data processing
-   Utilizing existing caching mechanism
-   Note: rust_build field is not available in bulk fetch, defaulting to 'Unknown'
