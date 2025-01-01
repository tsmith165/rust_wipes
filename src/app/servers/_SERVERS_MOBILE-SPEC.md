# Mobile Servers Calendar View - AI SPEC

## AI Agent Rules

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions, not API routes
3. Focus on re-usability - components should be easily adaptable for similar use cases
4. Keep solutions simple - avoid over-complicating the mobile calendar view
5. Create wrapper/container components if nesting depth exceeds 5-6 levels
6. Document all assumptions in Current Implementation Details
7. Document architectural decisions in Change Log
8. No tests unless specifically requested
9. Update SPEC with each change
10. Review Previous Implementation before changes
11. Make decisions good for project longevity without over-abstracting

## Project Details

-   NextJS 15
-   TailwindCSS for styling
-   Drizzle ORM
-   Server Actions (no API routes)
-   Framer Motion for animations
-   date-fns for date manipulation
-   react-icons for icons

Dependencies:

```json
{
    "next": "15.0.0",
    "tailwindcss": "^3.3.0",
    "drizzle-orm": "^0.29.0",
    "framer-motion": "^10.16.0",
    "date-fns": "^2.30.0",
    "react-icons": "^4.12.0"
}
```

## End Goal

Create a mobile-friendly calendar view for the servers page that:

1. Shows a vertical scrollable list of wipes for selected date range
2. Only displays future dates
3. Allows date range selection
4. Maintains existing desktop calendar grid view for md+ screens
5. Integrates seamlessly with existing server components

## Previous Implementation Overview

File structure:

```
src/app/servers/
├── page.tsx                 # Main page component
├── PageContent.tsx          # Content wrapper with view switcher
├── CalendarView.tsx         # Calendar grid implementation
├── CalendarGrid.tsx         # Calendar grid wrapper
├── ServerPanel.tsx          # Individual server panel
├── ServersList.tsx          # List of server panels
├── types.ts                 # Type definitions
└── panels/
    ├── NextWipePanel.tsx    # Next wipe info panel
    ├── MapDisplayPanel.tsx  # Map display panel
    └── MapVotingPanel.tsx   # Map voting panel
```

Current implementation uses a month-based grid calendar that works well on desktop but is not optimized for mobile viewing.

## Updated Implementation Overview

New file structure:

```
src/app/servers/
├── page.tsx
├── PageContent.tsx
├── calendar/
│   ├── CalendarContainer.tsx    # Main container with responsive switching
│   ├── CalendarDesktop.tsx      # Desktop grid view
│   ├── CalendarMobile.tsx       # Mobile list view
│   └── DateRangePicker.tsx      # Date range selector
├── ServerPanel.tsx
├── ServersList.tsx
├── types.ts                     # Updated with new types
└── panels/
    ├── NextWipePanel.tsx
    ├── MapDisplayPanel.tsx
    └── MapVotingPanel.tsx
```

## Current Implementation Details

1. Created new calendar folder structure for better organization
2. Added new types for date range and wipe events
3. Implemented DateRangePicker component with:
    - Future date selection only
    - 30-day maximum range
    - Start/end date validation
4. Created CalendarMobile component with:
    - Vertical scrollable list
    - Date-based grouping
    - Smooth animations using Framer Motion
5. Created CalendarDesktop component with:
    - Month-based grid view
    - Centered layout with max-width
    - Improved responsive design
6. Created CalendarContainer for view switching:
    - Clean separation of desktop/mobile views
    - Tailwind breakpoint-based rendering
    - No unnecessary re-renders
7. Updated PageContent to use new calendar structure

## Current Proposed Solution

1. ✅ Created new `CalendarMobile` component for vertical list view
2. ✅ Added `DateRangePicker` component for mobile date selection
3. ✅ Created `CalendarDesktop` component for grid view
4. ✅ Created `CalendarContainer` for responsive handling
5. ✅ Moved calendar components to dedicated folder
6. ✅ Updated types to support date range selection
7. ✅ Improved desktop view centering and layout

## Next Steps

1. ✅ Created calendar folder and moved existing calendar components
2. ✅ Created DateRangePicker component
3. ✅ Created CalendarMobile component
4. ✅ Created CalendarDesktop component
5. ✅ Created CalendarContainer
6. ✅ Updated types
7. ✅ Updated PageContent

Remaining tasks:

1. Test responsive behavior:
    - Verify mobile view works on small screens
    - Ensure desktop view remains centered
    - Check date range selection
    - Validate wipe list display
2. Consider adding loading states for better UX:
    - Add loading skeleton for calendar views
    - Show loading state during date range changes
3. Add error handling for edge cases:
    - Handle invalid date selections
    - Add error messages for date range limits
4. Consider adding animations for view transitions:
    - Smooth transitions between server/calendar views
    - Animate date range changes

## Current Unresolved Issues

1. Need to determine optimal date range limits for mobile view
    - Currently set to 30 days, may need adjustment based on user feedback
2. Consider performance implications of long date ranges
    - May need pagination or infinite scroll for longer ranges
3. Decide on animation transitions between views
    - Currently using basic Framer Motion animations
4. Handle edge cases for date selection
    - Currently implemented basic validation
5. Consider adding loading states
    - No loading indicators during data fetching
6. Improve error handling
    - Limited error messages for invalid states

## Change Log

Initial spec creation - [Current Date]

-   Outlined project structure and requirements
-   Defined implementation approach
-   Created detailed next steps
-   Identified potential issues

Implementation Phase 1 - [Current Date]

-   Created calendar folder structure
-   Added new types for date range and wipe events
-   Implemented DateRangePicker component
-   Created CalendarMobile component
-   Updated CalendarView for responsive handling
-   Updated PageContent
-   Moved calendar components to dedicated folder

Architectural Decisions:

1. Separated calendar components into dedicated folder for better organization
2. Used Framer Motion for animations to maintain consistency with existing UI
3. Limited date range to 30 days to prevent performance issues
4. Implemented responsive design using Tailwind's md breakpoint
5. Reused existing wipe formatting functions for consistency

Implementation Phase 2 - [Current Date]

-   Reorganized calendar components for better separation of concerns
-   Created new CalendarDesktop component
-   Created new CalendarContainer component
-   Removed old CalendarView component
-   Improved desktop view centering and layout
-   Updated PageContent to use new structure

Architectural Decisions:

1. Split calendar views into separate components for better maintainability
2. Used container pattern for responsive handling to reduce complexity
3. Improved desktop layout with max-width and centering
4. Maintained consistent styling and animations across views
5. Used Tailwind's md breakpoint for consistent responsive behavior
