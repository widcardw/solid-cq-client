import { isFriendType } from '../api/friend-type'
import type { GroupType } from '../api/group-type'
import { isGroupType } from '../api/group-type'
import { isGroup, isPrivate } from '../api/received-msg-types'
import { ws } from '../ws/instance'
import { groupList, recentConv, setRecentCov } from './lists'

function pushGroupConversation(data: any) {
  if (isGroup(data) || isGroupType(data)) {
    const idx = recentConv().findIndex((i) => {
      return (
        isGroupType(i)
        && data.group_id === i.group_id)
    })
    if (idx !== -1) {
      setRecentCov((prev) => {
        const c = prev[idx] as GroupType
        if (c.group_name.startsWith('群')) {
          const name = groupList().find(i => i.group_id === c.group_id)?.group_name
          if (name)
            c.group_name = name
        }
        return [
          c,
          ...prev.slice(0, idx),
          ...prev.slice(idx + 1),
        ]
      })
    }
    // ReceivedGroupMessage or didn't find group in cache
    else {
      let name = ''
      // Did not find group in conversation cache
      if (isGroupType(data)) {
        name = data.group_name
      }
      // ReceivedGroupMessage
      else {
        if (groupList().length === 0)
          ws()?.get('get_group_list')

        name = groupList().find(i => i.group_id === data.group_id)?.group_name || `群 ${data.group_id}`
      }

      setRecentCov((prev) => {
        return [
          {
            group_id: data.group_id,
            group_name: name,
          },
          ...prev,
        ]
      })
    }
  }
}

function pushPrivateConversation(data: any) {
  if (isPrivate(data) || isFriendType(data)) {
    const idx = recentConv().findIndex((i) => {
      return (
        isFriendType(i)
        && data.user_id === i.user_id)
    })
    if (idx !== -1) {
      setRecentCov(prev => [
        prev[idx],
        ...prev.slice(0, idx),
        ...prev.slice(idx + 1),
      ])
    }

    else {
      setRecentCov(prev => [
        {
          user_id: data.user_id,
          nickname: isFriendType(data) ? data.nickname : data.sender.nickname,
          remark: isFriendType(data) ? (data.remark || data.nickname) : data.sender.nickname,
        },
        ...prev,
      ])
    }
  }
}

export {
  pushGroupConversation,
  pushPrivateConversation,
}
