import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Match, Switch } from 'solid-js'
import { OneFriend } from '../Listed/OneFriend'
import { OneGroup } from '../Listed/OneGroup'
import type { FriendType } from '~/utils/api/friend-type'
import { isFriendType } from '~/utils/api/friend-type'
import type { GroupType } from '~/utils/api/group-type'
import { isGroupType } from '~/utils/api/group-type'

const RecentMessage: Component<{
  list: (FriendType | GroupType)[]
  cls?: string
}> = (props) => {
  return (
    <div class={clsx([props.cls, 'h-100vh', 'of-y-auto'])}>
      <For each={props.list}>
        {c => (
          <Switch>
            <Match when={isFriendType(c)}>
              <OneFriend friend={c as FriendType} />
            </Match>
            <Match when={isGroupType(c)}>
              <OneGroup group={c as GroupType} />
            </Match>
          </Switch>
        )}
      </For>
    </div>
  )
}

export {
  RecentMessage,
}
