import { createImageMessage, createMessageSegment, createTextMessage } from '~/utils/api/sent-message-type'
import type { CqSentMessage } from '~/utils/api/sent-message-type'
import { transformCode } from '~/utils/msg/transform-code'
import { svgToPng, transformTex } from '~/utils/msg/transform-tex'
import { setWarnings } from '~/utils/stores/lists'

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
      const canvas = document.createElement('canvas')
      const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)![1]
      const [l, u, r, d] = viewBoxMatch.split(' ').map(i => parseFloat(i))
      canvas.width = r - l
      canvas.height = d - u
      // console.log(canvas.width, canvas.height)
      const context = canvas.getContext('2d')
      const image = new Image()
      image.src = `data:image/svg+xml;base64,${window.btoa(svg)}`
      await new Promise((resolve) => {
        image.onload = () => {
          context?.drawImage(image, l, u, r, d)
          resolve(undefined)
        }
      })
      const b64 = canvas.toDataURL().replace(/^data:image\/png;base64,/, 'base64://')
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
}
