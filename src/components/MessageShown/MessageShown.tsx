import type { Component } from 'solid-js'
import { For, Match, Show, Switch, createMemo } from 'solid-js'
import { unAccessor } from 'solidjs-use'
import { AtMessageShown, FaceMessageShown, ReplyMessageShown, TextMessageShown } from './TextMessageShown'
import { ImageMessageShown } from './ImageMessageShown'
import { JsonMessageShown } from './JsonMessageShown'
import { ForwardMessageFolded, RawMessageShown, RecordMessageShown, VideoMessageShown } from './OtherMessageShown'
import { FileMessageShown } from './FileMessageShown'
import type { CqAtMessage, CqFaceMessage, CqFileMessage, CqForwardMessage, CqImageMessage, CqJsonCardMessage, CqReceivedMessage, CqRecordMessage, CqReplyMessage, CqTextMessage, CqVideoMessage, MultiTypeReceivedMessage } from '~/utils/api/sent-message-type'

const OnePieceOfMessage: Component<{
  msg: MultiTypeReceivedMessage
}> = (props) => {
  const isSupported = createMemo(() => ['text', 'at', 'reply', 'image', 'json', 'face', 'record', 'forward', 'file', 'video'].includes(props.msg.type))
  if (!isSupported())
    console.warn('Not a valid message type. ', unAccessor(props.msg))

  return (
    <Show
      when={isSupported()}
      fallback={<RawMessageShown msg={props.msg} />}
    >
      <Switch>
        <Match when={props.msg.type === 'text'}>
          <TextMessageShown text={(props.msg as CqTextMessage).data.text} />
        </Match>
        <Match when={props.msg.type === 'at'}>
          <AtMessageShown qq={(props.msg as CqAtMessage).data.qq} />
        </Match>
        <Match when={props.msg.type === 'reply'}>
          <ReplyMessageShown id={(props.msg as CqReplyMessage).data.id} />
        </Match>
        <Match when={props.msg.type === 'face'}>
          <FaceMessageShown id={(props.msg as CqFaceMessage).data.id} />
        </Match>
        <Match when={props.msg.type === 'image'}>
          <ImageMessageShown url={(props.msg as CqImageMessage).data.url!} />
        </Match>
        <Match when={props.msg.type === 'json'}>
          <JsonMessageShown data={(props.msg as CqJsonCardMessage).data.data} />
        </Match>
        <Match when={props.msg.type === 'record'}>
          <RecordMessageShown file={(props.msg as CqRecordMessage).data.url} />
        </Match>
        <Match when={props.msg.type === 'forward'}>
          <ForwardMessageFolded id={(props.msg as CqForwardMessage).data.id} details={(props.msg as CqForwardMessage).details} />
        </Match>
        <Match when={props.msg.type === 'file'}>
          <FileMessageShown file={(props.msg as CqFileMessage)} />
        </Match>
        <Match when={props.msg.type === 'video'}>
          <VideoMessageShown url={(props.msg as CqVideoMessage).data.url} />
        </Match>
      </Switch>
    </Show>
  )
}

const MessageShown: Component<{
  msg: CqReceivedMessage
}> = (props) => {
  return (
    <div class="relative">
      {/* 气泡前面的装饰性圆弧 */}
      <div class="absolute w-23px h-26px overflow-hidden">
        <div class="absolute left-9px top--18px w-44px h-42px border-rd-50% bg-#333" />
        <div class="absolute left-4px top--48px w-60px h-60px border-rd-50%" style={{ background: 'var(--bg-color)' }} />
      </div>
      {/* 气泡主体 */}
      <div class="break-all mt-10px ml-20px px-16px py-10px border-rd-20px bg-#333 max-w-max">
        <Show
          when={Array.isArray(props.msg)}
          fallback={<OnePieceOfMessage msg={props.msg as MultiTypeReceivedMessage} />}
        >
          <For each={props.msg as MultiTypeReceivedMessage[]}>
            {m => <OnePieceOfMessage msg={m} />}
          </For>
        </Show>
      </div>
    </div>
  )
}

export {
  OnePieceOfMessage,
  MessageShown,
}
