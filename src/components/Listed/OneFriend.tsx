import clsx from 'clsx'
import type { Component } from 'solid-js'
import type { FriendType } from '~/utils/api/friend-type'
import { pushPrivateConversation } from '~/utils/stores/conv'
import { friendConvStore, setCurConv, setFriendConvStore } from '~/utils/stores/lists'
import { MessageTarget } from '~/utils/ws/ws'

const OneFriend: Component<{
  friend: FriendType
}> = (props) => {
  return (
    <div
      class={clsx(['border border-b-solid border-b-zinc/20', 'p-1'])}
      onClick={() => {
        pushPrivateConversation(props.friend)
        let idx = friendConvStore.findIndex(i => i.id === props.friend.user_id)
        if (idx === -1) {
          setFriendConvStore(prev => [...prev, { id: props.friend.user_id, type: MessageTarget.Private, list: [] }])
          idx = friendConvStore.length - 1
        }
        setCurConv(friendConvStore[idx])
      }}
    >
      {props.friend.remark || props.friend.nickname}
    </div>
  )
}

export {
  OneFriend,
}
