'use client';

import type { LayoutAlign, LayoutDirection, LayoutGap, LayoutItemAlign, LayoutJustify } from './types/LayoutSystem';
import { createContext, useContext } from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { useStyleList } from './styles/components/layoutSystem';

/** Shared prop contract for components that behave like flex containers. */
interface LayoutBaseProps {
    /** Child elements rendered inside the layout container. */
    'children'?: React.ReactNode;
    /** Optional extra Griffel or external class name to merge with the built-in classes. */
    'className'?: string;
    /** Optional React ref attached to the rendered inner div element. */
    'ref'?: React.Ref<HTMLDivElement>;
    /** Requested flex direction for the layout container. */
    'direction'?: LayoutDirection;
    /** Requested main-axis alignment for the layout container. */
    'justify'?: LayoutJustify;
    /** Requested cross-axis alignment for the layout container. */
    'align'?: LayoutAlign;
    /** Named gap size placed between direct children. */
    'gap'?: LayoutGap;
    /** Flag that allows children to wrap onto additional lines or columns. */
    'wrap'?: boolean;
    /** Flag that stretches the container to fill its parent box. */
    'fill'?: boolean;
}

/** Prop contract for the root layout container. */
type LayoutProps = LayoutBaseProps;

/** Layout direction context shared from a parent layout to nested layout items. */
const LayoutDirectionContext = createContext<LayoutDirection>('row');

/**
 * Renders a flex container with a simple prop-based API for direction, spacing, and alignment.
 * @param props Layout configuration and child content for the root layout container.
 * @returns Rendered root layout container.
 */
export function Layout(props: LayoutProps): React.ReactNode {
    /** Compile the layout system's Griffel classes for this render. */
    const compiledStyles = useStyleList();

    /** Effective flex direction used by this layout instance. */
    const direction = props.direction ?? 'row';

    /** Effective main-axis alignment used by this layout instance. */
    const justify = props.justify ?? 'start';

    /** Effective cross-axis alignment used by this layout instance. */
    const align = props.align ?? 'stretch';

    /** Effective named gap preset used by this layout instance. */
    const gap = props.gap ?? 'none';

    /** Direction class lookup for this render. */
    const directionClass = {
        'column': compiledStyles.directionColumn,
        'row': compiledStyles.directionRow
    }[direction];

    /** Main-axis alignment class lookup for this render. */
    const justifyClass = {
        'center': compiledStyles.justifyCenter,
        'end': compiledStyles.justifyEnd,
        'space-around': compiledStyles.justifySpaceAround,
        'space-between': compiledStyles.justifySpaceBetween,
        'space-evenly': compiledStyles.justifySpaceEvenly,
        'start': compiledStyles.justifyStart
    }[justify];

    /** Cross-axis alignment class lookup for this render. */
    const alignClass = {
        'baseline': compiledStyles.alignBaseline,
        'center': compiledStyles.alignCenter,
        'end': compiledStyles.alignEnd,
        'start': compiledStyles.alignStart,
        'stretch': compiledStyles.alignStretch
    }[align];

    /** Gap class lookup for this render. */
    const gapClass = {
        'lg': compiledStyles.gapLg,
        'md': compiledStyles.gapMd,
        'none': compiledStyles.gapNone,
        'sm': compiledStyles.gapSm,
        'xl': compiledStyles.gapXl,
        'xs': compiledStyles.gapXs
    }[gap];

    /** Combined Griffel class name for the rendered layout container. */
    const layoutClassName = mergeClasses(
        compiledStyles.layout,
        directionClass,
        justifyClass,
        alignClass,
        gapClass,
        props.wrap ? compiledStyles.wrap : '',
        props.fill ? compiledStyles.fill : '',
        props.className
    );

    return (
        <LayoutDirectionContext.Provider value={ direction }>
            {/* eslint-disable-next-line react-hooks/refs */ }
            <div ref={ props.ref } className={ layoutClassName }>
                {/* eslint-disable-next-line react-hooks/refs */ }
                { props.children }
            </div>
        </LayoutDirectionContext.Provider>
    );
}

/** Prop contract for grouped layout items. */
interface LayoutItemProps extends LayoutBaseProps {
    /** Flag that allows the item to grow and claim unused main-axis space. */
    'grow'?: boolean;
    /** Requested cross-axis override for this item within its parent layout. */
    'alignSelf'?: LayoutItemAlign;
}

/**
 * Renders a grouped flex item that also behaves as a nested layout container.
 * @param props Layout item configuration and child content for the grouped item.
 * @returns Rendered grouped layout item.
 */
export function LayoutItem(props: LayoutItemProps): React.ReactNode {
    /** Compile the layout system's Griffel classes for this render. */
    const compiledStyles = useStyleList();

    /** Closest inherited direction from the parent layout context. */
    const parentDirection = useContext(LayoutDirectionContext);

    /** Effective flex direction used by this grouped item. */
    const direction = props.direction ?? parentDirection;

    /** Effective main-axis alignment used by this grouped item. */
    const justify = props.justify ?? 'start';

    /** Effective cross-axis alignment used by this grouped item. */
    const align = props.align ?? 'stretch';

    /** Effective named gap preset used by this grouped item. */
    const gap = props.gap ?? 'none';

    /** Effective cross-axis override used by this grouped item in its parent. */
    const alignSelf = props.alignSelf ?? 'auto';

    /** Direction class lookup for this grouped item render. */
    const directionClass = {
        'column': compiledStyles.directionColumn,
        'row': compiledStyles.directionRow
    }[direction];

    /** Main-axis alignment class lookup for this grouped item render. */
    const justifyClass = {
        'center': compiledStyles.justifyCenter,
        'end': compiledStyles.justifyEnd,
        'space-around': compiledStyles.justifySpaceAround,
        'space-between': compiledStyles.justifySpaceBetween,
        'space-evenly': compiledStyles.justifySpaceEvenly,
        'start': compiledStyles.justifyStart
    }[justify];

    /** Cross-axis alignment class lookup for this grouped item render. */
    const alignClass = {
        'baseline': compiledStyles.alignBaseline,
        'center': compiledStyles.alignCenter,
        'end': compiledStyles.alignEnd,
        'start': compiledStyles.alignStart,
        'stretch': compiledStyles.alignStretch
    }[align];

    /** Gap class lookup for this grouped item render. */
    const gapClass = {
        'lg': compiledStyles.gapLg,
        'md': compiledStyles.gapMd,
        'none': compiledStyles.gapNone,
        'sm': compiledStyles.gapSm,
        'xl': compiledStyles.gapXl,
        'xs': compiledStyles.gapXs
    }[gap];

    /** Self-alignment class lookup for this grouped item render. */
    const alignSelfClass = {
        'auto': compiledStyles.selfAuto,
        'baseline': compiledStyles.selfBaseline,
        'center': compiledStyles.selfCenter,
        'end': compiledStyles.selfEnd,
        'start': compiledStyles.selfStart,
        'stretch': compiledStyles.selfStretch
    }[alignSelf];

    /** Combined Griffel class name for the rendered grouped item. */
    const layoutItemClassName = mergeClasses(
        compiledStyles.layoutItem,
        directionClass,
        justifyClass,
        alignClass,
        gapClass,
        alignSelfClass,
        props.wrap ? compiledStyles.wrap : '',
        props.fill ? compiledStyles.fill : '',
        props.grow ? compiledStyles.grow : '',
        props.className
    );

    return (
        <LayoutDirectionContext.Provider value={ direction }>
            {/* eslint-disable-next-line react-hooks/refs */ }
            <div ref={ props.ref } className={ layoutItemClassName }>
                {/* eslint-disable-next-line react-hooks/refs */ }
                { props.children }
            </div>
        </LayoutDirectionContext.Provider>
    );
}
