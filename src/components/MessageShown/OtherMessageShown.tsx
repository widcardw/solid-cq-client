import type { Component } from 'solid-js'

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

export {
  RecordMessageShown,
}
