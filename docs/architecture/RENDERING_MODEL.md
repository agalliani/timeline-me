# Rendering Model

**Timeline Me** uses a CSS Grid-based rendering model to display timeline items. 

## CSS Grid Layout

The horizontal timeline is represented as a grid where each column is one month.
The placement and duration of an event are controlled using native CSS grid properties:
- `gridColumnStart`: The starting month (column index, 1-based).
- `gridColumnSpan`: The duration of the event in months.

### Legacy Model (Removed)
Previously, the application calculated pixel widths and margins (`marginLeft`, `width`) for every bubble instance, based on a fixed `widthMonth` constant. This approach was brittle and didn't adapt well to modern responsive designs. All pixel-based layout logic and the `Bubble` wrapper class have been completely removed in favor of the CSS Grid approach.
