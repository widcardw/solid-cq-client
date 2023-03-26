import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { FriendType } from '../api/friend-type'
import type { GroupType } from '../api/group-type'
import type { ReceivedGroupMessage, ReceivedPrivateMessage } from '../api/received-msg-types'
import type { MessageTarget } from '../ws/ws'

interface AbstractConversation {
  type: MessageTarget
  id: number
  nick?: string
}

interface FriendConversation extends AbstractConversation {
  type: MessageTarget.Private
  list: ReceivedPrivateMessage[]
}

interface GroupConversation extends AbstractConversation {
  type: MessageTarget.Group
  list: ReceivedGroupMessage[]
}

type Conversation = FriendConversation | GroupConversation

interface WarningMessage {
  type: 'Info' | 'Warning' | 'Error'
  msg: string
}

const [friendList, setFriendList] = createSignal<FriendType[]>([])
const [groupList, setGroupList] = createSignal<GroupType[]>([])
const [recentConv, setRecentCov] = createSignal<(FriendType | GroupType)[]>([])
const [groupConvStore, setGroupConvStore] = createStore<GroupConversation[]>([])
const [friendConvStore, setFriendConvStore] = createStore<FriendConversation[]>([])
const [curConv, setCurConv] = createSignal<Conversation | undefined>()
const [sendEl, setSendEl] = createSignal<HTMLTextAreaElement>()
const [inited, setInited] = createSignal(false)
const [loading, setLoading] = createSignal(false)
const [warnings, setWarnings] = createSignal<WarningMessage[]>([])

export {
  friendList, setFriendList,
  groupList, setGroupList,
  recentConv, setRecentCov,
  groupConvStore, setGroupConvStore,
  friendConvStore, setFriendConvStore,
  curConv, setCurConv,
  sendEl, setSendEl,
  inited, setInited,
  loading, setLoading,
  warnings, setWarnings,
}

export type {
  FriendConversation,
  GroupConversation,
  Conversation,
}
