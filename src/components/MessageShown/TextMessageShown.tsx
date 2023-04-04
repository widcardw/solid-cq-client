import type { Component } from 'solid-js'

const TextMessageShown: Component<{
  text: string
}> = (props) => {
  return <>{props.text}</>
}

const AtMessageShown: Component<{
  qq: number
}> = (props) => {
  return <>@{props.qq}</>
}

const ReplyMessageShown: Component = () => {
  return <>[回复]</>
}

export {
  TextMessageShown,
  AtMessageShown,
  ReplyMessageShown,
}
