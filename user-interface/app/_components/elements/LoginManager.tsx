'use client';

import { useCallback } from 'react';
import type { UserData } from '../types/UserData';
import { Button } from '@fluentui/react-components';
import { Layout } from './LayoutSystem';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, userDataSelector } from '../../../store/components/elements/userData';

export default function LoginManager() {
	/** Function to update global redux state in a render optimized way. */
	const dispatch = useDispatch();

	/** User data currently stored in the global metadata store. */
	const user = useSelector(userDataSelector);

	/**
	 * Hook to handle the user login click event and and store the data in state in the global redux store.
	 */
	const getUserLogin = useCallback(async (): Promise<void> => {
		const mock: UserData = {
			id: '123',
			name: 'Jane Doe',
			email: 'jane.doe@example.com',
		};

		// Simulate async operation to fetch user data
		await new Promise(resolve => setTimeout(resolve, 500));

		// Store the user data in global redux state
		dispatch(setUserData(mock));

	}, [dispatch]);

	/**
	 * Handles auth button clicks by logging a user in when no user exists,
	 * or logging the current user out when one is available.
	 */
	const onAuthenticationClick = useCallback(async (): Promise<void> => {
		// Clear the current user data from the global redux state to log the user out
		if (user) { dispatch(setUserData(void 0)); }
		
		// If no user exists log in 
		await getUserLogin();
	}, [dispatch, getUserLogin, user]);

	return (
		<Layout>
			{user && <Button appearance="subtle">{user.name}</Button>}
			<Button onClick={onAuthenticationClick}>{user ? 'Logout' : 'Login'}</Button>
		</Layout>
	);
}

