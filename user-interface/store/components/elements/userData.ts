'use client';

import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { UserData } from '../../../app/_components/types/UserData';
import type { RootState } from '../../store';

/** Structure of the slice's state. */
interface UserDataState {
    /**
     * Currently authenticated user data, if available.
     * @default undefined
     */
    'user': UserData | undefined;
}

/** Default set of data that the slice will use upon initialization. */
const initialState: UserDataState = {
    'user': void 0
};

/** Section of the global metadata store related to user data. */
export const userDataSlice = createSlice({
    initialState,
    'name': 'User Data',
    'reducers': {
        /**
         * Sets the current user data in the global metadata store.
         * @param state Mutable slice state.
         * @param action Payload describing the next user data value.
         */
        'setUserData': (state, action: PayloadAction<UserDataState['user']>): void => { state.user = action.payload; },
        /**
         * Clears the current user data from the global metadata store.
         * @param state Mutable slice state.
         */
        'clearUserData': (state): void => { state.user = void 0; }
    }
});

/**
 * Retrieves the current user data from the global metadata store.
 * @param state Snapshot of an instance of the global metadata store to retrieve the data point from.
 * @returns Extracted value of the specific property in the global metadata store.
 */
export function userDataSelector(state: RootState): UserDataState['user'] {
    return state.userData.user;
}

/** Exposes the slice actions for user data updates. */
export const {
    setUserData,
    clearUserData
} = userDataSlice.actions;