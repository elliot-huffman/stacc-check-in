'use client';

import { configureStore } from '@reduxjs/toolkit';
import { navigationMenuSlice } from './components/elements/navigationMenu';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { themeProviderSlice } from './components/themeProvider';

/** Global metadata store to be used across all pages in the same browser memory instance. */
export const store = configureStore({
    'reducer': {
        'navigationMenu': navigationMenuSlice.reducer,
        'themeProvider': themeProviderSlice.reducer
    }
});

// Integrate RTK query into the store, in a react optimized mode
setupListeners(store.dispatch);

/** Shape of the global redux store. */
export type RootState = ReturnType<typeof store.getState>;
