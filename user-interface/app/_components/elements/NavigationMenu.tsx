'use client';

import { DrawerHeaderTitle, NavDrawer, NavDrawerBody, NavDrawerHeader, NavItem, type OnNavItemSelectData } from '@fluentui/react-components';
import { Home20Regular, Info20Regular } from '@fluentui/react-icons';
import { navigationMenuVisibleSelector, setNavigationMenuVisible } from '../../../store/components/elements/navigationMenu';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { useStyleList } from '../styles/elements/NavigationMenu';

/**
 * Renders the application's navigation drawer with links to shared pages.
 * @returns Rendered navigation drawer.
 */
export function NavigationMenu(): React.ReactNode {
    /** Redux dispatch used to update menu visibility. */
    const dispatch = useDispatch();

    /** Router used to navigate to the selected page. */
    const router = useRouter();

    /** Current page path used to determine the selected navigation item. */
    const currentPage = usePathname();

    /** Compiled CSS styles for the navigation menu. */
    const compiledStyles = useStyleList();

    /** Current visibility state of the navigation drawer. */
    const isNavigationMenuVisible = useSelector(navigationMenuVisibleSelector);

    /** Navigates to the About page and closes the navigation drawer. */
    const navManager = useCallback((_event: unknown, data: OnNavItemSelectData): void => {
        // Navigate to the requested page if it exists
        switch (data.value) {
            case 'home':
                // Execute page navigation
                router.push('/');

                // Stop execution to prevent fallthrough
                break;
            case 'about':
                // Execute page navigation
                router.push('/About');

                // Stop execution to prevent fallthrough
                break;
            default:
                // No default navigation page, just close the menu

                // Stop execution to prevent fallthrough
                break;
        }
    }, [router]);

    /** Determines the currently selected navigation item based on the current page. */
    const selectedNavItem = useMemo(() => {
        switch (currentPage) {
            case '/':
                return 'home';
            case '/About':
            case '/About/':
                return 'about';
            default:
                return '';
        }
    }, [currentPage]);

    // Render the navigation drawer with the appropriate visibility and event handlers
    return (
        <NavDrawer
            open={ isNavigationMenuVisible }
            type="inline"
            className={ compiledStyles.navContainer }
            onNavItemSelect={ navManager }
            selectedValue={ selectedNavItem }
            onOpenChange={ (_event, data): void => { dispatch(setNavigationMenuVisible(data.open)); } }
        >
            <NavDrawerHeader>
                <DrawerHeaderTitle>Navigation</DrawerHeaderTitle>
            </NavDrawerHeader>
            <NavDrawerBody>
                <NavItem icon={ <Home20Regular /> } value="home" className={ compiledStyles.colorFix }>
                    Home
                </NavItem>
                <NavItem icon={ <Info20Regular /> } value="about" className={ compiledStyles.colorFix }>
                    About
                </NavItem>
            </NavDrawerBody>
        </NavDrawer>
    );
}
