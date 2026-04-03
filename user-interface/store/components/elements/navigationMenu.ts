'use client';

import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

/** Structure of the slice's state. */
interface NavigationMenuState {
    /**
     * Flag that indicates whether the navigation menu is visible (`true`) or not (`false`).
     * @default false
     */
    'isVisible': boolean;
}

/** Default set of data that the slice will use upon initialization. */
const initialState: NavigationMenuState = {
    'isVisible': false
};

/** Section of the global metadata store related to navigation menu visibility. */
export const navigationMenuSlice = createSlice({
    initialState,
    'name': 'Navigation Menu',
    'reducers': {
        /**
         * Sets whether the navigation menu is visible.
         * @param state Mutable slice state.
         * @param action Payload describing the next visibility value.
         */
        'setNavigationMenuVisible': (state, action: PayloadAction<NavigationMenuState['isVisible']>): void => { state.isVisible = action.payload; },
        /**
         * Toggles whether the navigation menu is visible.
         * @param state Mutable slice state.
         */
        'toggleNavigationMenu': (state): void => { state.isVisible = !state.isVisible; }
    }
});

/**
 * Retrieves the current navigation menu visibility from the global metadata store.
 * @param state Snapshot of an instance of the global metadata store to retrieve the data point from.
 * @returns Extracted value of the specific property in the global metadata store.
 */
export function navigationMenuVisibleSelector(state: RootState): NavigationMenuState['isVisible'] {
    return state.navigationMenu.isVisible;
}

/** Exposes the slice actions for navigation menu visibility updates. */
export const {
    setNavigationMenuVisible,
    toggleNavigationMenu
} = navigationMenuSlice.actions;
