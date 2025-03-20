# Recent Wipes Page Refactor Plan

## Current Issues

-   Page is constrained to a fixed container of the page width/height
-   UI layout is divided into a small left sidebar (form) and large right container (table)
-   Styling is functional but lacks visual appeal and clear information hierarchy
-   User experience could be improved with better organization and visual cues

## Redesign Goals

-   Create a more visually appealing, modern design with clear information hierarchy
-   Improve user understanding of the page purpose and functionality
-   Maintain all existing features while enhancing usability and aesthetics
-   Make the page responsive and fully scrollable

## Component Structure

### 1. Hero Section

-   Large hero banner at the top of the page with:
    -   "Upcoming Wipes" or similar heading
    -   Descriptive subheading: "Plan ahead with ease using our upcoming wipe tracker"
    -   Visually appealing background (particles background similar to example)
    -   Optional: CTA button to scroll down to the form or table

### 2. Filter Form Section

-   Move form from sidebar to a full-width section below the hero
-   Organize inputs in a more accessible, horizontal layout on larger screens
-   Add clear section heading: "Filter Servers"
-   Style consistently with the rest of the page

### 3. Server Table Section

-   Full-width table section with clear heading
-   Maintain all existing functionality (sorting, pagination, etc.)
-   Enhance visual design while keeping the same information density
-   Improve readability with better spacing and typography

### 4. Information Cards Section

-   Add a new section with cards explaining how to use the wipe tracker
-   Include helpful tips, explanations of features, and guidance
-   Visually appealing layout with icons or illustrations

## New Component Files to Create

1. `HeroSection.tsx` - The main hero banner component
2. `ParticlesBackground.tsx` - Background effect for the hero
3. `FilterFormSection.tsx` - New layout for the filter form
4. `InfoCards.tsx` - Information cards section
5. `RecentWipesPageLayout.tsx` - Overall layout component that brings everything together

## Implementation Steps

1. Create the new component files
2. Build the hero section with particles background
3. Refactor the filter form into a horizontal layout
4. Adapt the server table to fit the new design
5. Create the information cards section
6. Update the page.tsx to use the new layout
7. Test thoroughly for responsiveness and functionality
8. Optimize performance

## Technical Considerations

-   Ensure all existing functionality is preserved
-   Maintain state management and data fetching patterns
-   Keep accessibility in mind for all UI components
-   Ensure responsive behavior works on all screen sizes
-   Optimize performance for initial load and interactions
