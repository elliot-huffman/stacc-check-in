'use client';

import { AccountManager } from './AccountManager';
import { Button } from '@fluentui/react-components';
import { Layout } from './LayoutSystem';
import { NavigationRegular } from '@fluentui/react-icons';
import { toggleNavigationMenu } from '../../../store/components/elements/navigationMenu';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useStyleList } from '../styles/elements/TopBar';

/** Props for the TopBar component. */
interface TopBarProps {
    /** Reference object for the top bar's root element. */
    'ref'?: React.Ref<HTMLDivElement> | undefined;
}

/**
 * Renders the application's top bar with a navigation menu button and a home button.
 * @param props TopBarProps containing optional ref.
 * @returns Rendered top bar.
 */
export function TopBar(props: TopBarProps): React.ReactNode {
    /** Redux dispatch used to update menu visibility. */
    const dispatch = useDispatch();

    /** Compiled CSS styles for the top bar. */
    const compiledStyles = useStyleList();

    /** Router used to navigate back to the main page. */
    const router = useRouter();

    // Render the top bar
    return (
        // eslint-disable-next-line react-hooks/refs
        <Layout className={ compiledStyles.default } direction="column" justify="space-between" ref={ props.ref }>
            <Button aria-label="Open navigation menu" appearance="subtle" size="large" icon={ <NavigationRegular /> } onClick={ (): void => { dispatch(toggleNavigationMenu()); } } />
            <Button appearance="transparent" size="large" onClick={ (): void => { router.push('/'); } }>STACC - Check In</Button>
            <AccountManager />
        </Layout>
    );
}
