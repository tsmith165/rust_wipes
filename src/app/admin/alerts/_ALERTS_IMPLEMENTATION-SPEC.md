# Alerts Implementation Specification

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
-   Resend 3.5.0
-   React Icons 5.3.0
-   Zustand 4.5.5
-   NUQS 2.0.4

## End Goal

Create an admin-protected alerts management system that:

1. Displays alerts in "Current" and "History" tabs
2. Allows archiving/restoring alerts between tabs
3. Sends email notifications via Resend
4. Auto-revalidates every 60 seconds
5. Uses server components and actions
6. Implements reusable alert components
7. Manages state with Zustand

## Updated Implementation Overview

### File Structure

```
/src
  /app
    /admin
      /alerts
        _ALERTS_IMPLEMENTATION-SPEC.md
        page.tsx ✓
        Alerts.Container.tsx ✓
        Alerts.Actions.ts ✓
        Alerts.Constants.ts ✓
    /api
      /cron
        /process-alerts
          route.ts ✓
  /components
    /ui
      /alerts
        Alert.Container.tsx ✓
        Alert.Header.tsx ✓
        Alert.Header.Icon.tsx ✓
        Alert.Header.Title.tsx ✓
        Alert.Content.tsx ✓
        Alert.Controls.tsx ✓
        Alert.Controls.Button.tsx ✓
  /utils
    /emails
      /templates
        AlertEmail.tsx ✓
  /stores
    Store.Alerts.ts ✓
```

### Core Components

1. Alert Container: Main wrapper with Framer Motion animations
2. Alert Header: Combines Icon and Title components
3. Alert Content: Displays message and archive info
4. Alert Email Template: React Email component for consistent email styling
5. Cron Job: Processes unsent alerts every minute (force-dynamic, no caching)
6. Alert Controls: Manages alert actions with tooltips and icons
7. Alert Control Button: Reusable button component with variants

### Button Variants

1. Default: `bg-stone-300 text-primary_light hover:bg-stone-500 hover:text-primary`
2. Error: `bg-primary_light text-stone-950 hover:bg-primary_dark hover:text-stone-300`
3. Disabled: `bg-stone-100 text-primary hover:bg-stone-300 hover:text-primary_dark`

### State Management

-   Zustand store: Manages alerts and active tab
-   Server actions: Handle data mutations and email resending
-   NUQS: URL state for tab management
-   React cache: Server-side data caching
-   Vercel Cron: Background alert processing (uncached)

### Data Flow

1. Page uses React cache for data fetching
2. Fetches latest 20 alerts
3. Cron job runs every minute to:
    - Force dynamic route execution
    - Process unsent alerts with fresh data
    - Send emails via Resend
    - Update sent status
    - Return timestamped response
4. User can manually trigger email resend:
    - Checks admin permissions
    - Sends email with (Resent) tag
    - Updates alert status
    - Revalidates page

## Next Steps

1. Test resend email functionality
2. Verify tooltip positioning
3. Test button variants in different states
4. Update documentation with new controls

## Current Unresolved Issues

1. Need to verify cron job processes fresh data each time
2. Need to verify Resend email functionality in production environment
3. Need to test tooltip behavior on mobile devices

## Change Log

-   Initial SPEC creation with project structure and requirements
-   Added rw_alerts table to schema.ts and db.ts
-   Created constants file with alert types and styling
-   Implemented Zustand store for state management
-   Created reusable alert components with Framer Motion animations
-   Implemented server actions with email functionality
-   Created page component with auto-revalidation
-   Added admin protection using Clerk
-   Implemented alerts container with tab system
-   Added React Email template for consistent email styling
-   Updated alert processing to use React Email components
-   Fixed duplicate email sending issue with double-check mechanism
-   Identified need to migrate from unstable_cache to use cache directive
-   Updated SPEC to reflect new caching approach
-   Planning implementation of React cache for data fetching
-   Migrated alert processing to Vercel Cron job
-   Created /api/cron/process-alerts endpoint
-   Configured cron job to run every minute
-   Removed alert processing from page load
-   Updated documentation with new cron-based approach
-   Updated cron endpoint to prevent caching
-   Added force-dynamic and no-store directives
-   Added response timestamps for verification
-   Updated documentation with caching prevention details
-   Added Alert.Controls.Button component with variants
-   Added Alert.Controls component for unified action management
-   Updated Alert.Container to use new controls
-   Added resendAlertEmail server action
-   Added tooltips and icons for better UX
-   Updated documentation with new control components
