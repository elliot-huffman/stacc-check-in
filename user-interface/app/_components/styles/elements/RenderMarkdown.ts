'use client';

import { makeStyles, tokens } from '@fluentui/react-components';

/** List of CSS styles for the markdown renderer. */
export const useStyleList = makeStyles({
    'blockquote': {
        'borderLeftColor': tokens.colorNeutralStroke2,
        'borderLeftStyle': 'solid',
        'borderLeftWidth': '4px',
        'color': tokens.colorNeutralForeground3,
        'paddingLeft': tokens.spacingHorizontalM,
        'width': '100%'
    },
    'codeBlock': {
        'backgroundColor': tokens.colorNeutralBackground2,
        'borderRadius': tokens.borderRadiusMedium,
        'margin': 0,
        'overflowX': 'auto',
        'paddingBlock': tokens.spacingVerticalM,
        'paddingInline': tokens.spacingHorizontalM,
        'whiteSpace': 'pre-wrap'
    },
    'inlineCode': {
        'backgroundColor': tokens.colorNeutralBackground2,
        'borderRadius': tokens.borderRadiusSmall,
        'paddingBlock': '2px',
        'paddingInline': tokens.spacingHorizontalSNudge
    },
    'list': {
        'display': 'grid',
        'margin': 0,
        'paddingLeft': tokens.spacingHorizontalXXL,
        'rowGap': tokens.spacingVerticalXS
    },
    'listItem': {
        'display': 'grid',
        'rowGap': tokens.spacingVerticalXS
    },
    'root': {
        'width': '100%'
    }
});
