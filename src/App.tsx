import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Match, Switch, createSignal, onCleanup } from 'solid-js'

import styles from './App.module.css'
import { ContactList } from './components/FriendList/FriendList'
import { Conversation } from './components/Conversation/Conversation'
import { GroupList } from './components/GroupList/GroupList'
import { LeftSidebar } from './components/LeftSideBar/LeftSidebar'
import { RecentMessage } from './components/RecentMessage/RecentMessage'
import { ListState } from './utils/list-state'
import { curConv, friendList, groupList, recentConv } from './utils/stores/lists'
import { ws } from './utils/ws/instance'

const [listState, setListState] = createSignal<ListState>(ListState.Message)
const App: Component = () => {
  onCleanup(() => {
    ws.close()
  })
  return (
    <div class={styles.App}>
      <LeftSidebar state={listState()} onListStateChange={setListState} />
      <div class={clsx(['w-250px', 'h-100vh', 'border border-l-solid border-r-solid border-l-gray border-r-gray'])}>
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
  )
}

export default App
