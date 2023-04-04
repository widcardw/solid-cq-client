import type { CqSentMessage } from '~/utils/api/sent-message-type'
import { createAtMessage, createReplyMessage, createTextMessage } from '~/utils/api/sent-message-type'
import { transformTex } from '~/utils/msg/transform-tex'

const ReplyPattern = /\[CQ:reply,id=([^\]]+)\]/
const AtPattern = /\[CQ:at,qq=([^\]]+)\]/g

async function buildMsg(msg: string) {
  if (msg.startsWith('/tex') || msg.startsWith('/am'))
    return await transformTex(msg)
  return transformReply(msg)
}

function transformReply(msg: string) {
  const sent: CqSentMessage = []
  const restOfReply = msg.replace(ReplyPattern, (_m, $1) => {
    sent.push(createReplyMessage(Number($1)))
    return ''
  })
  const restOfAt = restOfReply.replace(AtPattern, (_m, $1) => {
    sent.push(createAtMessage(Number($1)))
    return ''
  })
  sent.push(createTextMessage(restOfAt))
  return sent
}

export {
  transformReply,
  buildMsg,
}
