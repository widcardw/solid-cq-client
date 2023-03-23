import type { Component } from 'solid-js'
import clsx from 'clsx'
import { ListState } from '~/utils/list-state'

const LeftSidebar: Component<{
  cls?: string
  state: ListState
  onListStateChange: (id: ListState) => void
}> = (props) => {
  return (
    <div class={clsx([props.cls])}>
      <div
        class={clsx(['i-teenyicons-message-text-alt-outline', 'cursor-pointer', 'm-4', props.state === ListState.Message && 'text-blue'])}
        title="最近消息"
        onClick={() => props.onListStateChange(ListState.Message)}
      >
      </div>
      <div
        class={clsx(['i-teenyicons-user-circle-outline', 'cursor-pointer', 'm-4', props.state === ListState.Contact && 'text-blue'])}
        title="好友列表"
        onClick={() => props.onListStateChange(ListState.Contact)}
      >
      </div>
      <div
        class={clsx(['i-teenyicons-users-outline', 'cursor-pointer', 'm-4', props.state === ListState.Groups && 'text-blue'])}
        title="群列表"
        onClick={() => props.onListStateChange(ListState.Groups)}
      >
      </div>
    </div>
  )
}

export {
  LeftSidebar,
}
