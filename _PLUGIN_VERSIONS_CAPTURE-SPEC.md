# Plugin Versions Capture Specification

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
-   Server Actions (no API routes)
-   Framer Motion for animations

## End Goal

Implement a system to capture and display installed plugin versions from Rust servers using the RCON command `oxide.plugins`. The system should:

1. Capture plugin data every 60 minutes via cron job
2. Store plugin data in the database
3. Allow manual refresh of plugin data via admin UI
4. Display plugin data in a clean, scrollable overlay

## Previous Implementation Overview

### File Structure

-   `/src/app/api/cron/check-plugins/`
    -   `route.ts` - Cron job endpoint for checking plugins
    -   `Plugin.Parser.ts` - Parser for oxide.plugins output
    -   `Plugin.Types.ts` - TypeScript interfaces for plugin data

### Database Schema

-   `next_wipe_info` table:
    -   `installed_plugins` (JSONB)
    -   `plugins_updated_at` (timestamp)

## Updated Implementation Overview

### New Components

-   `/src/app/admin/status/`
    -   `Status.Container.tsx` - Main container for admin status page
    -   `Status.Controls.tsx` - Controls section including new plugin view button
    -   `Card.Controls.tsx` - Server card controls wrapper
    -   `Card.Controls.Button.tsx` - Individual control button component

### Overlay Components (Existing)

-   `/src/components/overlays/core/`
    -   `Overlay.Container.tsx` - Base overlay container
    -   `Overlay.Header.tsx` - Overlay header with title/subtitle
    -   `Overlay.Title.tsx` - Title component
    -   `Overlay.Subtitle.tsx` - Subtitle component
    -   `Overlay.Contents.tsx` - Content area component

## Current Implementation Details

1. Plugin Data Structure

```typescript
interface PluginInfo {
    name: string;
    version: string;
    author: string;
}

interface ServerStatusData extends Omit<NextWipeInfo, 'installed_plugins' | 'plugins_updated_at'> {
    installed_plugins: {
        installed_plugins: Array<PluginInfo>;
    } | null;
    plugins_updated_at: Date | null;
}
```

2. Database Storage Format

```json
{
    "installed_plugins": {
        "installed_plugins": [
            { "name": "Plugin1", "author": "Author1", "version": "1.0.0" },
            { "name": "Plugin2", "author": "Author2", "version": "2.0.0" }
        ]
    }
}
```

3. Plugin Viewer Overlay

-   Uses existing overlay components for consistency
-   Displays plugins in a scrollable list
-   Shows plugin name, version, and author
-   Includes refresh button and last updated timestamp
-   Positioned relative to the server card container

## Current Proposed Solution

1. ✅ Add "View Plugins" button to server card controls
2. ✅ Create plugin viewer overlay using existing overlay components
3. ✅ Display plugins in a scrollable list with name, version, and author
4. ✅ Style similar to the total bonus win overlay from RustySlots

## Next Steps

1. Test Implementation

    - Verify overlay positioning
    - Test scrolling behavior with different numbers of plugins
    - Verify plugin refresh functionality
    - Test error handling

2. UI/UX Improvements

    - Add loading state animation for plugin refresh
    - Consider adding sorting options (by name, version, author)
    - Add search/filter functionality for servers with many plugins

3. Documentation
    - Update component documentation
    - Add usage examples
    - Document error handling

## Current Unresolved Issues

1. Consider adding search/filter functionality for servers with many plugins
2. Consider adding sorting options (by name, author, version)
3. Consider adding plugin count badge to the button

## Change Log

### 2024-01-XX

-   Initial implementation of plugin capture system
-   Added cron job for automatic updates
-   Created parser for oxide.plugins output
-   Added database fields for plugin storage

### 2024-01-XX

-   Updated parser to handle nested JSON response
-   Changed plugin storage format to array structure
-   Added debug logging to parser

### 2024-01-XX

-   Implemented plugin viewer overlay
-   Added refresh functionality
-   Integrated with existing overlay components
-   Added loading states and error handling
