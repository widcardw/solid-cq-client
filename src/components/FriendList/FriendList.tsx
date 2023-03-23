import type { Component } from 'solid-js'
import { For, createMemo, createSignal } from 'solid-js'
import clsx from 'clsx'
import { OneFriend } from '../Listed/OneFriend'
import type { FriendType } from '~/utils/api/friend-type'
import { ws } from '~/utils/ws/instance'

const ContactList: Component<{
  list: FriendType[]
  cls?: string
}> = (props) => {
  if (props.list.length === 0)
    ws.get('get_friend_list')

  const [search, setSearch] = createSignal('')
  const listed = createMemo(() => {
    if (search().trim() === '')
      return props.list
    return props.list.filter(i => i.remark?.match(search()) || i.nickname.match(search()))
  })

  return (
    <div class={clsx([props.cls, 'flex flex-col', 'h-100vh'])}>
      <input
        class={clsx([
          'outline-none',
          'border-none border border-b-solid border-b-gray/30',
          'p-2',
          'text-1.2rem',
        ])}
        onInput={(e) => {
          setSearch((e.target as HTMLInputElement).value)
        }}
      />
      <div
        class={clsx([
          'flex-1',
          'of-y-auto',
        ])}
      >
        <For each={listed()}>
          {f => <OneFriend friend={f} />}
        </For>
      </div>
    </div>
  )
}

export {
  ContactList,
}
