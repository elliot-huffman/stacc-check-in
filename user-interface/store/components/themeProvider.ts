'use client';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';


/** Structure of the slice's state. */
interface ThemeProviderState {
    /** Flag that indicates if the current theme is light, dark, or auto (inherited from the system's global settings). */
    'themeMode': 'light' | 'dark' | 'auto';
}

/** Default set of data that the slice will use upon initialization. */
const initialState: ThemeProviderState = {
    'themeMode': 'auto'
};

/** Section of the global metadata store related to theme management. */
export const themeProviderSlice = createSlice({
    initialState,
    'name': 'Theme Provider',
    'reducers': {
        'setTheme': (state, action: PayloadAction<ThemeProviderState['themeMode']>) => { state.themeMode = action.payload; }
    }
});

// #region Selectors

/**
 * Retrieves the current theme mode from the global metadata store.
 * @param state Snapshot of an instance of the global metadata store to retrieve the data point from.
 * @returns Extracted value of the specific property in the global metadata store.
 */
export function themeModeSelector(state: RootState): ThemeProviderState['themeMode'] {
    // Return the specific global state value
    return state.themeProvider.themeMode;
}

// #endregion Selectors

// Export the reducers
export const { setTheme } = themeProviderSlice.actions;
