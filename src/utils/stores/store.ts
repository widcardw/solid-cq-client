import type { ReceivedFriendRecall, ReceivedGroupMessage, ReceivedGroupRecall, ReceivedPrivateMessage } from '../api/received-msg-types'
import { MessageTarget } from '../ws/ws'
import { friendConvStore, groupConvStore, groupList, setFriendConvStore, setGroupConvStore } from './lists'

/**
 * Store the message with this group in a global storage (not permanently).
 * If the group label is clicked, then the current conversation will be set
 * to the stored conversation.
 */
function addGroupStore(data: ReceivedGroupMessage) {
  let idx = groupConvStore.findIndex(i => i.id === data.group_id)
  if (idx !== -1) {
    setGroupConvStore(idx, 'list', prev => [...prev, data])
  }
  else {
    idx = groupConvStore.length
    setGroupConvStore(prev => [
      ...prev,
      {
        type: MessageTarget.Group,
        id: data.group_id,
        list: [data],
      },
    ])
  }
  if (!groupConvStore[idx].nick) {
    const group_id = data.group_id
    const group_name = groupList().find(i => i.group_id === group_id)?.group_name || '群'
    setGroupConvStore(idx, 'nick', group_name)
  }
}

/**
 * Store the messages with this group in a global storage (not permanently).
 * If the group label is clicked, then the current conversation will be set
 * to the stored conversation.
 *
 * @param data The messages to be stored. Must be from the same group and sorted by time in ascending order.
 */
function addGroupMessages(data: ReceivedGroupMessage[]) {
  let idx = groupConvStore.findIndex(i => i.id === data[0].group_id)
  if (idx === -1) {
    idx = groupConvStore.length
    setGroupConvStore(prev => [
      ...prev,
      {
        type: MessageTarget.Group,
        id: data[0].group_id,
        list: data,
      },
    ])
    if (!groupConvStore[idx].nick) {
      const group_id = data[0].group_id
      const group_name = groupList().find(i => i.group_id === group_id)?.group_name || '群'
      setGroupConvStore(idx, 'nick', group_name)
    }
    return
  }
  setGroupConvStore(idx, 'list', (prev) => {
    const result: ReceivedGroupMessage[] = []
    let i = 0
    let j = 0
    while (i < prev.length && j < data.length) {
      if (prev[i].time < data[j].time) {
        result.push(prev[i])
        i++
      }
      else if (prev[i].time > data[j].time) {
        result.push(data[j])
        j++
      }
      else {
        if (prev[i].message_id !== data[j].message_id) {
          result.push(prev[i])
          result.push(data[j])
        }
        else {
          result.push(prev[i])
        }
        i++
        j++
      }
    }

    while (i < prev.length) {
      result.push(prev[i])
      i++
    }
    while (j < data.length) {
      result.push(data[j])
      j++
    }
    return result
  })
}

/**
 * Store the message with this friend in a global storage (not permanently).
 * If the friend label is clicked, then the current conversation will be set
 * to the stored conversation.
 */
function addFriendStore(data: ReceivedPrivateMessage) {
  const idx = friendConvStore.findIndex(i => i.id === data.user_id)
  if (idx !== -1) {
    setFriendConvStore(idx, 'list', prev => [...prev, data])
  }
  else {
    setFriendConvStore(prev => [
      ...prev,
      {
        type: MessageTarget.Private,
        id: data.user_id,
        nick: data.sender.nickname,
        list: [data],
      },
    ])
  }
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
  addGroupMessages,
}
