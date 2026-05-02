'use client';

import type { MarkdownItInstanceFactory, MarkdownToken } from '../types/RenderMarkdown';
import { Body1, Body1Strong, Caption1, Divider, Link, Subtitle1, Subtitle2, Text, Title1, Title2, Title3 } from '@fluentui/react-components';
import { Layout, LayoutItem } from './LayoutSystem';
import markdownItFactory from 'markdown-it';
import { Fragment, useMemo } from 'react';
import { useStyleList } from '../styles/elements/RenderMarkdown';

/** Props accepted by the RenderMarkdown component. */
interface RenderMarkdownProps {
    /** Raw markdown source that will be parsed and rendered. */
    'content': string;
}

/** Shared markdown-it instance configured for safe token parsing. */
// Create one shared parser instance for all renderer invocations.
const markdownIt = (markdownItFactory as unknown as MarkdownItInstanceFactory)({
    // Convert source newlines into markdown line breaks.
    'breaks': true,
    // Disable raw HTML parsing so markdown content stays safe.
    'html': false,
    // Auto-detect bare links in text content.
    'linkify': true,
    // Disable typographic substitutions so the source text stays predictable.
    'typographer': false
});

/**
 * Renders safe markdown content using Fluent UI typography and link components.
 * @param props Markdown content to render.
 * @returns Rendered markdown tree.
 */
export function RenderMarkdown(props: RenderMarkdownProps): React.ReactNode {
    // Render the markdown source into a memoized Fluent UI node tree.
    // Resolve the Griffel classes used by this renderer.
    const styleList = useStyleList();
    // Memoize markdown parsing so it only reruns when the content changes.
    const parsedTokens = useMemo(() => { return markdownIt.parse(props.content, {}); }, [props.content]);
    // Memoize React node generation so it reuses the parsed token stream between renders.
    const renderedNodes = useMemo(() => {
        // Decide whether a parsed URI is safe enough to render.
        function isSafeUri(rawUri: string | null): rawUri is string {
            // Reject missing URIs immediately.
            if (rawUri === null) { return false; }

            // Normalize surrounding whitespace before checking the URI.
            const trimmedUri = rawUri.trim();

            // Reject empty URIs after trimming.
            if (trimmedUri.length === 0) { return false; }

            // Allow safe relative or local navigation targets.
            if (
                trimmedUri.startsWith('#')
                || trimmedUri.startsWith('?')
                || trimmedUri.startsWith('./')
                || trimmedUri.startsWith('../')
                || (trimmedUri.startsWith('/') && !trimmedUri.startsWith('//'))
            ) {
                // Mark safe local URIs as allowed.
                return true;
            }

            try {
                // Parse the candidate URI into a structured URL object.
                const parsedUri = new URL(trimmedUri);

                // Allow secure HTTPS links, email links, and telephone links.
                return parsedUri.protocol === 'https:'
                    || parsedUri.protocol === 'mailto:'
                    || parsedUri.protocol === 'tel:';
            } catch {
                // Reject values that cannot be parsed safely.
                return false;
            }
        }

        // Decide whether a rendered URI should open in a new tab.
        function isExternalUri(uri: string): boolean {
            // Treat secure absolute URLs as external destinations.
            return uri.startsWith('https://');
        }

        // Flatten markdown child tokens into readable plain text.
        function collectPlainText(tokens: MarkdownToken[] | null): string {
            // Return an empty string when there are no child tokens.
            if (tokens === null) { return ''; }

            // Accumulate the flattened plain-text output here.
            let result = '';

            // Visit each token in order to collect readable text.
            for (const token of tokens) {
                // Handle each token according to its markdown meaning.
                switch (token.type) {
                    case 'code_inline':
                    case 'html_inline':
                    case 'text':
                        // Append direct text-like content to the result.
                        result += token.content;
                        break;
                    case 'hardbreak':
                    case 'softbreak':
                        // Replace line breaks with spaces in flattened text.
                        result += ' ';
                        break;
                    default:
                        // Recurse into child tokens to gather nested text.
                        result += collectPlainText(token.children);
                        break;
                }
            }

            // Return the accumulated plain-text value.
            return result;
        }

        // Map markdown heading depth to the matching Fluent typography component.
        function renderHeading(level: number, children: React.ReactNode[], key: string): React.ReactNode {
            // Select the appropriate typography component for the heading depth.
            switch (level) {
                case 1:
                    return <Title1 key={ key }>{ children }</Title1>;
                case 2:
                    return <Title2 key={ key }>{ children }</Title2>;
                case 3:
                    return <Title3 key={ key }>{ children }</Title3>;
                case 4:
                    return <Subtitle1 key={ key }>{ children }</Subtitle1>;
                default:
                    return <Subtitle2 key={ key }>{ children }</Subtitle2>;
            }
        }

        // Render inline token ranges into React nodes.
        function renderInlineRange(tokensToRender: MarkdownToken[] | null, keyPrefix: string, startIndex: number, closingTokenType: string | null = null): { 'nextIndex': number; 'nodes': React.ReactNode[] } {
            // Return an empty result when no inline tokens exist.
            if (tokensToRender === null) {
                return {
                    'nextIndex': startIndex,
                    'nodes': []
                };
            }

            // Collect the rendered inline nodes.
            const nodes: React.ReactNode[] = [];
            // Track the current traversal position.
            let index = startIndex;

            // Continue until the inline token range is exhausted.
            while (index < tokensToRender.length) {
                // Read the current token from the inline token stream.
                const token = tokensToRender[index]!;

                // Stop when the matching closing token is reached.
                if (closingTokenType !== null && token.type === closingTokenType) {
                    return {
                        'nextIndex': index,
                        'nodes': nodes
                    };
                }

                // Build a stable React key for this token render.
                const key = `${ keyPrefix }-${ index }`;

                // Branch based on the inline token type.
                switch (token.type) {
                    case 'code_inline':
                        nodes.push(<code className={ styleList.inlineCode } key={ key }><Caption1>{ token.content }</Caption1></code>);
                        index += 1;
                        continue;
                    case 'em_open': {
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-emphasis`, index + 1, 'em_close');

                        nodes.push(<em key={ key }>{ renderedContent.nodes }</em>);
                        index = renderedContent.nextIndex + 1;
                        continue;
                    }
                    case 'hardbreak':
                    case 'softbreak':
                        nodes.push(<br key={ key } />);
                        index += 1;
                        continue;
                    case 'html_inline':
                    case 'text':
                        nodes.push(token.content);
                        index += 1;
                        continue;
                    case 'image': {
                        const altText = collectPlainText(token.children).trim() || token.content || 'Image';
                        const sourceUri = token.attrGet('src');

                        if (!isSafeUri(sourceUri)) {
                            nodes.push(<Caption1 key={ key }>{ altText }</Caption1>);
                            index += 1;
                            continue;
                        }

                        nodes.push(<Caption1 key={ key }>{ isExternalUri(sourceUri) ? <Link href={ sourceUri } rel="noreferrer noopener nofollow" target="_blank">{ altText }</Link> : <Link href={ sourceUri }>{ altText }</Link> }</Caption1>);
                        index += 1;
                        continue;
                    }
                    case 'link_open': {
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-link`, index + 1, 'link_close');
                        const href = token.attrGet('href');

                        if (!isSafeUri(href)) {
                            nodes.push(<Fragment key={ key }>{ renderedContent.nodes }</Fragment>);
                            index = renderedContent.nextIndex + 1;
                            continue;
                        }

                        nodes.push(
                            isExternalUri(href)
                                ? <Link href={ href } key={ key } rel="noreferrer noopener nofollow" target="_blank">{ renderedContent.nodes }</Link>
                                : <Link href={ href } key={ key }>{ renderedContent.nodes }</Link>
                        );
                        index = renderedContent.nextIndex + 1;
                        continue;
                    }
                    case 's_open': {
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-strikethrough`, index + 1, 's_close');

                        nodes.push(<s key={ key }>{ renderedContent.nodes }</s>);
                        index = renderedContent.nextIndex + 1;
                        continue;
                    }
                    case 'strong_open': {
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-strong`, index + 1, 'strong_close');

                        nodes.push(<Body1Strong key={ key }>{ renderedContent.nodes }</Body1Strong>);
                        index = renderedContent.nextIndex + 1;
                        continue;
                    }
                    default:
                        if (token.children !== null) { nodes.push(<Fragment key={ key }>{ renderInlineRange(token.children, `${ key }-children`, 0).nodes }</Fragment>); }
                        index += 1;
                        continue;
                }
            }

            // Return the fully rendered inline result when the loop finishes normally.
            return {
                'nextIndex': index,
                'nodes': nodes
            };
        }

        // Render block token ranges into React nodes.
        function renderBlockRange(tokensToRender: MarkdownToken[], keyPrefix: string, startIndex: number, closingTokenType: string | null = null): { 'nextIndex': number; 'nodes': React.ReactNode[] } {
            // Collect the rendered block nodes.
            const nodes: React.ReactNode[] = [];
            // Track the current traversal position.
            let index = startIndex;

            // Render list token bodies into list item nodes.
            function renderListItems(listTokens: MarkdownToken[], listKeyPrefix: string, listClosingTokenType: string): { 'nextIndex': number; 'nodes': React.ReactNode[] } {
                // Collect the rendered list item nodes.
                const listNodes: React.ReactNode[] = [];
                // Track the current list traversal position.
                let listIndex = 0;
                // Track the current list item number.
                let itemIndex = 0;

                // Continue until the list body token range is exhausted.
                while (listIndex < listTokens.length) {
                    // Read the current list token.
                    const token = listTokens[listIndex]!;

                    // Stop when the list-closing token is reached.
                    if (token.type === listClosingTokenType) {
                        return {
                            'nextIndex': listIndex,
                            'nodes': listNodes
                        };
                    }

                    // Render the content inside each list item.
                    if (token.type === 'list_item_open') {
                        const renderedContent = renderBlockRange(listTokens, `${ listKeyPrefix }-item-${ itemIndex }`, listIndex + 1, 'list_item_close');

                        listNodes.push(<li className={ styleList.listItem } key={ `${ listKeyPrefix }-${ itemIndex }` }>{ renderedContent.nodes }</li>);
                        itemIndex += 1;
                        listIndex = renderedContent.nextIndex + 1;
                        continue;
                    }

                    // Skip tokens that do not start a list item.
                    listIndex += 1;
                }

                // Return the rendered list body when the loop finishes normally.
                return {
                    'nextIndex': listIndex,
                    'nodes': listNodes
                };
            }

            // Continue until the block token range is exhausted.
            while (index < tokensToRender.length) {
                // Read the current block token.
                const token = tokensToRender[index]!;

                // Stop when the matching closing token is reached.
                if (closingTokenType !== null && token.type === closingTokenType) {
                    return {
                        'nextIndex': index,
                        'nodes': nodes
                    };
                }

                // Build a stable React key for the current block token.
                const key = `${ keyPrefix }-${ index }`;

                // Branch based on the block token type.
                switch (token.type) {
                    case 'blockquote_open': {
                        const renderedContent = renderBlockRange(tokensToRender, `${ key }-blockquote`, index + 1, 'blockquote_close');

                        nodes.push(
                            <Layout className={ styleList.blockquote } direction="column" gap="small" key={ key }>
                                { renderedContent.nodes }
                            </Layout>
                        );
                        index = renderedContent.nextIndex + 1;
                        continue;
                    }
                    case 'bullet_list_open': {
                        const renderedContent = renderListItems(tokensToRender.slice(index + 1), `${ key }-bullet-list`, 'bullet_list_close');

                        nodes.push(<ul className={ styleList.list } key={ key }>{ renderedContent.nodes }</ul>);
                        index += renderedContent.nextIndex + 2;
                        continue;
                    }
                    case 'code_block':
                    case 'fence':
                        nodes.push(<pre className={ styleList.codeBlock } key={ key }><Text>{ token.content }</Text></pre>);
                        index += 1;
                        continue;
                    case 'heading_open': {
                        const headingLevel = Number.parseInt(token.tag.slice(1), 10);
                        const headingContent = tokensToRender[index + 1];
                        const children = headingContent?.type === 'inline' ? renderInlineRange(headingContent.children, `${ key }-heading`, 0).nodes : [];

                        nodes.push(renderHeading(Number.isNaN(headingLevel) ? 6 : headingLevel, children, key));
                        index += 3;
                        continue;
                    }
                    case 'hr':
                        nodes.push(<Divider key={ key } />);
                        index += 1;
                        continue;
                    case 'inline':
                        nodes.push(<Body1 key={ key }>{ renderInlineRange(token.children, `${ key }-inline`, 0).nodes }</Body1>);
                        index += 1;
                        continue;
                    case 'ordered_list_open': {
                        const startValue = token.attrGet('start');
                        const parsedStartValue = startValue === null ? Number.NaN : Number.parseInt(startValue, 10);
                        const renderedContent = renderListItems(tokensToRender.slice(index + 1), `${ key }-ordered-list`, 'ordered_list_close');

                        nodes.push(
                            Number.isNaN(parsedStartValue)
                                ? <ol className={ styleList.list } key={ key }>{ renderedContent.nodes }</ol>
                                : <ol className={ styleList.list } key={ key } start={ parsedStartValue }>{ renderedContent.nodes }</ol>
                        );
                        index += renderedContent.nextIndex + 2;
                        continue;
                    }
                    case 'paragraph_open': {
                        const paragraphContent = tokensToRender[index + 1];
                        const children = paragraphContent?.type === 'inline' ? renderInlineRange(paragraphContent.children, `${ key }-paragraph`, 0).nodes : [];

                        nodes.push(token.hidden ? <Fragment key={ key }>{ children }</Fragment> : <Body1 key={ key }>{ children }</Body1>);
                        index += 3;
                        continue;
                    }
                    default:
                        if (token.children !== null) { nodes.push(<Fragment key={ key }>{ renderInlineRange(token.children, `${ key }-children`, 0).nodes }</Fragment>); }
                        index += 1;
                        continue;
                }
            }

            // Return the fully rendered block result when the loop finishes normally.
            return {
                'nextIndex': index,
                'nodes': nodes
            };
        }

        // Render the parsed markdown token stream into a React node list.
        return renderBlockRange(parsedTokens, 'markdown-root', 0).nodes;
    }, [parsedTokens, styleList]);

    // Return the final layout-based markdown output.
    return (
        // Render the root markdown container using the shared layout system.
        <Layout className={ styleList.root } direction="column" gap="medium">
            {/* Render the memoized markdown nodes inside a layout item wrapper. */ }
            <LayoutItem>{ renderedNodes }</LayoutItem>
        </Layout>
    );
}
