import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Match, Show, Switch, createSignal } from 'solid-js'
import { useFileDialog } from 'solidjs-use'
import { FriendConv } from './FriendConv'
import { GroupConv } from './GroupConv'
import type { Conversation as ConversationInterface, FriendConversation, GroupConversation } from '~/utils/stores/lists'
import { curConv, loading, setLoading, setSendEl } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'
import { MessageTarget } from '~/utils/ws/ws'
import { buildMsg } from '~/cq/build-msg'
import type { SentMessage } from '~/utils/api/sent-message-type'
import { createFileMessage, createImageMessage } from '~/utils/api/sent-message-type'
import { u8tobase64 } from '~/utils/msg/transform-tex'

// const toBeSentMsg: SentMessage = []

// async function pasteEvent(e: ClipboardEvent & {
//   currentTarget: HTMLTextAreaElement
//   target: Element
// }) {
//   const clipboardData = e.clipboardData
//   if (!clipboardData)
//     return
//   const pasted = await Promise.all(Array.from(clipboardData.items).map((item) => {
//     if (item.kind !== 'file')
//       return Promise.resolve('')

//     if (!item.type.startsWith('image/'))
//       return Promise.resolve(`（暂不支持的文件类型：${item.type}）`)

//     return new Promise((resolve, reject) => {
//       const blob = item.getAsFile()
//       if (!blob)
//         return resolve('')
//       const url = URL.createObjectURL(blob)

//       const reader = new FileReader()
//       reader.onload = () => {
//         if (reader.result && typeof reader.result === 'string') {
//           const base64 = reader.result.split(',')[1]
//           const cqcode = `[CQ:image,file=base64://${ba se64}]`
//           const placeholder = `[粘贴的图片 ${url}]`
//           // pastedImageMappings.push({ placeholder, cqcode, url })
//           resolve(placeholder)
//         }
//       }
//       reader.onerror = reject
//       reader.readAsDataURL(blob)
//     })
//   }))
//   const text = pasted.join('')
// }

const Conversation: Component<{
  cls?: string
  conv?: ConversationInterface
}> = (props) => {
  const [showFile, setShowFile] = createSignal(false)
  const { files, open: openFileDlg, reset } = useFileDialog()
  return (
    <div class={clsx([props.cls, 'flex flex-col', 'h-100vh'])}>
      <div class={clsx(['flex flex-col', 'max-h-70vh', 'min-h-30vh'])}>
        <Switch>
          <Match when={props.conv?.type === MessageTarget.Private}>
            <FriendConv conv={props.conv as FriendConversation} />
          </Match>
          <Match when={props.conv?.type === MessageTarget.Group}>
            <GroupConv conv={props.conv as GroupConversation} />
          </Match>
        </Switch>
      </div>
      <div class={clsx(['flex flex-col', 'border border-t-solid border-t-zinc', 'flex-1'])}>
        <div class={clsx('flex', 'items-center', 'border border-b-(solid zinc/30)')}>
          <div
            class={clsx('i-teenyicons-image-alt-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')}
            onClick={() => {
              if (!curConv())
                return
              openFileDlg()
            }}
          />
          <div
            class={clsx('i-teenyicons-text-document-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')}
            title="macOS 使用 command + option + C 复制路径  Windows 使用 Shift + 右键复制路径"
            onClick={() => {
              if (curConv())
                setShowFile(p => !p)
            }}
          />
        </div>
        <Show when={showFile()}>
          <div class={clsx('flex')}>
            <input
              placeholder='此处放入文件的绝对路径 Ctrl + Enter 发送'
              class={clsx('w-full', 'leading-loose', 'outline-none', 'border-none', 'border border-b-(solid zinc/20)')}
              onKeyDown={(e) => {
                if (!(e.ctrlKey === true && e.code === 'Enter'))
                  return
                const path = (e.target as HTMLInputElement).value
                if (curConv()) {
                  ws()?.f(curConv()!.type, curConv()!.id, createFileMessage(path))
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>
        </Show>
        <Show when={files()?.length}>
          <div class={clsx('flex', 'border border-b-(solid zinc/20)')}>
            <For each={files() && Object.entries(files()!)}>
              {([, f]) => <span class='mr-2'>{f.name}</span>}
            </For>
            <span
              class={clsx('text-blue', 'underline', 'cursor-pointer')}
              onClick={async () => {
                if (!curConv())
                  return
                const fs = files()
                if (!fs)
                  return
                const msgList: SentMessage = []
                await Promise.all(Object.entries(fs).map(async ([, f]) => {
                  const bytes = new Uint8Array(await f.arrayBuffer())
                  const b64 = u8tobase64(bytes)
                  msgList.push(createImageMessage(b64))
                }))
                ws()?.m(curConv()!.type, curConv()!.id, msgList)
                reset()
              }}
            >Upload
            </span>
          </div>
        </Show>
        <textarea
          ref={r => setSendEl(r)}
          placeholder='Ctrl + Enter 发送文本'
          class={clsx([
            'border-none',
            'm-0 p-4',
            'flex-1',
            '!outline-none',
            'resize-none',
            'leading-loose',
            'disabled:op-50',
          ])}
          disabled={loading() || !curConv()}
          onKeyDown={async (e) => {
            if (!curConv())
              return
            if (!curConv()?.id)
              return
            if (!(e.ctrlKey === true && e.code === 'Enter'))
              return

            if (loading())
              return
            setLoading(true)

            if (curConv()?.type === MessageTarget.Private)
              ws()?.m(MessageTarget.Private, curConv()!.id, await buildMsg((e.target as HTMLTextAreaElement).value))
            else
              ws()?.m(MessageTarget.Group, curConv()!.id, await buildMsg((e.target as HTMLTextAreaElement).value))
          }}
        >
        </textarea>
      </div>
    </div>
  )
}

export {
  Conversation,
}
