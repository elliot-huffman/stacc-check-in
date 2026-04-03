'use client';

import { Layout, LayoutItem } from './LayoutSystem';
import { Button } from '@fluentui/react-components';
import { NavigationRegular } from '@fluentui/react-icons';
import { toggleNavigationMenu } from '../../../store/components/elements/navigationMenu';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useStyleList } from '../styles/elements/TopBar';

/**
 * Renders the application's top bar with a navigation menu button and a home button.
 * @returns Rendered top bar.
 */
export function TopBar(): React.ReactNode {
    /** Redux dispatch used to update menu visibility. */
    const dispatch = useDispatch();

    /** Compiled CSS styles for the top bar. */
    const compiledStyles = useStyleList();

    /** Router used to navigate back to the main page. */
    const router = useRouter();

    // Render the top bar
    return (
        <Layout className={ compiledStyles.topBar } justify="space-between">
            <LayoutItem>
                <Button aria-label="Open navigation menu" appearance="subtle" size="large" icon={ <NavigationRegular /> } onClick={ (): void => { dispatch(toggleNavigationMenu()); } } />
                <Button appearance="transparent" size="large" onClick={ (): void => { router.push('/'); } }>STACC - Check In</Button>
            </LayoutItem>
        </Layout>
    );
}
