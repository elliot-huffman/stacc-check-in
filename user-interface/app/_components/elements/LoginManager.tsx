'use client';

import { Button, Persona } from '@fluentui/react-components';
import { setUserData, userDataSelector } from '../../../store/components/elements/userData';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UserData } from '../types/UserData';
import { sleep } from '../utilities/sleep';

/**
 * Component to manage user login state and display appropriate UI elements based on the current authentication status.
 * @returns A React node containing the login manager UI.
 */
export default function LoginManager(): React.ReactNode {
    /** Function to update global redux state in a render optimized way. */
    const dispatch = useDispatch();

    /** User data currently stored in the global metadata store. */
    const user = useSelector(userDataSelector);

    /** Flag indicating whether a login operation is currently in progress. */
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    /**
     * Hook to handle the user login click event and store the data in state in the global redux store.
     */
    const getUserLogin = useCallback(async (): Promise<void> => {
        /** Mock user data. */
        const mock: UserData = {
            'displayName': 'Demo User',
            'id': '123',
            'principalAuthName': 'demo.user@example.com',
            'userProfilePicture': void 0
        };

        // Set the logging in flag to true to disable the login button and show progress
        setIsLoggingIn(true);

        // Simulate async operation to fetch user data
        await sleep(500);

        // Store the user data in global redux state
        dispatch(setUserData(mock));

        // Set the logging in flag to false to re-enable the login button and hide progress
        setIsLoggingIn(false);
    }, [dispatch]);

    /**
     * Handles auth button clicks by logging a user in when no user exists,
     * or logging the current user out when one is available.
     */
    const onAuthenticationClick = useCallback(async (): Promise<void> => {
        // Clear the current user data from the global redux state to log the user out
        if (user) {
            dispatch(setUserData(void 0));

            // Exit early since the user is now logged out and we don't want to log them back in immediately
            return;
        }

        // Start the login process to log the user in since no user is currently logged in
        await getUserLogin();
    }, [dispatch, getUserLogin, user]);

    return (
        <Button appearance="subtle" disabled={ isLoggingIn } onClick={ () => { void onAuthenticationClick(); } }>
            <Persona
                textPosition="before"
                name={ user?.displayName ?? 'Click here to log in' }
                secondaryText={ user?.principalAuthName ?? 'Log in with Entra ID' }
            />
        </Button>
    );
}
