import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { transformLink } from '~/utils/hook/transformLink'
import { Conversation, curConv, groupMemberCard } from '~/utils/stores/lists'

const TextMessageShown: Component<{
  text: string
}> = (props) => {
  return <span class="whitespace-pre-wrap">{transformLink(props.text)}</span>
}

const AtMessageShown: Component<{
  qq: number
}> = (props) => {
  const groupId = curConv()?.id
  return <>@{(groupId && groupMemberCard[groupId]?.[props.qq]) || props.qq}</>
}

const ReplyMessageShown: Component<{
  id: number
}> = (props) => {
  return <a href={`#${props.id}`}>[回复]</a>
}

const FaceMessageShown: Component<{
  id: number
}> = (props) => {
  return (
    <Show when={props.id <= 221} fallback={`[表情${props.id}]`}>
      <img
        class={clsx('inline-flex', 'h-20px', 'vertical-mid')}
        src={`https://cdn.jsdelivr.net/gh/kyubotics/coolq-http-api@master/docs/qq-face/${props.id}.gif`}
        alt={`[表情${props.id}]`}
      />
    </Show>
  )
}

export {
  TextMessageShown,
  AtMessageShown,
  ReplyMessageShown,
  FaceMessageShown,
}
