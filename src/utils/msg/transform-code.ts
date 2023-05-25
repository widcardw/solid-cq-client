import { BUNDLED_LANGUAGES, getHighlighter, setCDN, setWasm } from 'shiki'
import type { Highlighter, Lang } from 'shiki'
import { getSVGRenderer } from '../shiki/index'
import { WarningType, pushRightBottomMessage } from '../stores/lists.js'

let highlighter: Highlighter

type Await<T> = T extends PromiseLike<infer R> ? R : never
type SVGRendererType = Await<ReturnType<typeof getSVGRenderer>>

let svgRenderer: SVGRendererType
let wasm: ArrayBuffer

async function transformCode(code: string, lang?: string): Promise<string> {
  if (!wasm)
    wasm = await fetch('/onig.wasm').then(res => res.arrayBuffer())
  setWasm(wasm)
  setCDN('https://cdn.jsdelivr.net/npm/shiki/')

  // init highlighter
  if (!highlighter) {
    highlighter = await getHighlighter({
      theme: 'nord',
      langs: ['javascript', 'python'],
    })
  }

  // init svgRenderer
  if (!svgRenderer) {
    svgRenderer = await getSVGRenderer({
      bg: '#2E3440',
      fontFamily: 'IBM Plex Mono',
      fontSize: 14,
      bgSideCharPadding: 2,
      bgVerticalCharPadding: 0.75,
    })
  }

  // init language
  if (!highlighter.getLoadedLanguages().includes(lang as Lang)) {
    const hasLang = BUNDLED_LANGUAGES.some((bundle) => {
      return bundle.id === lang || bundle.aliases?.includes(lang as Lang)
    })
    if (hasLang) {
      await highlighter.loadLanguage(lang as Lang)
    }
    else {
      console.error(`language "${lang}" is not supported by shiki`)
      pushRightBottomMessage({
        type: WarningType.Warning,
        msg: `抱歉，不支持语言 “${lang}” 的语法高亮`,
      })
      lang = 'text'
    }
  }

  const tokens = highlighter.codeToThemedTokens(code, lang || 'text')
  const out = svgRenderer.renderToSVG(tokens)
  return out
}

export {
  transformCode,
}
