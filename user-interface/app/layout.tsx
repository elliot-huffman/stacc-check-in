'use client';

import { FluentProvider, RendererProvider, SSRProvider, createDOMRenderer, renderToStyleElements, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setTheme, themeModeSelector } from '../store/components/themeProvider';
import { store } from '../store/store';
import { useServerInsertedHTML } from 'next/navigation';
import { useStyleList } from './_components/styles/globalLayout';

/** Structure of the root layout props. */
interface RootLayoutProps {
    /** Child page/components to be rendered in the Next.js app. */
    'children'?: React.ReactNode;
}

/**
 * Renders the root layout/HTML of the Next.js application, wrapping it with Fluent UI support and handling theme changes based on user system preferences.
 * @param props Child page/components to be rendered in the Next.js app.
 * @returns Renders the root HTML with Fluent UI support, along with any provided children pages/components.
 */
function RootContent(props: RootLayoutProps): React.ReactNode {
    /** Function to update global redux state in a render optimized way. */
    const dispatch = useDispatch();

    /** Flag that indicates which theme mode is requested. */
    const themeMode = useSelector(themeModeSelector);

    // Initialize deep server side render support for Fluent UI to optimize compile
    const [renderer] = useState(() => createDOMRenderer());

    /** Flag that indicates if the component has been rendered on the server. */
    const didRenderRef = useRef(false);

    // Render styles to the client in an optimized manner in dev mode
    useServerInsertedHTML(() => {
        // Only render styles on the server to prevent duplication of styles on the client since the styles will already be included in the server rendered HTML and do not need to be rendered again on the client.
        if (didRenderRef.current) {
            // Mark that the component has been rendered on the server to ensure styles are only rendered once and not duplicated on the client.
            didRenderRef.current = true;

            // Render the styles to the head of the document to ensure they are included in the server rendered HTML and not duplicated on the client.
            return <>{ renderToStyleElements(renderer) }</>;
        }

        // Render nothing on the first render since the styles will be rendered on the server and included in the initial HTML sent to the client, so they do not need to be rendered again on the client.
        return <></>;
    });

    /** Compiled styles for the root layout. */
    const compiledStyles = useStyleList();

    /**
     * Checks the current metadata to see if the user has a system preference for a light or dark theme and updates the global state accordingly.
     * @param event Metadata that describes if the current theme mode is requested to be 'dark' or not.
     */
    const themeChangeListener = useCallback((event: MediaQueryListEvent): void => {
        // Update the theme in the global state based on the user's updated system preference
        dispatch(setTheme(event.matches ? 'dark' : 'light'));
    }, [dispatch]);

    // Set the current theme based on the user's system preference and listen for changes to the system theme preference to update the theme in real time.
    useEffect(() => {
        /** Initial theme setup based on user's system preference. */
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Set the initial theme based on the user's system preference
        dispatch(setTheme(darkModeMediaQuery.matches ? 'dark' : 'light'));

        // Listen for changes in the user's system theme preference and update the theme accordingly
        darkModeMediaQuery.addEventListener('change', themeChangeListener);

        // Remove the event listener on unmount to prevent memory leaks
        return (): void => { darkModeMediaQuery.removeEventListener('change', themeChangeListener); };
    }, [dispatch, themeChangeListener]);

    /**
     * Fluent UI theme to render for the entire application.
     * High contrast support is auto selected/implemented outside of light/dark modes by Fluent itself.
     */
    const selectedTheme = useMemo(() => {
        // If a dark theme is requested, return the dark fluent theme
        if (themeMode === 'dark') { return webDarkTheme; }

        // Default to a light theme for all other modes
        return webLightTheme;
    }, [themeMode]);

    // Render the core HTML with Fluent UI support available from the very root.
    return (
        <RendererProvider renderer={ renderer }>
            <SSRProvider>
                <FluentProvider theme={ selectedTheme }>
                    <html lang="en" className={ compiledStyles.html }>
                        <head>
                            <title>STACC - Check In</title>
                            <meta name="description" content="Application that checks people into and out of events, buildings, or systems." />
                        </head>
                        <body className={ compiledStyles.body }>
                            <Suspense fallback="Loading...">
                                { props.children }
                            </Suspense>
                        </body>
                    </html>
                </FluentProvider>
            </SSRProvider>
        </RendererProvider>
    );
}

/**
 * Renders the root layout/HTML of the Next.js application, wrapping it with the Redux Provider to make the store available throughout the app.
 * @param props Child page/components to be rendered in the Next.js app.
 * @returns Rendered root layout with Redux support.
 */
export default function RootLayout(props: RootLayoutProps): React.ReactNode {
    // Render the core HTML with redux support available from the very root.
    return (
        <Provider store={ store }>
            <RootContent { ...props } />
        </Provider>
    );
}

/** Disable server side rendering for this project since it will be compiled to static HTML. */
export const dynamic = 'error';
