import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { FriendConvMessage } from './FriendConvMessage'
import type { FriendConversation } from '~/utils/stores/lists'

import './scroller.css'
import './icon.css'
import './modal.css'

const FriendConv: Component<{
  conv: FriendConversation
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
            <FriendConvMessage item={item} />
          )}
        </For>
      </div>
    </>
  )
}

export {
  FriendConv,
}
