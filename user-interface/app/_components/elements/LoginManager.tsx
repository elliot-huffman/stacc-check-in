'use client';

import { useCallback } from 'react';
import type { UserData } from '../types/UserData';
import { Button } from '@fluentui/react-components';
import { Layout } from './LayoutSystem';
import { useDispatch, useSelector } from 'react-redux';
import { clearUserData, setUserData, userDataSelector } from '../../../store/components/elements/userData';

export default function LoginManager() {
	/** Function to update global redux state in a render optimized way. */
	const dispatch = useDispatch();

	/** User data currently stored in the global metadata store. */
	const user = useSelector(userDataSelector);


	/**
	 * Hook to handle the user login click event and and store the data in state in the global redux store.
	 */
	const getUserLogin = useCallback((): void => {
		const mock: UserData = {
			id: '123',
			name: 'Jane Doe',
			email: 'jane.doe@example.com',
		};

		// Store the user data in global redux state
		dispatch(setUserData(mock));

		return void 0;

	}, [dispatch]);

	/**
	 * Handles auth button clicks by logging a user in when no user exists,
	 * or logging the current user out when one is available.
	 */
	const onAuthenticationClick = useCallback((): void => {
		if (user) {
			// Clear the current user data from the global redux state to log the user out
			dispatch(setUserData(void 0));
			return;
		}

		getUserLogin();
	}, [dispatch, getUserLogin, user]);

	return (
		<Layout>
			{user && <Button appearance="subtle">{user.name}</Button>}
			<Button onClick={onAuthenticationClick}>{user ? 'Logout' : 'Login'}</Button>
		</Layout>
	);
}

