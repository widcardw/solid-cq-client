import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { cqFaceBaseUrl, cqFaceIdSet } from '~/utils/api/cq-face-ids'
import { transformLink } from '~/utils/hook/transformLink'
import { curConv, groupMemberCard } from '~/utils/stores/lists'

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
  id: string
}> = (props) => {
  return (
    <>
      <Show when={cqFaceIdSet.has(Number(props.id))} fallback={`[表情 ${props.id}]`}>
        <img
          class={clsx('inline-flex', 'h-20px', 'vertical-mid')}
          src={`${cqFaceBaseUrl}${props.id}.gif`}
          alt={`[表情${props.id}]`}
        />
      </Show>
    </>
  )
}

export {
  TextMessageShown,
  AtMessageShown,
  ReplyMessageShown,
  FaceMessageShown,
}
