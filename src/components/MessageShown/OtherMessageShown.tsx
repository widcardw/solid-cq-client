import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Show, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { MessageShown } from './MessageShown'
import type { ReceivedForwardedMessage, ReceivedForwardedOneMessage } from '~/utils/api/received-msg-types'
import { forwardMap, setLastforwardId } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'

const RecordMessageShown: Component<{
  file: string
}> = (props) => {
  return (
    <>
      语音消息
      <audio src={props.file} autoplay={false} />
    </>
  )
}

const ForwardedOneMessageShown: Component<{
  msg: ReceivedForwardedOneMessage
}> = (props) => {
  return (
    <div>
      <div class="text-purple-600">{props.msg.sender.nickname}</div>
      <MessageShown msg={props.msg.content} />
    </div>
  )
}

const PortalForwardDetails: Component<{
  id: string
  setShow: (i: boolean) => any
}> = (props) => {
  return (
    <div
      class={clsx('space-y-2',
        'absolute',
        'left-12', 'right-12', 'top-12', 'bottom-12',
        'z-3',
        'shadow',
        'rounded',
        'p-4',
        'of-y-auto',
      )}
      style={{
        background: 'var(--dlg-bg-color)',
      }}
    >
      <For each={forwardMap[props.id]?.messages}>
        {m => <ForwardedOneMessageShown msg={m} />}
      </For>
      <div
        class={clsx(clsx(
          'absolute', 'top-4 right-4',
          'i-teenyicons-x-solid',
          'text-2rem',
          'cursor-pointer',
          'hover:text-blue',
        ))}
        onClick={() => props.setShow(false)}
      />
    </div>
  )
}

const ForwardMessageFolded: Component<{
  id: string
  details?: ReceivedForwardedMessage
}> = (props) => {
  const [showDetails, setShowDetails] = createSignal(false)
  const viewDetailsHandler = () => {
    setLastforwardId(props.id)
    if (!forwardMap[props.id])
      ws()?.get('get_forward_msg', { message_id: props.id })
    setShowDetails(true)
  }
  return (
    <>
      <div
        class={clsx('text-blue', 'cursor-pointer', 'underline')}
        onClick={viewDetailsHandler}
      >
        合并转发消息
      </div>
      <Show when={showDetails()}>
        <Portal mount={document.querySelector('body')!}>
          <PortalForwardDetails
            id={props.id}
            setShow={setShowDetails}
          />
        </Portal>
      </Show>
    </>
  )
}

export {
  RecordMessageShown,
  ForwardMessageFolded,
}
