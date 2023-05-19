import type { Component } from 'solid-js'
import { transformLink } from '~/utils/hook/transformLink'

const TextMessageShown: Component<{
  text: string
}> = (props) => {
  return <span class="whitespace-pre-wrap">{transformLink(props.text)}</span>
}

const AtMessageShown: Component<{
  qq: number
}> = (props) => {
  return <>@{props.qq}</>
}

const ReplyMessageShown: Component<{
  id: number
}> = (props) => {
  return <a href={`#${props.id}`}>[回复]</a>
}

const FaceMessageShown: Component<{
  id: number
}> = (props) => {
  return <>[表情 {props.id}]</>
}

export {
  TextMessageShown,
  AtMessageShown,
  ReplyMessageShown,
  FaceMessageShown,
}
