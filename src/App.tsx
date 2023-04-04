import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Match, Show, Switch, createSignal, onCleanup } from 'solid-js'

import { Portal } from 'solid-js/web'
import styles from './App.module.css'
import { ContactList } from './components/FriendList/FriendList'
import { Conversation } from './components/Conversation/Conversation'
import { GroupList } from './components/GroupList/GroupList'
import { LeftSidebar } from './components/LeftSideBar/LeftSidebar'
import { RecentMessage } from './components/RecentMessage/RecentMessage'
import { ListState } from './utils/list-state'
import { curConv, friendList, groupList, recentConv, setWarnings, warnings } from './utils/stores/lists'
import { ws } from './utils/ws/instance'

const [listState, setListState] = createSignal<ListState>(ListState.Message)
const App: Component = () => {
  onCleanup(() => {
    ws()?.close()
  })
  return (
    <>
      <div class={styles.App}>
        <LeftSidebar state={listState()} onListStateChange={setListState} />
        <div class={clsx(['w-250px', 'h-100vh', 'border border-l-solid border-r-solid border-l-zinc/40 border-r-zinc/40'])}>
          <Switch>
            <Match when={listState() === ListState.Message}>
              <RecentMessage list={recentConv()} />
            </Match>
            <Match when={listState() === ListState.Contact}>
              <ContactList list={friendList()} />
            </Match>
            <Match when={listState() === ListState.Groups}>
              <GroupList list={groupList()} />
            </Match>
          </Switch>
        </div>
        <Conversation cls={clsx(['flex-1', 'h-100vh'])} conv={curConv()} />
      </div>
      <Show when={warnings().length}>
        <Portal mount={document.querySelector('body')!}>
          <div class={clsx('absolute', 'right-8 bottom-2', 'mb-2 mr-2', 'max-w-200px')}>
            <For each={warnings()}>
              {(warning, i) => (
                <div
                  class={clsx('p-2', 'm-2', 'flex', 'space-x-2', 'w-full', 'shadow', 'items-center')}
                  style={{
                    background: 'var(--dlg-bg-color)',
                  }}
                >
                  <div>{warning.type}</div>
                  <div>{warning.msg}</div>
                  <div class='flex-1' />
                  <div
                    class={clsx('i-teenyicons-x-small-outline', 'hover:text-blue', 'cursor-pointer')}
                    onClick={() => {
                      setWarnings(p => [...p.slice(0, i()), ...p.slice(i() + 1)])
                    }}
                  />
                </div>
              )}
            </For>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default App
