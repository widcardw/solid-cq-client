import type { ReceivedFriendRecall, ReceivedGroupMessage, ReceivedGroupRecall, ReceivedPrivateMessage } from '../api/received-msg-types'
import { MessageTarget } from '../ws/ws'
import { friendConvStore, groupConvStore, setFriendConvStore, setGroupConvStore } from './lists'

function addGroupStore(data: ReceivedGroupMessage) {
  const idx = groupConvStore.findIndex(i => i.id === data.group_id)
  if (idx !== -1)
    setGroupConvStore(idx, 'list', prev => [...prev, data])
  else
    setGroupConvStore(prev => [...prev, { type: MessageTarget.Group, id: data.group_id, list: [data] }])
}

function addFriendStore(data: ReceivedPrivateMessage) {
  const idx = friendConvStore.findIndex(i => i.id === data.user_id)
  if (idx !== -1)
    setFriendConvStore(idx, 'list', prev => [...prev, data])
  else
    setFriendConvStore(prev => [...prev, { type: MessageTarget.Private, id: data.user_id, list: [data] }])
}

function recallFriendStore(data: ReceivedPrivateMessage | ReceivedFriendRecall) {
  const idx1 = friendConvStore.findIndex(i => i.id === data.user_id)
  if (idx1 === -1)
    return
  const idx2 = friendConvStore[idx1].list.findIndex(i => i.message_id === data.message_id)
  if (idx2 === -1)
    return
  setFriendConvStore(idx1, 'list', idx2, 'deleted', true)
}

function recallGroupStore(data: ReceivedGroupMessage | ReceivedGroupRecall) {
  const idx1 = groupConvStore.findIndex(i => i.id === data.group_id)
  if (idx1 === -1)
    return
  const idx2 = groupConvStore[idx1].list.findIndex(i => i.message_id === data.message_id)
  if (idx2 === -1)
    return
  setGroupConvStore(idx1, 'list', idx2, 'deleted', true)
}

export {
  addFriendStore,
  addGroupStore,
  recallFriendStore,
  recallGroupStore,
}
