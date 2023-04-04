import type { CqReceivedMessage } from './sent-message-type'

interface ReceivedPrivateMessage {
  time: number
  self_id: number
  post_type: 'message' | 'request' | 'notice' | 'meta_event'
  message_type: 'private'
  sub_type: 'friend' | 'group' | 'group_self' | 'other'
  message_id: number
  user_id: number
  target_id: number
  message: CqReceivedMessage
  raw_message: string
  font: number
  sender: {
    user_id: number
    nickname: string
    sex: string
    age: number
  }
  temp_source: number
  deleted?: boolean
}

interface ReceivedGroupMessage {
  time: number
  self_id: number
  post_type: 'message' | 'request' | 'notice' | 'meta_event'
  message_type: 'group'
  sub_type: 'normal' | 'anonymous' | 'notice'
  message_id: number
  user_id: number
  message: CqReceivedMessage
  raw_message: string
  font: number
  sender: {
    user_id: number
    nickname: string
    sex: 'male' | 'female' | 'unknown'
    age: number
    card: string
    area: string
    level: string
    role: 'owner' | 'admin' | 'member'
    title: string
  }
  group_id: number
  anonymous: {
    id: number
    name: string
    flag: string
  }
  deleted?: boolean
}

interface ReceivedFriendRecall {
  message_id: number
  notice_type: 'friend_recall'
  post_type: 'notice'
  self_id: number
  time: number
  user_id: number
}

interface ReceivedGroupRecall {
  message_id: number
  notice_type: 'group_recall'
  post_type: 'notice'
  self_id: number
  time: number
  user_id: number
  group_id: number
  operator_id: number
}

interface ReceivedForwardedOneMessage {
  content: CqReceivedMessage
  sender: {
    nickname: string
    user_id: number
  }
  time: number
}

interface ReceivedForwardedMessage {
  messages: ReceivedForwardedOneMessage[]
}

function isPrivate(obj: any): obj is ReceivedPrivateMessage {
  return obj && obj.time && obj.message_type && obj.message_type === 'private'
}

function isGroup(obj: any): obj is ReceivedGroupMessage {
  return obj && obj.time && obj.message_type && obj.message_type === 'group'
}

function isForwardedMessage(obj: any): obj is ReceivedForwardedMessage {
  return obj && obj.messages && Array.isArray(obj.messages)
}

export type {
  ReceivedPrivateMessage,
  ReceivedGroupMessage,
  ReceivedFriendRecall,
  ReceivedGroupRecall,
  ReceivedForwardedOneMessage,
  ReceivedForwardedMessage,
}

export {
  isPrivate,
  isGroup,
  isForwardedMessage,
}
