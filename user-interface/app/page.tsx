'use client';

import { Layout, LayoutItem } from './_components/LayoutSystem';
import { Text } from '@fluentui/react-components';

/**
 * Renders the main/home page of the application.
 * @returns Rendered main page for the application.
 */
export default function Page(): React.ReactNode {
    return (
        <Layout direction="row">
            <LayoutItem>
                <Text>Hello, World - item!</Text>
                <Text>Hello, World - item!</Text>
            </LayoutItem>
            <Text>Hello, World!</Text>
            <Text>Hello, World!</Text>
            <Text>Hello, World!</Text>
            <Text>Hello, World!</Text>
            <Text>Hello, World!</Text>
        </Layout>
    );
}
