import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Match, Switch, createSignal } from 'solid-js'
import type { JsonMetaData, MiniAppData } from '~/utils/api/received-msg-types'
import { transformLink } from '~/utils/hook/transformLink'

const StructMsgJsonCard: Component<JsonMetaData> = (props) => {
  const { desc, jumpUrl, preview, source_icon, tag, title } = props

  const [previewIcon, setPreviewIcon] = createSignal(preview)
  const [sourceIcon, setSourceIcon] = createSignal(source_icon)
  return (
    <>
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
    </>
  )
}

const MiniAppJsonCard: Component<MiniAppData> = (props) => {
  const { preview, icon: source_icon, title: tag, qqdocurl: jumpUrl, desc: title } = props
  const [previewIcon, setPreviewIcon] = createSignal(`https://${preview}`)
  const [sourceIcon, setSourceIcon] = createSignal(source_icon)

  return (
    <>
      <div class={clsx('flex', 'space-x-2', 'items-center')}>
        <img
          src={sourceIcon()}
          height="12px" width="12px"
          style={{ 'object-fit': 'cover' }}
          onError={() => setSourceIcon('/not-found.svg')}
        />
        <div class="text-12px">[小程序] {tag}</div>
      </div>
      <a href={jumpUrl} target="_blank">
        <div class="text-bold">{title}</div>
        <img
          src={previewIcon()}
          referrerPolicy='no-referrer'
          onError={() => setPreviewIcon('/not-found.svg')}
          class={clsx('max-w-200px')}
        />
      </a>
    </>
  )
}

const JsonMessageShown: Component<{
  data: string
}> = (props) => {
  const jsonData = JSON.parse(props.data)
  const meta = jsonData.meta
  const metaKey = Object.keys(meta)[0]
  const metaData = meta[metaKey]

  const app: string = jsonData.app

  return (
    <div class="space-y-2">
      <Switch fallback="暂不支持的卡片类型">
        <Match when={app.startsWith('com.tencent.structmsg')}>
          <StructMsgJsonCard {...metaData} />
        </Match>
        <Match when={app.startsWith('com.tencent.miniapp')}>
          <MiniAppJsonCard {...metaData} />
        </Match>
      </Switch>
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
