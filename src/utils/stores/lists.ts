import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { nanoid } from 'nanoid'
import type { FriendType } from '../api/friend-type'
import type { GroupType } from '../api/group-type'
import type { ReceivedForwardedMessage, ReceivedGroupMessage, ReceivedPrivateMessage } from '../api/received-msg-types'
import type { MessageTarget } from '../ws/ws'
import type { GroupFsList } from '../api/group-fs'

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

enum WarningType {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
}

interface WarningMessage {
  type: WarningType
  msg: string
  extra?: string
  ttl?: number
  id: string
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
const [forwardMap, setForwardMap] = createStore<Record<string, ReceivedForwardedMessage>>({})
const [lastForwardId, setLastforwardId] = createSignal('')
const [groupFsStore, setGroupFsStore] = createStore<Record<string, GroupFsList>>({})

function pushRightBottomMessage(config: Omit<WarningMessage, 'id'>) {
  const { ttl } = config
  const id = nanoid()
  setWarnings(p => [...p, { ...config, id }])
  ttl && setTimeout(() => {
    setWarnings(p => p.filter(i => i.id !== id))
  }, ttl)
}

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
  forwardMap, setForwardMap,
  lastForwardId, setLastforwardId,
  groupFsStore, setGroupFsStore,
  WarningType,
  pushRightBottomMessage,
}

export type {
  FriendConversation,
  GroupConversation,
  Conversation,
}
