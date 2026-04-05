'use client';

import { BarcodeScannerRegular, PeopleSettingsRegular } from '@fluentui/react-icons';
import { Card, CardHeader, CardPreview, Subtitle1, Text, Title1, tokens } from '@fluentui/react-components';
import { Layout, LayoutItem } from './_components/elements/LayoutSystem';
import { useRouter } from 'next/navigation';
import { useStyleList } from './_components/styles/pages/Home';

/**
 * Renders the main/home page of the application.
 * @returns Rendered main page for the application.
 */
export default function Page(): React.ReactNode {
    /** Compiled CSS styles for the page. */
    const computedStyles = useStyleList();

    /** Router used to navigate to the selected page. */
    const router = useRouter();

    /** Navigates to the check-in page while keeping state in memory. */
    function checkInNavigation(): void { router.push('/Check-In'); }

    /** Navigates to the member management page while keeping state in memory. */
    function memberManagerLandingNavigation(): void { router.push('/MemberManagement'); }

    // Render the home page
    return (
        <Layout align="center" justify="center">
            <LayoutItem><Title1>Welcome to the Check-in Software</Title1></LayoutItem>
            <LayoutItem><Subtitle1>Please select an option below to get started.</Subtitle1></LayoutItem>
            <LayoutItem align="center">
                <Card className={ computedStyles.card } onClick={ checkInNavigation }>
                    <CardPreview><BarcodeScannerRegular color={ tokens.colorBrandForegroundLink } /></CardPreview>
                    <CardHeader
                        header={ <Subtitle1>Check-In</Subtitle1> }
                        description={ <Text>Validates the member</Text> }
                    />
                    <CardPreview>
                    </CardPreview>
                </Card>
                <Card className={ computedStyles.card } onClick={ memberManagerLandingNavigation }>
                    <CardPreview><PeopleSettingsRegular color={ tokens.colorBrandForegroundLink } /></CardPreview>
                    <CardHeader
                        header={ <Subtitle1>Manage Member List</Subtitle1> }
                        description={ <Text>Add, remove or sync users.</Text> }
                    />
                    <CardPreview>
                    </CardPreview>
                </Card>
            </LayoutItem>
        </Layout>
    );
}
