import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, createMemo, createSignal } from 'solid-js'
import { OneGroup } from '../Listed/OneGroup'
import type { GroupType } from '~/utils/api/group-type'
import { ws } from '~/utils/ws/instance'

const GroupList: Component<{
  list: GroupType[]
  cls?: string
}> = (props) => {
  if (props.list.length === 0)
    ws()?.get('get_group_list')
  const [search, setSearch] = createSignal('')
  const listed = createMemo(() => {
    if (search().trim() === '')
      return props.list
    return props.list.filter(i => i.group_name.match(search()))
  })
  return (
    <div class={clsx([props.cls, 'flex flex-col', 'h-100vh'])}>
      <input
        type='search'
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
          {group => <OneGroup group={group} />}
        </For>
      </div>
    </div>
  )
}

export {
  GroupList,
}
