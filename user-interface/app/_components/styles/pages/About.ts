'use client';

import { makeStyles } from '@fluentui/react-components';

/** List of CSS styles for the About page. */
export const useStyleList = makeStyles({
    'aboutPage': {
        'maxHeight': '100vh',
        'overflowY': 'auto',
        'width': '100%'
    },
    'licenseText': {
        'whiteSpace': 'pre-wrap'
    }
});
