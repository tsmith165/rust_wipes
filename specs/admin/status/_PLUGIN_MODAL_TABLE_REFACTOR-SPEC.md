# Rules for AI agent

1. Do not change the structure or delete sections from the markdown spec, only add into it
2. Use NextJS 15 server actions. Do not use API routes. Utilize @Web if needed for context on server actions and their usage
3. Focus on re-usability. We should be able to easily utilize the "wrapper" / "container" components to create other similar pages
4. Do not over-complicate things. Favor simple solutions to complex flows rather than jumping to abstractions
5. Consult senior dev if we need to do anything overly-complex
6. If a file is indented > ~5-6 times, we almost certainly need to create some "wrapper" / "container" component
7. As the AI agent you are crucial in this workflow and need to make decisions that are good for the longevity of the project while not over-abstracting and over-complicating things

## Project details

-   NextJS 15
-   Tailwind CSS
-   Drizzle ORM
-   Server Actions (no API routes)
-   Framer Motion
-   shadcn/ui components:
    -   Table component at /src/components/ui/table/table.tsx
    -   Input component at /src/components/ui/input.tsx
    -   Button component at /src/components/ui/button.tsx
    -   Dropdown Menu component at /src/components/ui/dropdown-menu.tsx
-   TanStack Table v8 (@tanstack/react-table v8.20.6)
-   TypeScript

## High Level End Goal

-   Refactor the plugin modal in Status page to display plugin data in a table format using shadcn/ui table component
-   Implement column visibility toggle functionality to allow users to show/hide specific columns
-   Add status icons to indicate plugin version compatibility using color-coded indicators
-   Optimize vertical space usage by implementing fixed header with scrollable body
-   Improve data density by showing each plugin in a single row instead of card format
-   Add sorting functionality to all columns and global search capability - we should be able to search only by the Name column

## High Level Proposed Solution

-   Create a new table component using shadcn/ui table and TanStack Table that will replace the current card-based layout
-   Implement column definitions with visibility controls and sorting using TanStack Table's built-in features
-   Add custom cell rendering for the status icon column using Tailwind colors (green-500 for good, red-500 for bad)
-   Add global search functionality using TanStack Table's built-in filtering to search only by the Name column
-   Maintain the existing refresh functionality and data fetching logic while updating only the presentation layer
-   Keep the modal container but replace its content with the new table component

## Next steps

1. ✅ Dependencies Installation (COMPLETED)

    - shadcn/ui components installed:
        - Table component at /src/components/ui/table/table.tsx
        - Input component at /src/components/ui/input.tsx
        - Button component at /src/components/ui/button.tsx
        - Dropdown Menu component at /src/components/ui/dropdown-menu.tsx
    - @tanstack/react-table v8.20.6 is installed

2. ✅ Create table column definitions (COMPLETED)

    - Created file `src/app/admin/status/plugins/Plugins.Columns.tsx`
    - Defined all required columns with proper styling
    - Implemented status icon with color coding
    - Added column visibility configuration
    - Configured sorting for all columns except status icon

3. ✅ Create table component (COMPLETED)

    - Created file `src/app/admin/status/plugins/Plugins.Table.tsx`
    - Implemented table component with shadcn/ui components
    - Added column visibility controls with dropdown menu
    - Added search input for Name column
    - Implemented sorting functionality
    - Added fixed header with scrollable body (max-h-[600px])
    - Fixed import paths for shadcn components
    - Added proper type annotations

4. ✅ Update Modal.Plugins.tsx (COMPLETED)

    - Replaced card-based layout with new table component
    - Maintained existing refresh functionality
    - Updated styling for modal container
    - Increased max height to 80vh
    - Removed manual sorting (now handled by table)
    - Removed redundant loading state (handled by table)

5. Update container components (NEXT)

    - Modify Status.Container.tsx to pass correct props to Modal.Plugins
    - Update any necessary types or interfaces
    - Ensure proper data transformation for table format

6. Test and verify
    - Test column visibility toggles
    - Test sorting functionality on all columns
    - Test global search functionality (verify it only searches Name column)
    - Verify version comparison logic and status icons
    - Check scroll behavior
    - Ensure refresh functionality works
    - Validate responsive design

## Current Unresolved Issues

1. Status icon styling - RESOLVED

    - Use Tailwind colors: bg-green-500 for good state, bg-red-500 for bad state
    - Icon size: w-4 h-4 with p-1 padding in a rounded-full container
    - Use white icons (text-white) for contrast

2. Sorting functionality - RESOLVED

    - Implement sorting on all columns
    - Use TanStack Table's built-in sorting features

3. Search functionality - RESOLVED

    - Implement global search on Name column only
    - No need for per-column filtering
    - Place search input above table

4. Column visibility persistence - RESOLVED
    - No persistence needed
    - Default to hiding Author column only

## Change Log

Initial spec creation - [Current Date]

-   Created initial specification for plugin modal table refactor
-   Outlined implementation steps and requirements
-   Identified potential issues and considerations

Update 1 - [Current Date]

-   Resolved all unresolved issues
-   Added specific styling details for status icons
-   Added sorting and search functionality requirements
-   Removed column visibility persistence requirement
-   Updated implementation steps to reflect new requirements

Update 2 - [Current Date]

-   Verified all required dependencies are installed
-   Updated project details with specific versions
-   Marked dependencies installation step as completed
-   Updated search functionality to specify it only searches Name column

Update 3 - [Current Date]

-   Added details about installed shadcn/ui components
-   Completed column definitions implementation
-   Started table component implementation
-   Updated next steps to reflect current progress
-   Added note about fixing component import paths

Update 4 - [Current Date]

-   Completed table component implementation
-   Fixed all linter errors and type annotations
-   Updated Modal.Plugins.tsx to use new table component
-   Improved modal styling and layout
-   Removed redundant functionality now handled by table component
