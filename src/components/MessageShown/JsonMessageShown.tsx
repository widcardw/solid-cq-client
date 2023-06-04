import clsx from 'clsx'
import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import type { JsonMetaData } from '~/utils/api/received-msg-types'
import { transformLink } from '~/utils/hook/transformLink'

const JsonMessageShown: Component<{
  data: string
}> = (props) => {
  const jsonData = JSON.parse(props.data)
  const meta = jsonData.meta
  const metaKey = Object.keys(meta)[0]
  const metaData: JsonMetaData = meta[metaKey]
  const { desc, jumpUrl, preview, source_icon, tag, title } = metaData

  const [previewIcon, setPreviewIcon] = createSignal(preview)
  const [sourceIcon, setSourceIcon] = createSignal(source_icon)
  return (
    <div class="space-y-2">
      <a class={clsx('flex', 'space-x-2')} href={jumpUrl} target='_blank'>
        <img
          src={previewIcon()}
          height="56px" width="56px"
          style={{ 'object-fit': 'cover' }}
          onError={() => setPreviewIcon('/not-found.svg')}
        />
        <div>
          <div class="font-bold">{title}</div>
          <div>{desc}</div>
        </div>
      </a>
      <div class={clsx('flex', 'space-x-2', 'items-center')}>
        <img
          src={sourceIcon()}
          height="12px" width="12px"
          style={{ 'object-fit': 'cover' }}
          onError={() => setSourceIcon('/not-found.svg')}
        />
        <div class="text-12px">{tag}</div>
      </div>
      <details>
        <summary>
          JSON 卡片详情
        </summary>
        <div
          class={clsx('break-all', 'whitespace-pre-wrap')}
        >
          {transformLink(JSON.stringify(JSON.parse(props.data), null, 2))}
        </div>
      </details>
    </div>
  )
}

export {
  JsonMessageShown,
}
