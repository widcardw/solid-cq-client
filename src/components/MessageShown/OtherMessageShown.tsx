import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Show, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
// import { useMagicKeys, whenever } from 'solidjs-use'
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
  // const { escape } = useMagicKeys()
  // whenever(escape, () => {
  //   props.setShow(false)
  // })
  return (
    <div
      class={clsx(
        'absolute',
        'left-0', 'right-0', 'top-0', 'bottom-0',
        'z-3',
        'rounded',
        'bg-zinc-800/70',
        'flex', 'items-center', 'justify-center',
      )}
    >
      <div
        class={clsx(
          'max-w-80vw', 'max-h-90vh',
          'p-4', 'rounded',
          'of-y-auto',
          'space-y-2',
        )}
        style={{
          background: 'var(--dlg-bg-color)',
        }}
      >
        <div class={clsx(
          'flex', 'justify-between',
          'mb-4',
        )}
        >
          <div>合并转发消息</div>
          <div
            class={clsx(clsx(
              'i-teenyicons-x-solid',
              'cursor-pointer',
              'hover:text-blue',
            ))}
            onClick={() => props.setShow(false)}
          />
        </div>
        <For each={forwardMap[props.id]?.messages}>
          {m => <ForwardedOneMessageShown msg={m} />}
        </For>
      </div>
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
