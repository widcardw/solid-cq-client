import { isFriendList, isFriendType } from '../api/friend-type'
import { isGroupList, isGroupType } from '../api/group-type'
import { isGroup, isPrivate } from '../api/received-msg-types'
import { selfId } from '../self_id'
import { pushGroupConversation, pushPrivateConversation } from '../stores/conv'
import { friendConvStore, recentConv, sendEl, setFriendList, setGroupList, setRecentCov, setSendEl } from '../stores/lists'
import { addFriendStore, addGroupStore } from '../stores/store'
import { createWs } from './ws'

const ws = createWs('ws://0.0.0.0:5700')
ws.listen((data: any) => {
  if (data.post_type === 'meta_event' || data.post_type === 'notice' || data.post_type === 'request')
    return

  if (isFriendList(data.data)) {
    setFriendList(data.data)
    return
  }
  if (isGroupList(data.data)) {
    setGroupList(data.data)
    return
  }
  if (data.message === '' && data.retcode === 0 && data.status === 'ok') {
    if (Object.keys(data.data).length === 1) {
      sendEl()!.value = ''
      return
    }
  }
  if (isPrivate(data)) {
    if (data.user_id === data.self_id)
      data.user_id = data.target_id

    pushPrivateConversation(data)
    addFriendStore(data)
    return
  }

  if (isGroup(data)) {
    pushGroupConversation(data)
    addGroupStore(data)
  }
})

export {
  ws,
}
