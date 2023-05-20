import type { Component } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import clsx from 'clsx'
import { Portal } from 'solid-js/web'
import { useStorage } from 'solidjs-use'
import { ListState } from '~/utils/list-state'
import { useConfirm } from '~/utils/hook/useConfirm'
import { initWs, setWs, ws } from '~/utils/ws/instance'
import { WsGetApi } from '~/utils/ws/ws'
import { WarningType, pushRightBottomMessage } from '~/utils/stores/lists'

const LeftSidebar: Component<{
  cls?: string
  state: ListState
  onListStateChange: (id: ListState) => void
}> = (props) => {
  const { isRevealed, reveal, unreveal } = useConfirm()
  const [el, setEl] = createSignal<HTMLInputElement>()
  const [sendByEnter, setSendByEnter] = useStorage('send-by-enter', false)
  const [wsUrl, setWsUrl] = useStorage('ws-url', 'ws://0.0.0.0:5700')
  return (
    <div class={clsx(props.cls, 'flex flex-col', 'border border-r-solid border-r-zinc/40')}>
      <div
        class={clsx(['text-1.5rem', 'i-teenyicons-message-text-alt-outline', 'cursor-pointer', 'm-3', props.state === ListState.Message && 'text-blue'])}
        title="最近消息"
        onClick={() => props.onListStateChange(ListState.Message)}
      />
      <div
        class={clsx(['text-1.5rem', 'i-teenyicons-user-circle-outline', 'cursor-pointer', 'm-3', props.state === ListState.Contact && 'text-blue'])}
        title="好友列表 双击刷新"
        onClick={() => props.onListStateChange(ListState.Contact)}
        onDblClick={() => {
          ws()?.get(WsGetApi.FriendList)
        }}
      />
      <div
        class={clsx(['text-1.5rem', 'i-teenyicons-users-outline', 'cursor-pointer', 'm-3', props.state === ListState.Groups && 'text-blue'])}
        title="群列表 双击刷新"
        onClick={() => props.onListStateChange(ListState.Groups)}
        onDblClick={() => {
          ws()?.get(WsGetApi.GroupList)
        }}
      />
      <div class='flex-1' />
      <div
        class={clsx('text-1.5rem', 'i-teenyicons-link-outline', 'm-3', 'cursor-pointer', ws() && 'text-blue')}
        title="连接"
        onClick={() => {
          if (!ws())
            initWs(wsUrl())
        }}
      />
      <div
        class={clsx('text-1.5rem', 'i-teenyicons-link-remove-outline', 'm-3', 'cursor-pointer')}
        title="断开"
        onClick={() => {
          ws()?.close()
          setWs(undefined)
        }}
      />
      <div
        class={clsx('text-1.5rem', 'i-teenyicons-cog-outline', 'm-3', 'cursor-pointer')}
        title="设置"
        onClick={reveal}
      />
      <Show when={isRevealed()}>
        <Portal mount={document.querySelector('body')!}>
          <div class="modal-layout shadow space-y-2">
            <div class="space-x-2">
              <span>ws 链接</span>
              <input
                ref={setEl}
                value={wsUrl()}
                class={clsx('w-200px leading-loose', 'outline-none', 'border border-(solid zinc/40)', 'rounded')}
              />
            </div>
            <div class="space-x-2">
              <label>
                <input
                  type="checkbox"
                  checked={sendByEnter()}
                  onChange={e => setSendByEnter((e.target as HTMLInputElement).checked)}
                />{sendByEnter() ? 'Enter 发送' : 'Ctrl + Enter 发送'}
              </label>
            </div>
            <div class="space-x-2">
              <button
                onClick={() => {
                  setWsUrl(el()!.value)
                  pushRightBottomMessage({ type: WarningType.Info, msg: '若 WS 链接被更改，请点击左下角断开并重连', ttl: 3000 })
                  unreveal()
                }}
              >
                OK
              </button>
              <button onClick={unreveal}>
                Cancel
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

export {
  LeftSidebar,
}
