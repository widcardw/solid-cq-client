import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Show, createMemo, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
// import { useMagicKeys, whenever } from 'solidjs-use'
import { MessageShown } from './MessageShown'
import type { ReceivedForwardedMessage, ReceivedForwardedOneMessage } from '~/utils/api/received-msg-types'
import { isCqReceivedMessage } from '~/utils/api/received-msg-types'
import { forwardMap, setLastforwardId } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'
import type { CqReceivedMessage, MultiTypeReceivedMessage } from '~/utils/api/sent-message-type'

const RecordMessageShown: Component<{
  file: string
}> = (props) => {
  return (
    <>
      <div><a href={props.file}>语音消息</a></div>
      <audio src={props.file} autoplay={false} controls crossorigin="use-credentials" />
    </>
  )
}

const VideoMessageShown: Component<{
  url: string
}> = (props) => {
  return (
    <>
      <div><a href={props.url} target='_blank'>视频消息</a></div>
      <video autoplay={false} controls width="200px">
        <source src={props.url} type="video/mp4" />
      </video>
    </>
  )
}

const RecursionForwardedMessageShown: Component<{
  msgs: ReceivedForwardedOneMessage[]
}> = (props) => {
  return (
    <div class={clsx('ml-4', 'space-y-2')}>
      <For each={props.msgs}>
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        {m => <ForwardedOneMessageShown msg={m} />}
      </For>
    </div>
  )
}

const RawMessageShown: Component<{
  msg: MultiTypeReceivedMessage
}> = (props) => {
  const content = createMemo(() => {
    try {
      return JSON.stringify(props.msg, null, 2)
    }
    catch (e) {
      return props.msg.type
    }
  })
  return (
    <details>
      <summary>不支持的消息类型</summary>
      <div class={clsx('whitespace-pre-wrap', 'break-all')}>{content()}</div>
    </details>
  )
}

const ForwardedOneMessageShown: Component<{
  msg: ReceivedForwardedOneMessage
}> = (props) => {
  return (
    <div>
      <div class="text-purple-600">{props.msg.sender.nickname}</div>
      <Show
        when={isCqReceivedMessage(props.msg.content)}
        fallback={(
          <details>
            <summary>合并转发</summary>
            <RecursionForwardedMessageShown msgs={props.msg.content as ReceivedForwardedOneMessage[]} />
          </details>
        )}
      >
        <MessageShown msg={props.msg.content as CqReceivedMessage} />
      </Show>
    </div>
  )
}

const PortalForwardDetails: Component<{
  id: string
  setShow: (i: boolean) => any
}> = (props) => {
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
          'w-80vw', 'h-80vh',
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
        <Show
          when={forwardMap[props.id]}
          fallback={<>加载中……</>}
        >
          <For each={forwardMap[props.id]?.messages}>
            {m => <ForwardedOneMessageShown msg={m} />}
          </For>
        </Show>
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
  RawMessageShown,
  VideoMessageShown,
}
