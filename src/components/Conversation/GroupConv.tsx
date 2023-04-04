import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, createSignal } from 'solid-js'
import { GroupConvMessage } from './GroupConvMessage'
import type { GroupConversation } from '~/utils/stores/lists'

import './scroller.css'
import './icon.css'

const GroupConv: Component<{
  conv: GroupConversation
}> = (props) => {
  const [el, setEl] = createSignal<HTMLDivElement>()
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
          onClick={() => {
            const e = el()
            if (e)
              e.scrollTo({ top: e.scrollHeight })
          }}
        />
      </div>
      <div
        ref={r => setEl(r)}
        class={clsx('flex-1', 'of-y-auto', 'scroller', 'scroll-smooth')}
      >
        <For each={props.conv.list}>
          {item => (
            <GroupConvMessage item={item} />
          )}
        </For>
        <div id="conv-bottom"></div>
      </div>
    </>
  )
}

export {
  GroupConv,
}
