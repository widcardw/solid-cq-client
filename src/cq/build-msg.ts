import { createMessageSegment } from '~/utils/api/sent-message-type'
import type { CqSentMessage } from '~/utils/api/sent-message-type'
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
        yield createMessageSegment(type, { text: decodeURI(data) })
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

async function buildMsg(msg: string) {
  if (msg.startsWith('/tex') || msg.startsWith('/am'))
    return await transformTex(msg)
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
