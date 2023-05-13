import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Match, Show, Switch, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStorage } from 'solidjs-use'
import { OneFriend } from '../Listed/OneFriend'
import { OneGroup } from '../Listed/OneGroup'
import type { FriendType } from '~/utils/api/friend-type'
import { isFriendType } from '~/utils/api/friend-type'
import type { GroupType } from '~/utils/api/group-type'
import { isGroupType } from '~/utils/api/group-type'
import { setFriendConvStore, setGroupConvStore, setRecentCov } from '~/utils/stores/lists'

const [removeConvCache, setRemoveConvCache] = useStorage('remove-conv-cache', false)

function removeFriendRecentConversation(id: number) {
  setRecentCov(p => p.filter((i) => {
    if (isFriendType(i))
      return i.user_id !== id
    return true
  }))

  removeConvCache() && setFriendConvStore(p => p.filter(i => i.id !== id))
}

function removeGroupRecentConversation(id: number) {
  setRecentCov(p => p.filter((i) => {
    if (isGroupType(i))
      return i.group_id !== id
    return true
  }))

  removeConvCache() && setGroupConvStore(p => p.filter(i => i.id !== id))
}

const Item: Component<{
  i: FriendType | GroupType
}> = (props) => {
  const remove = () => {
    if (isFriendType(props.i))
      removeFriendRecentConversation(props.i.user_id)

    else if (isGroupType(props.i))
      removeGroupRecentConversation(props.i.group_id)
  }

  const [removeDlg, setRemoveDlg] = createSignal(false)
  return (
    <div
      onContextMenu={() => setRemoveDlg(true)}
    >
      <Switch>
        <Match when={isFriendType(props.i)}>
          <OneFriend friend={props.i as FriendType} />
        </Match>
        <Match when={isGroupType(props.i)}>
          <OneGroup group={props.i as GroupType} />
        </Match>
      </Switch>
      <Show when={removeDlg()}>
        <Portal>
          <div class={clsx('modal-layout shadow space-y-2')}>
            <div>确定移除这个会话吗？</div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={removeConvCache()}
                  onChange={e => setRemoveConvCache((e.target as HTMLInputElement).checked)}
                />
                同时删除临时消息记录
              </label>
            </div>
            <div class={clsx('space-x-2')}>
              <button
                onClick={() => {
                  remove()
                  setRemoveDlg(false)
                }}
              >
                Confirm
              </button>
              <button onClick={() => setRemoveDlg(false)}>Cancel</button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

const RecentMessage: Component<{
  list: (FriendType | GroupType)[]
  cls?: string
}> = (props) => {
  return (
    <div class={clsx([props.cls, 'h-100vh', 'of-y-auto'])}>
      <For each={props.list}>
        {c => <Item i={c} />}
      </For>
    </div>
  )
}

export {
  RecentMessage,
}
