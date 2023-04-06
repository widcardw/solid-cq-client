import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Match, Show, Switch, createSignal } from 'solid-js'
import { onStartTyping, useFileDialog } from 'solidjs-use'
import { FriendConv } from './FriendConv'
import { GroupConv } from './GroupConv'
import type { Conversation as ConversationInterface, FriendConversation, GroupConversation } from '~/utils/stores/lists'
import { curConv, loading, sendEl, setLoading, setSendEl } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'
import { MessageTarget } from '~/utils/ws/ws'
import { buildMsg } from '~/cq/build-msg'
import type { CqImageMessage, CqSentMessage } from '~/utils/api/sent-message-type'
import { createFileMessage, createImageMessage } from '~/utils/api/sent-message-type'
import { u8tobase64 } from '~/utils/msg/transform-tex'

type InputElKeyboardEvent = KeyboardEvent & {
  currentTarget: HTMLInputElement
  target: Element
}

type TextareaElKeyboardEvent = KeyboardEvent & {
  currentTarget: HTMLTextAreaElement
  target: Element
}

type TextareaElClipboardEvent = ClipboardEvent & {
  currentTarget: HTMLTextAreaElement
  target: Element
}

const Conversation: Component<{
  cls?: string
  conv?: ConversationInterface
}> = (props) => {
  const [showFile, setShowFile] = createSignal(false)
  const { files, open: openFileDlg, reset } = useFileDialog()
  const [pastedImgs, setPastedImgs] = createSignal<CqImageMessage[]>([])
  onStartTyping(() => {
    sendEl()?.focus()
  })

  const openImageSelector = () => {
    if (curConv())
      openFileDlg()
  }

  const toggleFilePathInput = () => {
    if (curConv())
      setShowFile(p => !p)
  }

  const uploadImageHandler = async () => {
    const curConvInstance = curConv()
    if (!curConvInstance)
      return
    const fs = files()
    if (!fs)
      return
    const msgList: CqSentMessage = []
    await Promise.all(Array.from(fs).map(async (f) => {
      const bytes = new Uint8Array(await f.arrayBuffer())
      const b64 = u8tobase64(bytes)
      msgList.push(createImageMessage(b64))
    }))
    ws()?.m(curConvInstance.type, curConvInstance.id, msgList)
    reset()
  }

  const uploadPastedImgsHandler = () => {
    const curConvInstance = curConv()
    if (!curConvInstance)
      return
    ws()?.m(curConvInstance.type, curConvInstance.id, pastedImgs())
    setPastedImgs([])
  }

  const uploadFileHandler = async (e: InputElKeyboardEvent) => {
    if (!(e.ctrlKey === true && e.code === 'Enter'))
      return
    const path = (e.target as HTMLInputElement).value
    const curConvInstance = curConv()
    if (!curConvInstance)
      return
    ws()?.f(curConvInstance.type, curConvInstance.id, createFileMessage(path))
    ;(e.target as HTMLInputElement).value = ''
  }

  const sendMessageHandler = async (e: TextareaElKeyboardEvent) => {
    const curConvInstance = curConv()
    if (!curConvInstance)
      return
    if (!(e.ctrlKey === true && e.code === 'Enter'))
      return

    // If there is any pasted images, then send them first
    if (pastedImgs().length > 0) {
      uploadPastedImgsHandler()
      return
    }

    // Do not send empty message
    if ((e.target as HTMLTextAreaElement).value.trim() === '')
      return

    if (loading())
      return
    setLoading(true)

    const msgContent = await buildMsg((e.target as HTMLTextAreaElement).value)
    console.log('sent', msgContent)

    ws()?.m(curConvInstance.type, curConvInstance.id, msgContent)
  }

  const pasteImageHandler = async (e: TextareaElClipboardEvent) => {
    if (!curConv())
      return
    const clipboardData = e.clipboardData
    if (!clipboardData)
      return
    const pasted = await Promise.all(Array.from(clipboardData.items).map((item) => {
      if (item.kind !== 'file')
        return Promise.resolve('')
      if (!item.type.startsWith('image/'))
        return Promise.resolve(`暂不支持粘贴的文件类型: ${item.type}，请通过文件接口发送`)
      return new Promise((resolve, reject) => {
        const blob = item.getAsFile()
        if (!blob)
          return resolve('')
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result && typeof reader.result === 'string') {
            // eslint-disable-next-line prefer-template
            const b64 = 'base64://' + reader.result.split(',')[1]
            setPastedImgs(p => [...p, createImageMessage(b64)])
            resolve('')
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }))
    const el = sendEl()
    if (el)
      el.value += pasted.join('\n')
  }

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
      <div class={clsx(['flex flex-col', 'border border-t-solid border-t-zinc/40', 'flex-1'])}>
        <div class={clsx('flex', 'items-center', 'border border-b-(solid zinc/20)')}>
          <div
            class={clsx('i-teenyicons-image-alt-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')}
            onClick={openImageSelector}
          />
          <div
            class={clsx('i-teenyicons-text-document-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')}
            title="macOS 使用 command + option + C 复制路径  Windows 使用 Shift + 右键复制路径"
            onClick={toggleFilePathInput}
          />
        </div>
        <Show when={showFile()}>
          <div class={clsx('flex')}>
            <input
              placeholder='此处放入文件的绝对路径 Ctrl + Enter 发送'
              class={clsx('w-full', 'leading-loose', 'outline-none', 'border-none', 'border border-b-(solid zinc/20)')}
              onKeyDown={uploadFileHandler}
            />
          </div>
        </Show>
        <Show when={files()?.length}>
          <div class={clsx('border border-b-(solid zinc/20)', 'break-all')}>
            <For each={files() && Array.from(files()!)}>
              {f => <span class='mr-2'>{f.name}</span>}
            </For>
            <span
              class={clsx('text-blue', 'underline', 'cursor-pointer', 'mr-2')}
              onClick={uploadImageHandler}
            >
              Upload
            </span>
            <span
              class={clsx('text-red', 'underline', 'cursor-pointer')}
              onClick={reset}
            >
              Cancel
            </span>
          </div>
        </Show>
        <Show when={pastedImgs().length}>
          <div class={clsx('border border-b-(solid zinc/20)', 'break-all')}>
            <span class="mr-2">Pasted {pastedImgs().length} images</span>
            <span
              class={clsx('text-blue', 'underline', 'cursor-pointer', 'mr-2')}
              onClick={uploadPastedImgsHandler}
            >
              Upload
            </span>
            <span
              class={clsx('text-red', 'underline', 'cursor-pointer')}
              onClick={reset}
            >
              Cancel
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
          onKeyDown={sendMessageHandler}
          onPaste={pasteImageHandler}
        />
      </div>
    </div>
  )
}

export {
  Conversation,
}
