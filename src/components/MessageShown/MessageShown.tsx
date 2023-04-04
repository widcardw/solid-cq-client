import type { Component } from 'solid-js'
import { For, Match, Show, Switch } from 'solid-js'
import { unAccessor } from 'solidjs-use'
import { AtMessageShown, FaceMessageShown, ReplyMessageShown, TextMessageShown } from './TextMessageShown'
import { ImageMessageShown } from './ImageMessageShown'
import { JsonMessageShown } from './JsonMessageShown'
import { RecordMessageShown } from './OtherMessageShown'
import type { CqAtMessage, CqFaceMessage, CqImageMessage, CqJsonCardMessage, CqReceivedMessage, CqRecordMessage, CqTextMessage, MultiTypeReceivedMessage } from '~/utils/api/sent-message-type'

const OnePieceOfMessage: Component<{
  msg: MultiTypeReceivedMessage
}> = (props) => {
  if (!['text', 'at', 'reply', 'image', 'json', 'face', 'record'].includes(props.msg.type))
    console.warn('Not a valid message type. ', unAccessor(props.msg))

  return (
    <Switch>
      <Match when={props.msg.type === 'text'}>
        <TextMessageShown text={(props.msg as CqTextMessage).data.text} />
      </Match>
      <Match when={props.msg.type === 'at'}>
        <AtMessageShown qq={(props.msg as CqAtMessage).data.qq} />
      </Match>
      <Match when={props.msg.type === 'reply'}>
        <ReplyMessageShown />
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
        <RecordMessageShown file={(props.msg as CqRecordMessage).data.file} />
      </Match>
    </Switch>
  )
}

const MessageShown: Component<{
  msg: CqReceivedMessage
}> = (props) => {
  return (
    <div class="break-all">
      <Show
        when={Array.isArray(props.msg)}
        fallback={<OnePieceOfMessage msg={props.msg as MultiTypeReceivedMessage} />}
      >
        <For each={props.msg as MultiTypeReceivedMessage[]}>
          {m => <OnePieceOfMessage msg={m} />}
        </For>
      </Show>
    </div>
  )
}

export {
  OnePieceOfMessage,
  MessageShown,
}
