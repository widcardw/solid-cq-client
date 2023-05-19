import clsx from 'clsx'
import type { Component } from 'solid-js'
import { transformLink } from '~/utils/hook/transformLink'

const JsonMessageShown: Component<{
  data: string
}> = (props) => {
  return (
    <details>
      <summary>
        JSON 卡片
      </summary>
      <div
        class={clsx('break-all', 'whitespace-pre-wrap')}
      >
        {transformLink(JSON.stringify(JSON.parse(props.data), null, 2))}
      </div>
    </details>
  )
}

export {
  JsonMessageShown,
}
