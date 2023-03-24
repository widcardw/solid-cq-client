import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Match, Switch } from 'solid-js'
import { FriendConv } from './FriendConv'
import { GroupConv } from './GroupConv'
import type { Conversation as ConversationInterface, FriendConversation, GroupConversation } from '~/utils/stores/lists'
import { curConv, loading, setLoading, setSendEl } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'
import { MessageTarget } from '~/utils/ws/ws'
import { buildMsg } from '~/cq/build-msg'

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
          <div class={clsx('i-teenyicons-image-alt-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')} />
          <div class={clsx('i-teenyicons-text-document-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')} />
        </div>
        <textarea
          ref={setSendEl}
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
