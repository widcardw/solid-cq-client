import type { Component } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import clsx from 'clsx'
import { Portal } from 'solid-js/web'
import { useStorage } from 'solidjs-use'
import { ListState } from '~/utils/list-state'
import { useConfirm } from '~/utils/hook/useConfirm'
import { initWs, setWs, ws } from '~/utils/ws/instance'

const LeftSidebar: Component<{
  cls?: string
  state: ListState
  onListStateChange: (id: ListState) => void
}> = (props) => {
  const { isRevealed, reveal, unreveal } = useConfirm()
  const [el, setEl] = createSignal<HTMLInputElement>()
  const [wsUrl, setWsUrl] = useStorage('ws-url', 'ws://0.0.0.0:5700')
  return (
    <div class={clsx(props.cls, 'flex flex-col')}>
      <div
        class={clsx(['i-teenyicons-message-text-alt-outline', 'cursor-pointer', 'm-4', props.state === ListState.Message && 'text-blue'])}
        title="最近消息"
        onClick={() => props.onListStateChange(ListState.Message)}
      />
      <div
        class={clsx(['i-teenyicons-user-circle-outline', 'cursor-pointer', 'm-4', props.state === ListState.Contact && 'text-blue'])}
        title="好友列表"
        onClick={() => props.onListStateChange(ListState.Contact)}
      />
      <div
        class={clsx(['i-teenyicons-users-outline', 'cursor-pointer', 'm-4', props.state === ListState.Groups && 'text-blue'])}
        title="群列表"
        onClick={() => props.onListStateChange(ListState.Groups)}
      />
      <div class='flex-1' />
      <div
        class={clsx('i-teenyicons-link-outline', 'm-4', 'cursor-pointer', ws() && 'text-blue')}
        title="连接"
        onClick={() => {
          if (!ws())
            initWs(wsUrl())
        }}
      />
      <div
        class={clsx('i-teenyicons-link-remove-outline', 'm-4', 'cursor-pointer')}
        title="断开"
        onClick={() => {
          ws()?.close()
          setWs(undefined)
        }}
      />
      <div
        class={clsx('i-teenyicons-cog-outline', 'm-4', 'cursor-pointer')}
        title="设置"
        onClick={reveal}
      />
      <Show when={isRevealed()}>
        <Portal mount={document.querySelector('body')!}>
          <div class="modal-layout shadow">
            <strong>ws 链接</strong>
            <div class="mt-1 mb-1">
              <input
                ref={setEl}
                value={wsUrl()}
                class={clsx('w-200px leading-loose', 'outline-none', 'border border-(solid zinc)', 'rounded')}
              />
            </div>
            <button
              class="mr-2"
              onClick={() => {
                setWsUrl(el()!.value)
                if (ws())
                  ws()?.close()
                initWs(wsUrl())
                unreveal()
              }}
            >OK
            </button>
            <button
              onClick={unreveal}
            >Cancel
            </button>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

export {
  LeftSidebar,
}
