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
      class={clsx(['border border-b-solid border-b-zinc/10', 'px-2 py-1', 'cursor-pointer', 'hover:text-green'])}
      onClick={() => {
        pushPrivateConversation(props.friend)
        let idx = friendConvStore.findIndex(i => i.id === props.friend.user_id)
        if (idx === -1) {
          setFriendConvStore(prev => [
            ...prev,
            {
              id: props.friend.user_id,
              type: MessageTarget.Private,
              nick: props.friend.nickname,
              list: [],
            },
          ])
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
