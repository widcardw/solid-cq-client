import { getHighlighter, setCDN, setWasm } from 'shiki'
// @ts-expect-error type declaration
import { getSVGRenderer } from '../shiki/index.browser.mjs'

let wasm: any

async function transformCode(code: string, lang?: string): Promise<string> {
  if (!wasm)
    wasm = await fetch('/onig.wasm').then(res => res.arrayBuffer())
  setWasm(wasm)
  setCDN('https://cdn.jsdelivr.net/npm/shiki/')
  const highlighter = await getHighlighter({
    theme: 'nord',
  })

  const svgRenderer = await getSVGRenderer({
    bg: '#2E3440',
    fontFamily: 'IBM Plex Mono',
    fontSize: 14,
  })

  const tokens = highlighter.codeToThemedTokens(code, lang || 'text')
  const out = svgRenderer.renderToSVG(tokens)
  return out
}

export {
  transformCode,
}
