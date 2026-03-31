'use client';

/** Allowed directions for flex layouts in this component set. */
export type LayoutDirection = 'row' | 'column';

/** Allowed main-axis distribution options for the layout container. */
export type LayoutJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

/** Allowed cross-axis alignment options for layout containers and items. */
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/** Allowed gap presets used by the layout system. */
export type LayoutGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Allowed self-alignment overrides for grouped layout items. */
export type LayoutItemAlign = LayoutAlign | 'auto';
