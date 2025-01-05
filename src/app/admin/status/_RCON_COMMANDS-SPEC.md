# RCON Commands Implementation Specification

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions, not API routes
3. Focus on re-usability of components
4. Favor simple solutions over complex flows
5. Create wrapper/container components when file indentation exceeds 5-6 levels
6. Document all assumptions in Current Implementation Details section
7. Document architectural decisions in Change Log section
8. Do not implement tests unless specifically requested
9. Update SPEC file with each change
10. Review implementation overview before making changes
11. Make decisions beneficial for project longevity without over-abstracting

## Project Details

-   NextJS 15.0.1 (using `use cache` directive)
-   TailwindCSS 3.4.14
-   Drizzle ORM 0.30.10
-   Server Actions (no API routes)
-   Framer Motion 12.0.0-alpha.1
-   React 19.0.0-rc
-   TypeScript 5.6.3
-   RCON Client 4.2.5
-   Zustand 4.5.5

## End Goal

Add RCON command functionality to the server status cards by:

1. Creating reusable card control components
2. Implementing RCON command server actions
3. Adding RCON configuration fields to database schema
4. Supporting three primary commands:
    - Server restart: `servermanager.testrestart`
    - Regular wipe: `servermanager.wipe regular immediate`
    - BP wipe: `servermanager.wipe bp immediate`
5. Proper error handling and display
6. Individual loading states per button
7. Proper RCON connection for Rust with Oxide framework

## Previous Implementation Overview

### File Structure

```
/src
  /app
    /admin
      /status
        page.tsx
        Status.Container.tsx
        Status.Actions.ts
        Status.Constants.ts
  /components
    /ui
      /card
        Card.Container.tsx
        Card.Content.tsx
        Card.Header.tsx
```

### Component Descriptions

-   `Card.Container.tsx`: Main container for server status cards
-   `Card.Content.tsx`: Displays server information
-   `Card.Header.tsx`: Shows server name and status icon
-   `Status.Actions.ts`: Server-side actions for status data
-   `Status.Container.tsx`: Client-side container for status page
-   `page.tsx`: Server status page component

## Updated Implementation Overview

### New File Structure

```
/src
  /app
    /admin
      /status
        page.tsx
        Status.Container.tsx
        Status.Actions.ts
        Status.Constants.ts
        _RCON_COMMANDS-SPEC.md
  /components
    /ui
      /card
        Card.Container.tsx
        Card.Content.tsx
        Card.Header.tsx
        Card.Controls.tsx
        Card.Controls.Button.tsx
        Card.Error.tsx
        Card.Success.tsx
  /stores
    Store.ServerStatus.ts
```

### Database Schema Changes

Added to next_wipe_info table:

-   rcon_ip: varchar (nullable)
-   rcon_port: integer (nullable)
-   rcon_pass: text (nullable)

### Store Updates

Added to ServerStatusStore:

-   serverErrors: Record<string, string | null> - Tracks error messages per server
-   clearError: (serverId: string) => void - Clears error for a server
-   serverSuccesses: Record<string, string | null> - Tracks success messages per server
-   clearSuccess: (serverId: string) => void - Clears success message for a server

### Data Refresh Strategy

1. Using Next.js 15 Cache Revalidation:

    - Implement revalidatePath for server status data
    - Set 5-minute revalidation interval
    - Trigger revalidation after successful commands
    - Use React's useEffect for client-side polling

2. Cache Invalidation Points:
    - Every 5 minutes automatically
    - After successful RCON commands
    - When user manually refreshes
    - When component mounts

## Current Implementation Details

### Assumptions

1. RCON commands are admin-only operations
2. RCON connection details will be added gradually to servers
3. Commands are pre-defined and fixed
4. Failed RCON commands should be handled gracefully
5. RCON timeouts should be implemented (default 30s for Rust)
6. Each button should have its own loading state
7. Error messages should be dismissible
8. Error messages persist until dismissed or new command succeeds
9. Using existing rustServerCommands.ts implementation for RCON commands
10. Maintaining backwards compatibility with existing RCON command usage
11. Success messages auto-dismiss after 5 seconds
12. Server data refreshes every 5 minutes
13. Cache revalidation occurs after successful commands

### RCON Implementation Strategy

1. Utilize existing `rustServerCommands.ts`:

    - Already handles proper RCON connection lifecycle
    - Has robust error handling
    - Includes retry logic
    - Uses proper event handling for Rust servers
    - Has been tested with other server commands

2. Required Changes to `rustServerCommands.ts`:

    - Add new server management commands while maintaining existing API
    - Keep backwards compatibility for existing usages
    - Add proper typing for new command responses
    - Ensure proper error handling for new commands

3. Integration Points:
    - Status.Actions.ts will use rustServerCommands.ts
    - Maintain consistent error handling patterns
    - Use existing connection management
    - Leverage existing server configs

### RCON Connection Details

For Rust with Oxide framework:

1. Default RCON port: 28016
2. Connection timeout: 30000ms (30s)
3. Required RCON command format: `servermanager.<command>`
4. Connection requires:
    - Server IP
    - RCON port (usually 28016)
    - RCON password
    - Extended timeout for Rust operations

### Security Considerations

1. RCON passwords stored as encrypted text
2. Admin-only access to RCON commands
3. Rate limiting on RCON commands
4. Logging of all RCON command attempts

### Success Message Strategy

1. Success Message Display:

    - Show after successful RCON commands
    - Auto-dismiss after 5 seconds
    - Manual dismiss option
    - Green color scheme
    - Consistent with error message styling

2. Success Message Types:
    - Server restart initiated
    - Regular wipe started
    - BP wipe started
    - Generic success message

### Cache Revalidation Strategy

1. Server-Side:

    - Use revalidatePath for cache invalidation
    - Set 5-minute revalidation interval
    - Trigger after successful commands

2. Client-Side:
    - Implement useEffect polling
    - Handle stale data scenarios
    - Manage loading states during refresh

## Next Steps

1. Update rustServerCommands.ts

    - Add new server management commands
    - Maintain backwards compatibility
    - Add proper typing for new commands
    - Update error handling for new scenarios

2. Modify Status.Actions.ts

    - Remove direct RCON implementation
    - Integrate with rustServerCommands.ts
    - Update error handling to match existing patterns
    - Maintain admin-only checks

3. Fix Loading States

    - Update Card.Controls.tsx for individual button loading
    - Add loading state tracking per command type
    - Ensure only active button shows spinner

4. Update Store Integration

    - Add success message state
    - Add success message actions
    - Add auto-dismiss logic
    - Update existing components

5. Improve Error Handling

    - Use existing error patterns from rustServerCommands.ts
    - Add specific error messages for common failures
    - Add proper error logging
    - Maintain consistent error format

6. Add Success Message Component

    - Create Card.Success.tsx
    - Add success state to store
    - Implement auto-dismiss
    - Style consistently with errors

7. Implement Cache Revalidation

    - Add revalidatePath to Status.Actions.ts
    - Set up 5-minute interval
    - Add client-side polling
    - Handle loading states

8. Improve Status Updates

    - Add loading states during refresh
    - Handle stale data scenarios
    - Add manual refresh option
    - Update UI feedback

9. Testing and Validation
    - Test auto-refresh behavior
    - Verify success messages
    - Check loading states
    - Validate cache invalidation

## Current Unresolved Issues

1. Need to ensure backwards compatibility with existing RCON usage
2. All buttons showing loading state instead of just active one
3. Need to implement proper error state management
4. Need to add confirmation dialogs
5. Need to handle offline servers gracefully
6. Need to implement success message display
7. Auto-refresh implementation causing issues:
    - Date formatting errors with cached data
    - Potential over-complication with server-side caching
    - Need for manual refresh capability
    - Need visual feedback during refresh operations

## Next Steps

1. Simplify Refresh Implementation

    - Remove server-side caching for dynamic data
    - Move to client-side refresh only
    - Add manual refresh button to Card.Header.tsx
    - Add loading state for refresh operation
    - Ensure proper date handling
    - Add visual feedback during refresh

2. Update Card.Header.tsx

    - Add refresh button next to status icon
    - Add loading spinner during refresh
    - Style consistently with existing UI
    - Handle refresh state management

3. Update Status.Container.tsx

    - Implement client-side refresh logic
    - Handle loading states during refresh
    - Manage refresh intervals
    - Add error handling for failed refreshes

4. Update Status.Actions.ts
    - Remove unnecessary caching
    - Ensure proper date serialization
    - Add proper error handling
    - Maintain admin-only checks

## Change Log

-   Initial SPEC creation with project structure and requirements
-   Defined component hierarchy and data flow
-   Outlined implementation steps and dependencies
-   Added RCON command integration plan
-   Added security considerations
-   Updated schema with RCON fields
-   Added error handling requirements
-   Updated RCON connection specifications
-   Added individual button loading states
-   Added Card.Error.tsx component to structure
-   Updated store with error management
-   Added Rust-specific RCON details
-   Identified existing rustServerCommands.ts implementation
-   Updated implementation strategy to use existing RCON utilities
-   Added backwards compatibility requirements
-   Updated next steps to include rustServerCommands.ts integration
-   Added success message requirements
-   Added auto-refresh specifications
-   Updated store with success message state
-   Added cache revalidation strategy
-   Updated component structure with Card.Success.tsx
-   Added auto-refresh implementation details
-   Updated unresolved issues with auto-refresh problems
-   Added next steps for fixing auto-refresh
-   Added server-side data fetching requirements
-   Added client-side implementation requirements
-   Added refresh button requirement to Card.Header.tsx
-   Identified date formatting issues with cached data
-   Updated refresh strategy to favor client-side implementation
-   Added loading state requirements for refresh operation
-   Documented need for proper date handling
-   Added visual feedback requirements for refresh operations
