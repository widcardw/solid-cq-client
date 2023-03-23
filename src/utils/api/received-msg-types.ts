interface ReceivedPrivateMessage {
  time: number
  self_id: number
  post_type: 'message' | 'request' | 'notice' | 'meta_event'
  message_type: 'private'
  sub_type: 'friend' | 'group' | 'group_self' | 'other'
  message_id: number
  user_id: number
  target_id: number
  message: string
  raw_message: string
  font: number
  sender: {
    user_id: number
    nickname: string
    sex: string
    age: number
  }
  temp_source: number
}

interface ReceivedGroupMessage {
  time: number
  self_id: number
  post_type: 'message' | 'request' | 'notice' | 'meta_event'
  message_type: 'group'
  sub_type: 'normal' | 'anonymous' | 'notice'
  message_id: number
  user_id: number
  message: string
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
}

function isPrivate(obj: any): obj is ReceivedPrivateMessage {
  return obj && obj.time && obj.message_type && obj.message_type === 'private'
}

function isGroup(obj: any): obj is ReceivedGroupMessage {
  return obj && obj.time && obj.message_type && obj.message_type === 'group'
}

export type {
  ReceivedPrivateMessage,
  ReceivedGroupMessage,
}

export {
  isPrivate,
  isGroup,
}
