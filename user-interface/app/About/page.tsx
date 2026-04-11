'use client';

import { Divider, Subtitle1, Subtitle2, Text, Title1, Title3, Link } from '@fluentui/react-components';
import { Layout, LayoutItem } from '../_components/elements/LayoutSystem';
import { useEffect, useState } from 'react';
import { useStyleList } from '../_components/styles/pages/About';

/**
 * Renders the about page that contains legal notices.
 * @returns Rendered page.
 */
export default function Page(): React.ReactNode {
    /** Compiled CSS styles for the About page. */
    const compiledStyles = useStyleList();

    /** Legal notice text loaded from the public asset at runtime. */
    const [rawLicenseText, setRawLicenseText] = useState<string>('Loading legal notices...');

    /**
     * Loads the legal notice text from the public asset.
     * @param abortController Instance of the abort controller that will be used to terminate the in-flight fetch request.
     */
    async function loadAboutText(abortController: InstanceType<typeof AbortController>): Promise<void> {
        try {
            /** Response containing the about-page text asset. */
            const response = await fetch('/LicenseList.txt', {
                'signal': abortController.signal
            });

            // Check for error responses and throw to trigger the catch block, which will set the about text to an error message.
            if (!response.ok) { throw new Error(`Failed to load license notices: ${ response.status }`); }

            // Set the about text to the contents of the loaded asset.
            setRawLicenseText(await response.text());
        } catch (_error) {
            // Set an error message if the fetch failed, and not if the fetch was aborted.
            if (!abortController.signal.aborted) { setRawLicenseText('Unable to load legal notices at this time.'); }
        }
    }

    // Start the loading process for the legal notices
    useEffect(() => {
        /** Cancels the in-flight license fetch when the component unmounts. */
        const abortController = new AbortController();

        // Start the text loading process
        void loadAboutText(abortController);

        // Stop the web request if it is in progress when the component unmounts
        return (): void => { abortController.abort(); };
    }, []);

    // Render the about screen with the legal notices and other info about the app.
    return (
        <Layout>
            <LayoutItem>
                <LayoutItem>
                    <Title1>Credits</Title1>
                    <Subtitle1>Created by: Elliot Huffman</Subtitle1>
                    <Subtitle2>Source Code: https://github.com/elliot-huffman/check-in</Subtitle2>
                    <Subtitle2>License Agreement: https://github.com/elliot-huffman/check-in/blob/main/LICENSE</Subtitle2>
                    &nbsp;
                    <Divider />
                    &nbsp;
                    <Title3>Third-party components and libraries and their required legal notices:</Title3>
                    &nbsp;
                </LayoutItem>
                <Text className={ compiledStyles.licenseText }>{ rawLicenseText }</Text>
            </LayoutItem>
        </Layout>
    );
}
