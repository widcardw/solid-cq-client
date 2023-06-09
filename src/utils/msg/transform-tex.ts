import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml.js'
import juice from 'juice/client'

import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { AsciiMath } from 'asciimath-parser'
import { createImageMessage } from '../api/sent-message-type'
import { setWasmInited, wasmInited } from '../stores/semaphore'
import { canvasSvgToBase64 } from '~/cq/build-msg'

const am = new AsciiMath()

const documentOptions = {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' }),
}
const convertOptions = {
  display: false,
}

function renderMath(content: string): string {
  const adaptor = liteAdaptor()
  const handler = RegisterHTMLHandler(adaptor)
  AssistiveMmlHandler(handler)
  const mathDocument = mathjax.document(content, documentOptions)
  const html = adaptor.outerHTML(
    mathDocument.convert(content, convertOptions),
  )
  const stylesheet = adaptor.outerHTML(documentOptions.OutputJax.styleSheet(mathDocument) as any)
  return juice(html + stylesheet)
}

function addPadding(svg: string): string {
  return svg.replace(/viewBox="([^"]*)"/, (_match, $1: string) => {
    const viewBox = $1.split(' ')
      .map(parseFloat)
      .map((x, i) => i < 2 ? x - 100 : x + 200)
      .join(' ')
    return `viewBox="${viewBox}"`
  })
}

async function svgToPng(svg: string, padding = true) {
  if (padding) {
    svg = svg.match(/<svg(.*)<\/svg>/)![0]
    svg = addPadding(svg)
  }
  if (!wasmInited()) {
    await initWasm(fetch('/index_bg.wasm'))
    setWasmInited(true)
  }

  const resvg = new Resvg(svg, {
    background: 'rgb(255,255,255)',
    fitTo: {
      mode: 'height',
      value: 100,
    },
  })
  const buffer = resvg.render().asPng()
  const bytes = new Uint8Array(buffer)
  return u8tobase64(bytes)
}

function u8tobase64(bytes: Uint8Array) {
  let data = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++)
    data += String.fromCharCode(bytes[i])

  return `base64://${window.btoa(data)}`
}

function msgContentToSvg(msg: string) {
  let tex = ''
  if (msg.startsWith('/tex'))
    tex = msg.replace('/tex', '').trim()

  else if (msg.startsWith('/am'))
    tex = am.toTex(msg.replace('/am', '').trim())

  const svg = renderMath(tex)
  return svg
}

async function transformTex(msg: string) {
  let svg = msgContentToSvg(msg)
  svg = svg.match(/<svg(.*)<\/svg>/)![0]
  const b64 = await canvasSvgToBase64(svg, { padding: 20 })
  return createImageMessage(b64)
}

export {
  transformTex,
  svgToPng,
  u8tobase64,
  msgContentToSvg,
  renderMath,
}
