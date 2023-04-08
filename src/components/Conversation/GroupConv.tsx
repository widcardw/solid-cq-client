import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Show, createEffect, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { GroupConvMessage } from './GroupConvMessage'
import type { GroupConversation } from '~/utils/stores/lists'
import { groupFsStore } from '~/utils/stores/lists'

import './scroller.css'
import './icon.css'
import type { GroupFile, GroupFileFolder } from '~/utils/api/group-fs'
import { getFileUrl, getGroupRootFile } from '~/utils/api/group-fs'
import { transformFileSize } from '~/utils/hook/fileSize'
import { suffixToIcon } from '~/utils/hook/icon-map'

const OneFileItem: Component<{
  group_id: number
  file: GroupFile
}> = (props) => {
  return (
    <div
      class={clsx(
        'border border-b-(solid zinc/30)',
        'flex',
        'p-2',
        'items-center',
        'space-x-2',
      )}
    >
      <div class={clsx(suffixToIcon(props.file.file_name.split('.').pop()))} />
      <span>{props.file.file_name}</span>
      <span class={clsx('text-gray')}>{transformFileSize(props.file.file_size)}</span>
      <div class="flex-1" />
      <div
        class={clsx('i-teenyicons-download-solid',
          'hover:text-blue',
          'cursor-pointer',
        )}
        onClick={() => {
          getFileUrl(props.group_id, props.file.file_id, props.file.busid)
        }}
      />
    </div>
  )
}

const OneFolderItem: Component<{
  group_id: number
  folder: GroupFileFolder
}> = (props) => {
  return (
    <div
      class={clsx(
        'border border-b-(solid zinc/30)',
        'flex',
        'p-2',
        'items-center',
        'space-x-2',
      )}
    >
      <div class={clsx('i-teenyicons-folder-outline')} />
      <span>{props.folder.folder_name}</span>
      <span>（烦内，ws 的消息只能从 listen 拿到，开摆了）</span>
    </div>
  )
}

const GroupConv: Component<{
  conv: GroupConversation
}> = (props) => {
  const [el, setEl] = createSignal<HTMLDivElement>()
  const [showFsList, setShowFsList] = createSignal(false)
  function toBottom() {
    const e = el()
    if (e)
      e.scrollTo({ top: e.scrollHeight })
  }

  createEffect(() => {
    if (props.conv.id)
      toBottom()
  })
  return (
    <>
      <div class={clsx([
        'p-2',
        'text-1.2rem',
        'border border-b-solid border-b-zinc/20',
        'flex',
        'items-center',
        'space-x-2',
      ])}
      >
        <div>{props.conv.nick} {props.conv.id}</div>
        <div class="flex-1" />
        <div
          class={clsx(
            'i-teenyicons-folder-outline',
            'hover:text-blue',
            'cursor-pointer',
          )}
          onClick={() => {
            getGroupRootFile(props.conv.id)
            setShowFsList(true)
          }}
        />
        <div
          class={clsx(
            'i-teenyicons-arrow-down-circle-outline',
            'hover:text-blue',
            'cursor-pointer',
          )}
          title="点击跳转到底部"
          onClick={toBottom}
        />
      </div>
      <div
        ref={r => setEl(r)}
        class={clsx('flex-1', 'of-y-auto', 'scroller')}
      >
        <For each={props.conv.list}>
          {item => (
            <GroupConvMessage item={item} />
          )}
        </For>
      </div>
      {/* group file list */}
      <Show when={showFsList()}>
        <Portal mount={document.querySelector('body')!}>
          <div
            class={clsx(
              'absolute',
              'top-12',
              'bottom-12',
              'left-12',
              'right-12',
              'z-2',
              'shadow',
              'rounded',
              'p-4',
              'of-y-auto',
            )}
            style={{
              background: 'var(--dlg-bg-color)',
            }}
          >
            <div class={clsx('flex items-center justify-between')}>
              <div class="text-1.2rem">群文件</div>
              <div
                class={clsx(
                  'i-teenyicons-x-solid',
                  'cursor-pointer',
                  'hover:text-blue',
                  'top-2', 'right-2',
                )}
                onClick={() => setShowFsList(false)}
              />
            </div>
            <For each={groupFsStore[props.conv.id]?.files}>
              {file => <OneFileItem group_id={props.conv.id} file={file} />}
            </For>
            <For each={groupFsStore[props.conv.id]?.folders}>
              {folder => <OneFolderItem group_id={props.conv.id} folder={folder} />}
            </For>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export {
  GroupConv,
}
