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
2. Parses plugin data into structured format
3. Stores plugin data in database
4. Updates automatically via cron job
5. Provides data for UI display (future implementation)

## Previous Implementation Overview

Similar cron job implementation exists in `/api/cron/check-for-alerts`:

### File Structure

```
/src
  /app
    /api
      /cron
        /check-for-alerts
          route.ts
          Alert.Checks.ts
          Alert.Constants.ts
```

### Key Files

1. `route.ts`: Main cron handler that processes server checks
2. `Alert.Checks.ts`: Contains check functions and types
3. `Alert.Constants.ts`: Constants and configurations
4. `rustServerCommands.ts`: RCON command utilities

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
          _PLUGIN_VERSIONS_CAPTURE-SPEC.md
```

### Database Changes

Add to `next_wipe_info` table:

-   `installed_plugins`: JSONB (stores plugin name/version mapping)
-   `plugins_last_updated`: timestamp (tracks last plugin check)

## Current Proposed Solution

### Plugin Data Capture

1. Use `oxide.plugins` RCON command via `rustServerCommands.ts`
2. Parse text output into structured JSON
3. Store in database with timestamp

### Data Structure

```typescript
interface PluginInfo {
    name: string;
    version: string;
    isLoaded: boolean;
}

type InstalledPlugins = Record<string, PluginInfo>;
```

### `oxide.plugins` Command Output

```
oxide.plugins
Listing 30 plugins:
  01 "AdvancedEntityLimit" (1.0.5) by M&B-Studios (1.93s / 294 MB) - AdvancedEntityLimit.cs
  02 "BetterLootPlus" (4.1.0) by Extinkt (38.36s / 321 MB) - BetterLootPlus.cs
  03 "Clans" (0.2.6) by k1lly0u (0.01s / 336 KB) - Clans.cs
  04 "Creative" (2.0.25) by Ryuk_ (3.54s / 61 MB) - Creative.cs
  05 "CustomPerms" (1.5.0) by Extinkt (0.02s / 3 MB) - CustomPerms.cs
  06 "EntityTrackDown" (1.0.0) by Extinkt (0.00s / 0 B) - EntityTrackDown.cs
  07 "Gather Manager" (2.2.78) by Mughisi (0.29s / 16 KB) - GatherManager.cs
  08 "Giveaway" (1.0.0) by Extinkt (0.00s / 0 B) - Giveaway.cs
  09 "Group Limits" (3.0.4) by misticos (0.00s / 0 B) - GroupLimits.cs
  10 "Image Library" (2.0.62) by Absolut & K1lly0u (0.02s / 6 MB) - ImageLibrary.cs
  11 "Kit Redemption" (1.3.1) by Extinkt (0.03s / 560 KB) - KitRedemption.cs
  12 "Kits" (4.4.1) by k1lly0u (0.07s / 3 MB) - Kits.cs
  13 "MapVoting" (1.2.4) by Extinkt (0.00s / 28 KB) - MapVoting.cs
  14 "No Give Notices" (0.3.0) by Wulf (0.00s / 0 B) - NoGiveNotices.cs
  15 "PlayerAdministration" (1.6.9) by ThibmoRozier (0.00s / 0 B) - PlayerAdministration.cs
  16 "PlayerStats" (1.2.6) by Extinkt (29.27s / 41 MB) - PlayerStats.cs
  17 "PrivateMessages" (1.1.11) by MisterPixie (0.00s / 0 B) - PrivateMessages.cs
  18 "Quick Smelt" (5.1.5) by misticos (0.84s / 2 MB) - QuickSmelt.cs
  19 "Referrals" (1.5.3) by Extinkt (0.00s / 24 KB) - Referrals.cs
  20 "ServerConfigEnforcer" (1.1.3) by YourName (0.00s / 120 KB) - ServerConfigEnforcer.cs
  21 "ServerManager" (1.4.2) by Extinkt (1.31s / 4 MB) - ServerManager.cs
  22 "SimpleAdminCommandStatus" (1.0.13) by Extinkt (0.18s / 16 KB) - SimpleAdminCommandStatus.cs
  23 "Simple Kill Feed" (2.2.8) by Krungh Crow (0.01s / 24 KB) - SimpleKillFeed.cs
  24 "SimpleStatus" (1.2.7) by mr01sam (0.01s / 1012 KB) - SimpleStatus.cs
  25 "Site Gambling Hook" (1.2.1) by Extinkt (0.00s / 0 B) - SiteGamblingHook.cs
  26 "Stack Size Controller" (4.1.3) by AnExiledDev/patched by chrome (0.35s / 116 KB) - StackSizeController.cs
  27 "Teleport" (2.2.5) by Extinkt (0.00s / 0 B) - Teleport.cs
  28 "TradePlus" (1.3.1) by Calytic (0.00s / 4 KB) - TradePlus.cs
  29 "Ultimate Queue" (1.0.4) by Bobakanoosh (0.00s / 0 B) - UltimateQueue.cs
  30 "XSkinMenu" (1.5.9) by Monster (1.42s / 9 MB) - XSkinMenu.cs
```

### Cron Implementation

1. Fetch all servers from `next_wipe_info`
2. For each server:
    - Send RCON command
    - Parse response
    - Update database
3. Run every 60 minutes

## Next Steps

1. Update Database Schema

    - Add `installed_plugins` JSONB field to `next_wipe_info`
    - Add `plugins_last_updated` timestamp field
    - Create migration script

2. Create Plugin Types and Parser

    - Define TypeScript interfaces for plugin data
    - Create parser function for RCON output
    - Add validation and error handling

3. Implement RCON Command Handler

    - Create function to send `oxide.plugins` command
    - Handle connection timeouts
    - Add error logging

4. Create Main Runner Function

    - Implement cron handler in `route.ts`
    - Add server iteration logic
    - Implement error handling and logging

5. Update Vercel Configuration

    - Add new cron job to `vercel.json`
    - Set 60-minute schedule

6. Testing and Monitoring
    - Deploy to staging
    - Verify plugin data capture
    - Monitor database performance
    - Check RCON reliability

## Current Unresolved Issues

1. Plan for large plugin lists

## Change Log

-   Initial spec creation with project structure and requirements
-   Defined database schema changes
-   Outlined plugin parsing strategy
-   Specified cron job implementation
-   Added data structure definitions

```

```
