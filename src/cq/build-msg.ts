import type { SentMessage } from '~/utils/api/sent-message-type'
import { createReplyMessage, createTextMessage } from '~/utils/api/sent-message-type'
import { transformTex } from '~/utils/msg/transform-tex'

const ReplyPattern = /\[CQ:reply,id=([^\]]+)\]/

async function buildMsg(msg: string) {
  if (msg.startsWith('/tex') || msg.startsWith('/am'))
    return await transformTex(msg)
  return transformReply(msg)
}

function transformReply(msg: string) {
  const sent: SentMessage = []
  const rest = msg.replace(ReplyPattern, (_m, $1) => {
    sent.push(createReplyMessage(Number($1)))
    return ''
  })
  sent.push(createTextMessage(rest))
  return sent
}

export {
  transformReply,
  buildMsg,
}
