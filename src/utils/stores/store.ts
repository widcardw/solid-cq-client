import type { ReceivedGroupMessage, ReceivedPrivateMessage } from '../api/received-msg-types'
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

export {
  addFriendStore,
  addGroupStore,
}
