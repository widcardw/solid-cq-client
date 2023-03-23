import clsx from 'clsx'
import type { Component } from 'solid-js'
import type { GroupType } from '~/utils/api/group-type'
import { pushGroupConversation } from '~/utils/stores/conv'
import { groupConvStore, setCurConv, setGroupConvStore } from '~/utils/stores/lists'
import { MessageTarget } from '~/utils/ws/ws'

const OneGroup: Component<{
  group: GroupType
}> = (props) => {
  return (
    <div
      class={clsx(['border border-b-solid border-b-gray/30', 'p-1'])}
      onClick={() => {
        pushGroupConversation(props.group)
        let idx = groupConvStore.findIndex(i => i.id === props.group.group_id)
        if (idx === -1) {
          setGroupConvStore(prev => [...prev, { id: props.group.group_id, type: MessageTarget.Group, list: [] }])
          idx = groupConvStore.length - 1
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
