import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import type { ReceivedPrivateMessage } from '~/utils/api/received-msg-types'
import { useConfirm } from '~/utils/hook/useConfirm'
import { transformReceived } from '~/utils/msg/received-msg-transformer'
import { sendEl } from '~/utils/stores/lists'
import { recallFriendStore } from '~/utils/stores/store'
import { ws } from '~/utils/ws/instance'

const FriendConvMessage: Component<{
  item: ReceivedPrivateMessage
}> = (props) => {
  const { reveal, unreveal, isRevealed } = useConfirm()
  return (
    <div class={clsx('m-2', 'one-msg')}>
      <div class="flex items-center space-x-2">
        <div class={clsx(
          props.item.self_id === props.item.sender.user_id ? 'text-green-6' : 'text-blue-6',
        )}
        >{props.item.sender.nickname} {props.item.deleted && '[已撤回]'}
        </div>
        <div
          class={clsx('i-teenyicons-attach-outline', 'cursor-pointer', 'hover:text-blue', 'icon')}
          onClick={() => {
            // template string concatenate may conflict with unocss
            // eslint-disable-next-line prefer-template
            sendEl()!.value = '[CQ:reply,id=' + props.item.message_id + ']' + sendEl()!.value
          }}
        />
        <Show when={props.item.self_id === props.item.sender.user_id && !props.item.deleted}>
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
                    recallFriendStore(props.item)
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
      <div innerHTML={transformReceived(props.item.message)} />
    </div>
  )
}

export {
  FriendConvMessage,
}
