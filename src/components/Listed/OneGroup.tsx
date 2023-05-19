import clsx from 'clsx'
import type { Component } from 'solid-js'
import type { GroupType } from '~/utils/api/group-type'
import { pushGroupConversation } from '~/utils/stores/conv'
import { groupConvStore, groupList, setCurConv, setGroupConvStore } from '~/utils/stores/lists'
import { MessageTarget } from '~/utils/ws/ws'

const OneGroup: Component<{
  group: GroupType
}> = (props) => {
  return (
    <div
      class={clsx(['border border-b-solid border-b-zinc/10', 'px-2 py-1', 'cursor-pointer', 'hover:text-blue'])}
      style={{ 'line-break': 'anywhere' /* sorry but I don't know how to write this in unocss */ }}
      onClick={() => {
        pushGroupConversation(props.group)
        let idx = groupConvStore.findIndex(i => i.id === props.group.group_id)
        if (idx === -1) {
          setGroupConvStore(prev => [
            ...prev,
            {
              id: props.group.group_id,
              type: MessageTarget.Group,
              list: [],
            },
          ])
          idx = groupConvStore.length - 1
        }
        if (!groupConvStore[idx].nick) {
          const group_id = props.group.group_id
          const group_name = groupList().find(i => i.group_id === group_id)?.group_name
          setGroupConvStore(idx, 'nick', group_name)
        }
        setCurConv(groupConvStore[idx])
      }}
    >
      {props.group.group_memo || props.group.group_name}
    </div>
  )
}

export {
  OneGroup,
}
