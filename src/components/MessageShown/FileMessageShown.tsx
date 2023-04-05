import clsx from 'clsx'
import type { Component } from 'solid-js'
import { createMemo } from 'solid-js'
import type { CqFileMessage } from '~/utils/api/sent-message-type'
import { transformFileSize } from '~/utils/hook/fileSize'

const FileMessageShown: Component<{
  file: CqFileMessage
}> = (props) => {
  const size = createMemo(() => transformFileSize(props.file.data.size))
  return (
    <>
      <a
        referrerPolicy="no-referrer"
        href={props.file.data.file}
        download={props.file.data.name}
        class={clsx('text-blue')}
        target='_blank'
      >
        [文件] {props.file.data.name} {size()}
      </a>
    </>
  )
}

export {
  FileMessageShown,
}
