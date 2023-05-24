import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Match, Show, Switch, createEffect, createSignal, untrack } from 'solid-js'
import { onStartTyping, useDebounceFn, useFileDialog, useMagicKeys, useStorage } from 'solidjs-use'
import { Portal } from 'solid-js/web'
import { FriendConv } from './FriendConv'
import { GroupConv } from './GroupConv'
import type { Conversation as ConversationInterface, FriendConversation, GroupConversation } from '~/utils/stores/lists'
import { WarningType, curConv, pushRightBottomMessage, sendEl, setSendEl } from '~/utils/stores/lists'
import { ws } from '~/utils/ws/instance'
import { MessageTarget } from '~/utils/ws/ws'
import { buildMsg } from '~/cq/build-msg'
import type { CqImageMessage, CqSentMessage } from '~/utils/api/sent-message-type'
import { createFileMessage, createImageMessage } from '~/utils/api/sent-message-type'
import { msgContentToSvg, renderMath, u8tobase64 } from '~/utils/msg/transform-tex'
import { useResizer } from '~/utils/hook/useResizer'
import { convLoading, setConvLoading, setShowTexPreview, showTexPreview } from '~/utils/stores/semaphore'
import { useConfirm } from '~/utils/hook/useConfirm'
import { cqFaceBaseUrl, cqFaceIds } from '~/utils/api/cq-face-ids'
import { transformCode } from '~/utils/msg/transform-code'

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
  const [sendByEnter] = useStorage('send-by-enter', false)
  const [enableTransformTex, setEnableTransformTex] = useStorage('transform-tex', true)
  const [enableTransformCode, setEnableTransformCode] = useStorage('transform-code', true)
  // const [showTexPreview, setShowTexPreview] = createSignal(false)
  const [preview, setPreview] = createSignal('')

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
    if (e.isComposing)
      return
    if (sendByEnter()) {
      if (e.code !== 'Enter')
        return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return
    }
    else {
      if (!(e.ctrlKey === true && e.code === 'Enter'))
        return
    }
    const path = (e.target as HTMLInputElement).value
    const curConvInstance = curConv()
    if (!curConvInstance)
      return
    ws()?.f(curConvInstance.type, curConvInstance.id, createFileMessage(path))
    ;(e.target as HTMLInputElement).value = ''
    pushRightBottomMessage({ type: WarningType.Info, msg: '文件已发送', ttl: 3000 })
  }

  const sendMessageHandler = async (e: TextareaElKeyboardEvent) => {
    if (e.isComposing)
      return
    const curConvInstance = curConv()
    if (!curConvInstance)
      return

    if (sendByEnter()) {
      if (e.code !== 'Enter')
        return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return
    }
    else {
      if (!(e.ctrlKey === true && e.code === 'Enter'))
        return
    }

    // If there is any pasted images, then send them first
    if (pastedImgs().length > 0) {
      uploadPastedImgsHandler()
      return
    }

    // Do not send empty message
    if ((e.target as HTMLTextAreaElement).value.trim() === '')
      return

    if (convLoading())
      return
    setConvLoading(true)

    ws()?.m(curConvInstance.type, curConvInstance.id, await buildMsg((e.target as HTMLTextAreaElement).value, {
      enableTransformTex: enableTransformTex(),
      enableTransformCode: enableTransformCode(),
    }))

    // setShowTexPreview(false)
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

  const { size: inputFieldHeight, onResize: handleInputFieldResize } = useResizer()

  const { isRevealed, reveal, unreveal } = useConfirm()

  const { escape } = useMagicKeys()

  createEffect(() => {
    if (isRevealed() && escape())
      unreveal()
  })

  const debouncedPreviewTex = useDebounceFn(async () => {
    const el = sendEl()
    if (!el || pastedImgs().length > 0) {
      setShowTexPreview(false)
      setPreview('')
      return
    }
    if (enableTransformTex() && (el.value.startsWith('/tex') || el.value.startsWith('/am'))) {
      setShowTexPreview(true)
      setPreview(msgContentToSvg(el.value))
    }
    else if (enableTransformCode() && el.value.startsWith('```') && el.value.trimEnd().endsWith('```')) {
      setShowTexPreview(true)
      const match = el.value.trim().match(/^```(\w*)\n([\s\S]+)\n```$/)
      if (match) {
        const [_, lang, code] = match
        setPreview(await transformCode(code, lang))
      }
    }
    else {
      setShowTexPreview(false)
      setPreview('')
    }
  }, 800)

  return (
    <div class={clsx([props.cls, 'flex flex-col justify-between', 'h-100vh'])}>
      <div class={clsx(['flex flex-col flex-1', 'of-y-auto', 'min-h-30vh'])}>
        <Switch>
          <Match when={props.conv?.type === MessageTarget.Private}>
            <FriendConv conv={props.conv as FriendConversation} />
          </Match>
          <Match when={props.conv?.type === MessageTarget.Group}>
            <GroupConv conv={props.conv as GroupConversation} />
          </Match>
        </Switch>
      </div>
      <div
        class={clsx('flex flex-col flex-grow-0', 'border border-t-solid border-t-zinc/40', 'relative')}
        style={{ height: `${inputFieldHeight()}px` }}
      >
        <div
          class={clsx('h-1', 'cursor-row-resize', 'absolute', 'w-full', 'hover:bg-blue', 'translate-y--0.5', 'transition-colors')}
          onMouseDown={handleInputFieldResize}
        />
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
          <div
            class={clsx('i-teenyicons-mood-smile-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')}
            title="表情"
            onClick={() => curConv() && reveal()}
          />
          <div
            class={clsx('mx-2', 'cursor-pointer', { 'text-blue': enableTransformTex() })}
            title="自动转换 /tex 和 /am 公式"
            onClick={() => setEnableTransformTex(p => !p)}
          >
            <div innerHTML={renderMath(String.raw`\TeX`)} />
          </div>
          <div
            class={clsx('i-teenyicons-code-outline', 'm-2', 'cursor-pointer', 'hover:text-blue', { 'text-blue': enableTransformCode() })}
            title="自动转换代码"
            onClick={() => setEnableTransformCode(p => !p)}
          />
          <div class="flex-1" />
          <div
            class={clsx('i-teenyicons-refresh-alt-outline', 'm-2', 'cursor-pointer', 'hover:text-blue')}
            title="修复消息发送锁死"
            onClick={() => curConv() && setConvLoading(false)}
          />
        </div>
        {/* 文件发送 */}
        <Show when={showFile()}>
          <div class={clsx('flex')}>
            <input
              placeholder={`此处放入文件的绝对路径 ${sendByEnter() ? '' : 'Ctrl + '}Enter 发送`}
              class={clsx('w-full', 'leading-loose', 'outline-none', 'border-none', 'border border-b-(solid zinc/20)')}
              onKeyDown={uploadFileHandler}
            />
          </div>
        </Show>
        {/* 图片发送 */}
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
        {/* 粘贴图片 */}
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
              onClick={() => setPastedImgs([])}
            >
              Cancel
            </span>
          </div>
        </Show>
        <Show when={isRevealed()}>
          <Portal>
            <div class={clsx('modal-layout shadow space-y-2')}>
              <div
                class={clsx('absolute', 'top-2 right-2', 'i-teenyicons-x-solid', 'cursor-pointer', 'hover:text-blue')}
                onClick={unreveal}
              />
              <div class={clsx('grid', 'grid-cols-10', 'max-h-400px', 'of-y-auto')}>
                <For each={cqFaceIds}>
                  {id => (
                    <img
                      src={`${cqFaceBaseUrl + id}.gif`}
                      class={clsx('h-24px', 'm-2', 'cursor-pointer')}
                      onClick={() => {
                        const el = sendEl()
                        if (el)
                          el.value = `${el.value.slice(0, el.selectionStart)}[CQ:face,id=${id}]${el.value.slice(el.selectionEnd)}`
                      }}
                    />
                  )}
                </For>
              </div>
            </div>
          </Portal>
        </Show>
        {/* 输入框 */}
        <div class={clsx('flex-1', 'flex', 'relative')}>
          <textarea
            ref={r => setSendEl(r)}
            placeholder={`${!sendByEnter() ? 'Ctrl + ' : ''}Enter 发送文本`}
            class={clsx([
              'border-none',
              'm-0 p-4',
              'flex-1',
              '!outline-none',
              'resize-none',
              'leading-loose',
              'disabled:op-50',
            ])}
            disabled={ws() === undefined || convLoading() || !curConv()}
            onKeyDown={sendMessageHandler}
            onPaste={pasteImageHandler}
            onInput={debouncedPreviewTex}
            autofocus={true}
          />
          <Show when={showTexPreview() && preview().trim()}>
            <div
              class={clsx('absolute', 'of-hidden', 'translate-y--100% translate-x-4', 'p-2', 'shadow', 'rounded', 'max-w-80vw')}
              innerHTML={preview()}
              style={{ background: 'var(--bg-color)' }}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}

export {
  Conversation,
}
