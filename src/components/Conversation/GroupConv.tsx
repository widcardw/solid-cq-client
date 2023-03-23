import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { transformImg, transformReceived } from '~/utils/msg/received-msg-transformer'
import type { GroupConversation } from '~/utils/stores/lists'
import { sendEl } from '~/utils/stores/lists'

import './scroller.css'

const GroupConv: Component<{
  conv: GroupConversation
}> = (props) => {
  return (
    <>
      <div class={clsx([
        'p-2',
        'text-1.2rem',
        'border border-b-solid border-b-gray/30',
      ])}
      >{props.conv.id}
      </div>
      <div class={clsx('flex-1', 'of-y-auto', 'scroller')}>
        <For each={props.conv.list}>
          {item => (
            <div class={clsx(['m-2'])}>
              <div class="flex items-center space-x-2">
                <div>[{item.sender.role}] {item.sender.nickname}</div>
                <div
                  class={clsx('i-teenyicons-attach-outline', 'cursor-pointer', 'hover:text-blue')}
                  onClick={() => {
                    // eslint-disable-next-line prefer-template
                    sendEl()!.value = '[CQ:reply,id=' + item.message_id + ']' + sendEl()!.value
                  }}
                >
                </div>
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
  GroupConv,
}
