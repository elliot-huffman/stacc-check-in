'use client';

import { makeStyles } from '@fluentui/react-components';

/** List of CSS styles for the layout system components. */
export const useStyleList = makeStyles({
    'alignBaseline': {
        'alignItems': 'baseline'
    },
    'alignCenter': {
        'alignItems': 'center'
    },
    'alignEnd': {
        'alignItems': 'flex-end'
    },
    'alignStart': {
        'alignItems': 'flex-start'
    },
    'alignStretch': {
        'alignItems': 'stretch'
    },
    'directionColumn': {
        'flexDirection': 'column'
    },
    'directionRow': {
        'flexDirection': 'row'
    },
    'fill': {
        'height': '100%',
        'width': '100%'
    },
    'gapLg': {
        'gap': '1rem'
    },
    'gapMd': {
        'gap': '0.75rem'
    },
    'gapNone': {
        'gap': '0'
    },
    'gapSm': {
        'gap': '0.5rem'
    },
    'gapXl': {
        'gap': '1.5rem'
    },
    'gapXs': {
        'gap': '0.25rem'
    },
    'grow': {
        'flexGrow': 1
    },
    'justifyCenter': {
        'justifyContent': 'center'
    },
    'justifyEnd': {
        'justifyContent': 'flex-end'
    },
    'justifySpaceAround': {
        'justifyContent': 'space-around'
    },
    'justifySpaceBetween': {
        'justifyContent': 'space-between'
    },
    'justifySpaceEvenly': {
        'justifyContent': 'space-evenly'
    },
    'justifyStart': {
        'justifyContent': 'flex-start'
    },
    'layout': {
        'boxSizing': 'border-box',
        'display': 'flex',
        'minHeight': 0,
        'minWidth': 0
    },
    'layoutItem': {
        'boxSizing': 'border-box',
        'display': 'flex',
        'minHeight': 0,
        'minWidth': 0
    },
    'selfAuto': {
        'alignSelf': 'auto'
    },
    'selfBaseline': {
        'alignSelf': 'baseline'
    },
    'selfCenter': {
        'alignSelf': 'center'
    },
    'selfEnd': {
        'alignSelf': 'flex-end'
    },
    'selfStart': {
        'alignSelf': 'flex-start'
    },
    'selfStretch': {
        'alignSelf': 'stretch'
    },
    'wrap': {
        'flexWrap': 'wrap'
    }
});
