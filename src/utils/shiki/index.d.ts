import { IThemedToken } from 'shiki';

interface RemoteFontFamily {
    /**
     * Name of the font
     */
    name: string;
    /**
     * URL pointing to the CSS that loads the font
     */
    cssURL: string;
}
interface SVGRendererOptions {
    /**
     * A monospace font.
     *
     * If using in Node context and the font is not available in the host machine,
     * provide `cssURL` that loads the font remotely.
     * If using in the browser context, make sure the font is available in the webpage.
     *
     * ```js
     * getSVGRenderer({ fontFamily: 'SF Mono Regular' })
     *
     * getSVGRenderer({ fontFamily: {
     *   name: 'Inconsolata',
     *   cssURL: 'https://fonts.googleapis.com/css2?family=Inconsolata&display=swap'
     * }})
     */
    fontFamily: string | RemoteFontFamily;
    /**
     * URL of the CSS that loads the `fontFamily` font remotely.
     */
    remoteFontCSSURL?: string;
    /**
     * Default to 16px.
     */
    fontSize?: number;
    /**
     * How high should a line be, in relation to `fontSize`. Default to 1.4.
     * Extra spaces are distributed evenly on top/bottom of each line.
     */
    lineHeightToFontSizeRatio?: number;
    /**
     * Background color. Default to `#fff`.
     */
    bg?: string;
    /**
     * Background corner radius. Default to `4px`.
     */
    bgCornerRadius?: number;
    /**
     * How much padding should be left to the left/right in relation to font width. Default to 4.
     */
    bgSideCharPadding?: number;
    /**
     * How much padding should be left to the top/bottom in relation to
     * line height (`fontSize * lineHeightToFontSizeRatio`). Default to 2.
     */
    bgVerticalCharPadding?: number;
    /**
     * Background minimal width. Default to longest line calculated by font-measurements done by Playwright.
     */
    bgMinWidth?: number;
    /**
     * Background fill opactiy. Used for generating transparent background.
     */
    bgFillOpacity?: number;
}
declare function getSVGRenderer(options: SVGRendererOptions): Promise<{
    renderToSVG(lines: IThemedToken[][], { bg }?: {
        bg: string;
    }): string;
}>;

export { getSVGRenderer };
