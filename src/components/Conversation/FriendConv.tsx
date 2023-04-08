import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, createEffect, createSignal } from 'solid-js'
import { FriendConvMessage } from './FriendConvMessage'
import type { FriendConversation } from '~/utils/stores/lists'

import './scroller.css'
import './icon.css'
import './modal.css'

const FriendConv: Component<{
  conv: FriendConversation
}> = (props) => {
  const [el, setEl] = createSignal<HTMLDivElement>()
  function toBottom() {
    const e = el()
    if (e)
      e.scrollTo({ top: e.scrollHeight })
  }
  createEffect(() => {
    if (props.conv.id)
      toBottom()
  })
  return (
    <>
      <div class={clsx([
        'p-2',
        'text-1.2rem',
        'border border-b-solid border-b-zinc/20',
        'flex', 'items-center',
        'justify-between',
      ])}
      >
        <div>{props.conv.nick} {props.conv.id}</div>
        <div
          class={clsx(
            'i-teenyicons-arrow-down-circle-outline',
            'hover:text-blue',
            'cursor-pointer',
          )}
          title="点击跳转到底部"
          onClick={toBottom}
        />
      </div>
      <div
        ref={r => setEl(r)}
        class={clsx('flex-1', 'of-y-auto', 'scroller')}
      >
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
