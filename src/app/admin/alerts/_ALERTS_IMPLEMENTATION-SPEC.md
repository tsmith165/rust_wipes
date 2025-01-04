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

## Project Details

-   NextJS 15.0.1
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

### State Management

-   Zustand store: Manages alerts and active tab
-   Server actions: Handle data mutations and email sending
-   NUQS: URL state for tab management

### Data Flow

1. Page revalidates every 60s
2. Fetches latest 20 alerts
3. Processes unsent alerts
4. Sends emails via Resend using React Email template
5. Updates sent status
6. Returns data to client

## Next Steps

1. Update schema.ts with rw_alerts table
2. Create Zustand store
3. Implement reusable alert components
4. Create page.tsx with:
    - Admin protection
    - 60s revalidation
    - Tab system using NUQS
5. Implement Alerts.Actions.ts with:
    - getAlerts (latest 20)
    - archiveAlert
    - restoreAlert
    - processUnsentAlerts
6. Create Alerts.Container.tsx using reusable components
7. Add React Email template for alerts
8. Test admin protection and email sending

## Current Unresolved Issues

-   None identified yet

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
