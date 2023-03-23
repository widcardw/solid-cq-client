import type { SentMessage } from './sent-message-type'

interface MsgParams {
}

interface PrivateMsgSentParams extends MsgParams {
  user_id: number
  message: SentMessage
}

interface GroupMsgSentParams extends MsgParams {
  group_id: number
  message: SentMessage
}

interface PrivateFileSentParams extends MsgParams {
  user_id: number
  file: string
  name: string
}

interface GroupFileSentParams extends MsgParams {
  group_id: number
  file: string
  name: string
}

interface GetMsgParams extends MsgParams {
  message_id: number
}

interface DeleteMsgParams extends MsgParams {
  message_id: number
}

type WsSentParams = PrivateMsgSentParams
| PrivateFileSentParams
| GroupFileSentParams
| GroupMsgSentParams
| GetMsgParams
| DeleteMsgParams

export type {
  PrivateMsgSentParams,
  GroupMsgSentParams,
  PrivateFileSentParams,
  GroupFileSentParams,
  GetMsgParams,
  DeleteMsgParams,
  WsSentParams,
}
