import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { MessageShown } from '../MessageShown/MessageShown'
import type { ReceivedGroupMessage } from '~/utils/api/received-msg-types'
import { useConfirm } from '~/utils/hook/useConfirm'
import { sendEl } from '~/utils/stores/lists'
import { recallGroupStore } from '~/utils/stores/store'
import { ws } from '~/utils/ws/instance'

function roleToColor(role: string) {
  switch (role) {
    case 'owner': return 'text-amber'
    case 'admin': return 'text-green-6'
    default: return 'text-blue-6'
  }
}

const GroupConvMessage: Component<{
  item: ReceivedGroupMessage
}> = (props) => {
  const { reveal, unreveal, isRevealed } = useConfirm()
  const isSelf = props.item.self_id === props.item.sender.user_id
  return (
    <div class={clsx('m-2', 'one-msg')} id={props.item.message_id.toString()}>
      <div class={clsx('flex items-center space-x-2', { 'flex-row-reverse': isSelf })}>
        <div>
          <span class={roleToColor(props.item.sender.role)}>[{props.item.sender.role}]</span> {props.item.sender.card || props.item.sender.nickname} {props.item.deleted && '[已撤回]'}
        </div>
        <div
          class={clsx('i-teenyicons-attach-outline', 'cursor-pointer', 'hover:text-blue', 'icon')}
          onClick={() => {
            // template string concatenate may conflict with unocss
            const el = sendEl()
            if (el)
            // eslint-disable-next-line prefer-template
              el.value = '[CQ:reply,id=' + props.item.message_id + ']' + el.value
          }}
        />
        <div
          class={clsx('i-teenyicons-at-solid', 'cursor-pointer', 'hover:text-blue', 'icon')}
          onClick={() => {
            // template string concatenate may conflict with unocss
            const el = sendEl()
            if (el)
            // eslint-disable-next-line prefer-template
              el.value = el.value + '[CQ:at,qq=' + props.item.sender.user_id + ']'
          }}
        />
        <Show when={isSelf}>
          <div
            class={clsx('i-teenyicons-bin-outline', 'cursor-pointer', 'hover:text-red', 'icon')}
            onClick={reveal}
          />
          <Show when={isRevealed()}>
            <Portal mount={document.querySelector('body')!}>
              <div class="modal-layout shadow">
                <h2>确认撤回吗？</h2>
                <button
                  class='mr-2'
                  onClick={() => {
                    ws()?.send('delete_msg', { message_id: props.item.message_id })
                    unreveal()
                    recallGroupStore(props.item)
                  }}
                >
                  Yes
                </button>
                <button onClick={unreveal}>No</button>
              </div>
            </Portal>
          </Show>
        </Show>
      </div>
      <MessageShown msg={props.item.message} isSelf={isSelf} />
    </div>
  )
}

export {
  GroupConvMessage,
}
