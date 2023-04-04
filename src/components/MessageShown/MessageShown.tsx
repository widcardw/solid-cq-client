import type { Component } from 'solid-js'
import { For, Match, Show, Switch } from 'solid-js'
import { AtMessageShown, ReplyMessageShown, TextMessageShown } from './TextMessageShown'
import { ImageMessageShown } from './ImageMessageShown'
import { JsonMessageShown } from './JsonMessageShown'
import type { CqAtMessage, CqImageMessage, CqJsonCardMessage, CqReceivedMessage, CqTextMessage, MultiTypeReceivedMessage } from '~/utils/api/sent-message-type'

const OnePieceOfMessage: Component<{
  msg: MultiTypeReceivedMessage
}> = (props) => {
  if (!['text', 'at', 'reply', 'image', 'json'].includes(props.msg.type))
    console.warn('Not a valid message type. ', props.msg)

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
      <Match when={props.msg.type === 'image'}>
        <ImageMessageShown url={(props.msg as CqImageMessage).data.url!} />
      </Match>
      <Match when={props.msg.type === 'json'}>
        <JsonMessageShown data={(props.msg as CqJsonCardMessage).data.data} />
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
  MessageShown,
}
