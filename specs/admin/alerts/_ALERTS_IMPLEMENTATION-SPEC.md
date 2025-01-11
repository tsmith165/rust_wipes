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
        /process/alerts
          route.ts ✓
  /components
    /ui
      /alerts
        Alert.Container.tsx ✓
        Alert.Header.tsx ✓
        Alert.Header.Icon.tsx ✓
        Alert.Header.Title.tsx ✓
        Alert.Content.tsx ✓
  /utils
    /emails
      /templates
        AlertEmail.tsx ✓
  /stores
    Store.Alerts.ts ✓
```

### Database Schema

New table `rw_alerts`:

-   id: serial (primary key)
-   server_id: varchar (server port)
-   title: varchar
-   message: text
-   timestamp: timestamp (default: now)
-   active: boolean (default: true)
-   sent: boolean (default: false)
-   icon: varchar (default icon from react-icons)
-   severity: enum ('low', 'medium', 'high')
-   type: enum ('system', 'user', 'maintenance')
-   archived_at: timestamp (nullable)
-   archived_by: varchar (clerk user id)

## Current Proposed Solution

### Core Components

1. Alert Container: Main wrapper with Framer Motion animations
2. Alert Header: Combines Icon and Title components
3. Alert Content: Displays message and archive info
4. Alert Email Template: React Email component for consistent email styling
5. Cron Job: Processes unsent alerts every minute (force-dynamic, no caching)

### State Management

-   Zustand store: Manages alerts and active tab
-   Server actions: Handle data mutations
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
4. Returns data to client

## Next Steps

1. Deploy to Vercel to activate cron job
2. Verify cron responses show different timestamps
3. Monitor email sending in production
4. Update documentation with cron job details

## Current Unresolved Issues

1. Need to verify cron job processes fresh data each time
2. Need to verify Resend email functionality in production environment

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
-   Created /api/cron/process/alerts endpoint
-   Configured cron job to run every minute
-   Removed alert processing from page load
-   Updated documentation with new cron-based approach
-   Updated cron endpoint to prevent caching
-   Added force-dynamic and no-store directives
-   Added response timestamps for verification
-   Updated documentation with caching prevention details
