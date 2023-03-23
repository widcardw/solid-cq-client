import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import { transformReceived } from '~/utils/msg/received-msg-transformer'
import type { FriendConversation } from '~/utils/stores/lists'
import { sendEl } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'

import './scroller.css'
import './icon.css'

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
            <div class={clsx('m-2', 'one-msg')}>
              <div class="flex items-center space-x-2">
                <div>{item.sender.nickname}</div>
                <div
                  class={clsx('i-teenyicons-attach-outline', 'cursor-pointer', 'hover:text-blue', 'icon')}
                  onClick={() => {
                    // template string concatenate may conflict with unocss
                    // eslint-disable-next-line prefer-template
                    sendEl()!.value = '[CQ:reply,id=' + item.message_id + ']' + sendEl()!.value
                  }}
                />
                <Show when={item.self_id === item.sender.user_id}>
                  <div
                    class={clsx('i-teenyicons-bin-outline', 'cursor-pointer', 'hover:text-red', 'icon')}
                    onClick={() => ws.send('delete_msg', { message_id: item.message_id })}
                  />
                </Show>
              </div>
              <div innerHTML={transformReceived(item.message)} />
            </div>
          )}
        </For>
      </div>
    </>
  )
}

export {
  FriendConv,
}
