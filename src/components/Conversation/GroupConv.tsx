import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { GroupConvMessage } from './GroupConvMessage'
import type { GroupConversation } from '~/utils/stores/lists'

import './scroller.css'
import './icon.css'

const GroupConv: Component<{
  conv: GroupConversation
}> = (props) => {
  return (
    <>
      <div class={clsx([
        'p-2',
        'text-1.2rem',
        'border border-b-solid border-b-zinc/20',
      ])}
      >{props.conv.id}
      </div>
      <div class={clsx('flex-1', 'of-y-auto', 'scroller')}>
        <For each={props.conv.list}>
          {item => (
            <GroupConvMessage item={item} />
          )}
        </For>
      </div>
    </>
  )
}

export {
  GroupConv,
}
