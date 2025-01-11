# Plugin Version Capture Implementation Specification

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
-   RustRCON 1.0.2

## End Goal

Create a system that:

1. Captures installed plugin information from Rust servers using RCON
2. Tracks plugin versions over time in a dedicated table
3. Compares current versions against expected versions
4. Provides visual feedback on version mismatches
5. Updates automatically via cron job
6. Provides data for UI display with version comparison

## Previous Implementation Overview

### File Structure

```
/src
  /app
    /api
      /cron
        /check-plugins
          route.ts
          Plugin.Parser.ts
          Plugin.Types.ts
          Plugin.Constants.ts
          _PLUGIN_VERSIONS_CAPTURE-SPEC.md
```

## Updated Implementation Overview

### New File Structure

```
/src
  /app
    /api
      /cron
        /check-plugins
          route.ts
          Plugin.Parser.ts
          Plugin.Types.ts
          Plugin.Constants.ts
          Plugin.Versions.ts
          _PLUGIN_VERSIONS_CAPTURE-SPEC.md
    /admin
      /status
        Status.Container.tsx
        Status.Controls.tsx
        Status.Types.ts
  /components
    /overlays
      /templates
        Modal.Plugins.tsx
  /db
    db.ts
    schema.ts
```

### Database Changes

1. New `plugin_data` table:

```typescript
export const plugin_data = pgTable('plugin_data', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull().unique(),
    current_version: varchar('current_version').notNull().default('none'),
    highest_seen_version: varchar('highest_seen_version').notNull(),
    author: varchar('author'),
    updated_at: timestamp('updated_at').defaultNow(),
    created_at: timestamp('created_at').defaultNow(),
});
```

2. Types:

```typescript
export type PluginData = InferSelectModel<typeof plugin_data>;
export type InsertPluginData = InferInsertModel<typeof plugin_data>;
```

## Current Proposed Solution

### Plugin Version Tracking

1. Data Collection Flow:

    - Fetch current plugin data via RCON
    - Parse response into structured format
    - Query existing `plugin_data` table from database for expected plugin versions
    - Compare versions and update as needed

2. Version Comparison Logic:

    - Track current installed version
    - Track highest seen version
    - Compare versions for UI display
    - Update database when new versions found

3. UI Updates:
    - Show current vs expected version
    - Color-code based on version comparison
    - Add version mismatch indicators
    - Include last update timestamp

### Version Comparison Rules

1. New Plugin Detection:

    - If plugin not in database:
        - Create new record
        - Set current_version to "none"
        - Set highest_seen_version to discovered version

2. Version Updates:

    - If plugin exists:
        - Compare current version with database version
        - Update highest_seen_version if current is higher
        - Maintain version history

3. UI Display:
    - Green: current >= expected version
    - Red: current < expected version
    - Show both versions in plugin list

## Current Implementation Details

### Implemented Components

1. Database Schema

    - Added `plugin_data` table to schema.ts
    - Added table exports to db.ts
    - Table structure matches specification

2. Version Comparison Logic

    - Created `Plugin.Versions.ts`
    - Implemented semantic version comparison
    - Added plugin comparison logic
    - Handles missing plugins
    - Sorts results alphabetically

3. Route Handler Updates

    - Modified check-plugins/route.ts
    - Added plugin_data table integration
    - Implemented version tracking logic
    - Added error handling for version comparisons
    - Added detailed logging

4. UI Implementation

    - Updated Modal.Plugins.tsx with version comparison display
    - Added color-coded status indicators
    - Added version comparison information
    - Implemented version mismatch indicators
    - Added last update timestamp

5. API Endpoints

    - Added /api/plugins/versions endpoint
    - Implemented admin-only access
    - Added error handling
    - Added caching headers

### Version Display Implementation

The UI now shows:

1. Current version with color status
    - Green: Up to date
    - Red: Needs update
2. Expected version in blue
3. Highest seen version in purple
4. Status icons
    - Check mark for up-to-date plugins
    - Warning triangle for outdated plugins
5. Last update timestamp

## Next Steps

1. Testing and Validation

    - Test version comparison edge cases
    - Verify database updates
    - Check UI rendering
    - Validate color coding logic
    - Test admin access controls

2. Documentation

    - Add API documentation
    - Document version comparison logic
    - Add UI component documentation
    - Update monitoring guidelines

3. Performance Optimization

    - Consider caching plugin version data
    - Optimize database queries
    - Add loading states
    - Consider pagination for large plugin lists

## Current Unresolved Issues

1. Need to handle invalid version strings gracefully
2. Consider adding version history tracking
3. Plan for plugin removal detection
4. Consider adding bulk update capabilities
5. Need to implement proper error handling in version comparison
6. Consider adding version rollback detection
7. Need to handle version format variations
8. Consider adding version update notifications
9. Consider adding search/filter functionality
10. Consider adding sorting options

## Change Log

### 2024-01-XX (Latest)

-   Implemented version comparison UI
-   Added color-coded status indicators
-   Created plugin versions API endpoint
-   Added version comparison display
-   Updated Modal.Plugins component
-   Added status icons and indicators

```

```
