# Alert Checks Implementation Specification

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

Create a robust alert checking system that:

1. Runs on a scheduled basis via Vercel cron
2. Checks server status using predefined criteria
3. Generates alerts based on check results
4. Prevents duplicate alerts within a specified timeframe
5. Uses a centralized alert ID system for tracking
6. Integrates with existing alert management system

## Previous Implementation Overview

### File Structure

```
/src
  /app
    /admin
      /alerts
        _ALERTS_IMPLEMENTATION-SPEC.md
        page.tsx
        Alerts.Container.tsx
        Alerts.Actions.ts
        Alerts.Constants.ts
    /api
      /cron
        /process-alerts
          route.ts
  /db
    db.ts
    schema.ts
```

### Key Files

1. `schema.ts`: Contains database schema including `rw_alerts` and `next_wipe_info` tables
2. `Alerts.Constants.ts`: Alert-related constants and configurations
3. `Alerts.Container.tsx`: Alert display and management UI
4. `Alerts.Actions.ts`: Server actions for alert management
5. `process-alerts/route.ts`: Cron job for processing and sending alert emails

## Updated Implementation Overview

### New File Structure

```
/src
  /app
    /admin
      /alerts
        _ALERTS_IMPLEMENTATION-SPEC.md
        _ALERT_CHECKS-SPEC.md
        page.tsx
        Alerts.Container.tsx
        Alerts.Actions.ts
        Alerts.Constants.ts
        Alert.Types.ts
    /api
      /cron
        /process-alerts
          route.ts
        /check-for-alerts
          route.ts
          Alert.Checks.ts
  /db
    db.ts
    schema.ts
```

### Database Changes

Add to `rw_alerts` table:

-   `alert_id`: varchar (unique identifier for alert type)
-   `last_occurrence`: timestamp (when this alert type was last triggered)

## Current Proposed Solution

### Alert ID System

1. Create enum/const object in `Alerts.Constants.ts` mapping alert IDs to messages
2. Add alert ID field to database schema
3. Implement duplicate prevention using alert ID and timestamp

### Check Runner System

1. Main runner function in `check-for-alerts/route.ts`
2. Individual check functions in `Alert.Checks.ts`
3. Array of check functions to be executed
4. Shared data fetching for efficiency

### Alert Generation

1. Check functions return standardized alert data
2. Runner function handles alert creation and duplicate prevention
3. Integration with existing alert processing system

## Next Steps

1. Update Database Schema

    - Add `alert_id` and `last_occurrence` to `rw_alerts` table
    - Update existing alert-related components to handle new fields

2. Create Alert Types and Constants

    - Define alert ID enum/const in `Alerts.Constants.ts`
    - Create alert check function types
    - Define time windows for duplicate prevention

3. Implement Check Functions

    - Create `Alert.Checks.ts` with check functions
    - Implement data fetching and validation
    - Add error handling and logging

4. Create Runner Function

    - Implement main runner in `route.ts`
    - Add check function array
    - Implement duplicate prevention logic

5. Update Vercel Configuration

    - Add new cron job to `vercel.json`
    - Set appropriate schedule

6. Testing and Monitoring

    - Deploy changes and monitor alert generation
    - Verify duplicate prevention is working
    - Check alert email delivery
    - Monitor database performance

7. Documentation

    - Update API documentation
    - Document alert ID system
    - Add monitoring guidelines

## Current Unresolved Issues

1. Need to verify alert generation rate in production
2. Consider adding rate limiting per server
3. Monitor database performance with new queries
4. Consider adding alert aggregation for multiple servers
5. Need to establish alert cleanup/archival strategy

## Change Log

-   Initial spec creation with project structure and requirements
-   Defined alert ID system and database changes
-   Outlined check runner system architecture
-   Specified alert generation flow
-   Added duplicate prevention strategy
-   Implemented database schema changes
-   Created alert check functions with TypeScript types
-   Added alert constants and time windows
-   Implemented main runner function with duplicate prevention
-   Updated Vercel configuration for new cron job
-   Added TypeScript improvements for type safety
-   Documented implementation progress and next steps
