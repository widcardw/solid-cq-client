import { createImageMessage, createMessageSegment, createTextMessage } from '~/utils/api/sent-message-type'
import type { CqSentMessage } from '~/utils/api/sent-message-type'
import { transformCode } from '~/utils/msg/transform-code'
import { transformTex } from '~/utils/msg/transform-tex'

function* _iter_message(msg: string): Generator<[string, string]> {
  let text_begin = 0
  const regex = /\[CQ:([a-zA-Z0-9-_.]+)((?:,[a-zA-Z0-9-_.]+=[^,\]]*)*),?\]/g
  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(msg))) {
    yield ['text', msg.substring(text_begin, match.index)]
    text_begin = match.index + match[0].length
    yield [match[1], match[2].replace(/^,/, '')]
  }
  yield ['text', msg.substring(text_begin)]
}

function* _construct(msg: string) {
  for (const [type, data] of _iter_message(msg)) {
    if (type === 'text') {
      if (data)
        yield createMessageSegment(type, { text: data })
    }
    else {
      const parsedData: { [key: string]: string } = {}
      const params = data.split(',').map(param => param.trim())
      for (const param of params) {
        const [key, value] = param.split('=', 2)
        parsedData[key] = decodeURI(value)
      }
      yield createMessageSegment(type, parsedData)
    }
  }
}

function encodeBase64(str: string) {
  return window.btoa(
    encodeURIComponent(str)
      .replace(
        /%([0-9A-F]{2})/g,
        (_, $1) => String.fromCharCode(parseInt(`0x${$1}`, 16)),
      ),
  )
}

function decodeBase64(str: string) {
  return decodeURIComponent(
    window.atob(str).split('').map(
      c => c.charCodeAt(0) >= 0x80
        ? `%${c.charCodeAt(0).toString(16)}`
        : c,
    ).join(''),
  )
}

/**
 * Transform SVG string into base64 string with native canvas
 */
async function canvasSvgToBase64(svg: string, config?: {
  /**
   * add padding to svg
   */
  padding?: number
}): Promise<string> {
  const { padding = 0 } = config || { padding: 0 }
  const canvas = document.createElement('canvas')
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)![1]
  let [, , w, h] = viewBoxMatch.split(' ').map(i => parseFloat(i))

  if (w >= 2000 || h >= 2000) {
    const rate = 10
    w /= rate
    h /= rate
  }

  const width = w + padding * 2
  const height = h + padding * 2

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')!
  context.fillStyle = 'white'
  context.fillRect(0, 0, width, height)
  const image = new Image()
  image.src = `data:image/svg+xml;base64,${encodeBase64((svg))}`
  await new Promise((resolve) => {
    image.onload = () => {
      context.drawImage(image, padding, padding, w, h)
      resolve(undefined)
    }
  })
  const b64 = canvas.toDataURL().replace(/^data:image\/png;base64,/, 'base64://')
  return b64
}

async function buildMsg(msg: string, config?: {
  enableTransformTex?: boolean
  enableTransformCode?: boolean
}) {
  let enableTransformCode = true
  let enableTransformTex = true
  if (config)
    ({ enableTransformCode = true, enableTransformTex = true } = config)
  if (enableTransformTex && (msg.startsWith('/tex') || msg.startsWith('/am')))
    return await transformTex(msg)
  if (enableTransformCode && (msg.startsWith('```') && msg.trimEnd().endsWith('```'))) {
    const match = msg.trim().match(/^```(\w*)\n([\s\S]+)\n```$/)
    if (match) {
      const [_, lang, code] = match
      const svg = await transformCode(code, lang)
      const b64 = await canvasSvgToBase64(svg)
      return createImageMessage(b64)
    }
    return createTextMessage('消息发送失败')
  }
  return transformReply(msg)
}

function transformReply(msg: string) {
  const sent: CqSentMessage = []
  for (const segment of _construct(msg))
    sent.push(segment)

  return sent
}

export {
  transformReply,
  buildMsg,
  canvasSvgToBase64,
  encodeBase64,
  decodeBase64,
}
