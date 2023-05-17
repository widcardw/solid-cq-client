import clsx from 'clsx'
import type { Component } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
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
import { ws } from '~/utils/ws/instance'
import { WsGetApi } from '~/utils/ws/ws'

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
      <span class={clsx('flex-1')}>{props.file.file_name}</span>
      <span class={clsx('text-gray', 'w-6rem', 'of-hidden')}>{transformFileSize(props.file.file_size)}</span>
      <span class={clsx('whitespace-nowrap', 'text-ellipsis', 'w-8rem', 'of-hidden')}>{props.file.uploader_name}</span>
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
  conv: GroupConversation
  folder: GroupFileFolder
  prevName: string
}> = (props) => {
  const [showFsList, setShowFsList] = createSignal(false)
  const getFolderHandler = () => {
    if (!groupFsStore[props.folder.folder_id]) {
      ws()?.get(WsGetApi.GroupFilesByFolder, {
        group_id: props.conv.id,
        folder_id: props.folder.folder_id,
      }, `${WsGetApi.GroupFilesByFolder}#${props.folder.folder_id}`)
    }
    setShowFsList(true)
  }
  return (
    <div
      class={clsx(
        'border border-b-(solid zinc/30)',
        'flex',
        'p-2',
        'items-center',
        'space-x-2',
      )}
      onClick={getFolderHandler}
    >
      <div class={clsx('i-teenyicons-folder-outline')} />
      <span>{props.folder.folder_name}</span>
      <Show when={showFsList()}>
        <Portal mount={document.querySelector('body')!}>
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <PortaledFileViewer conv={props.conv} setShow={setShowFsList} folderId={props.folder.folder_id} prevName={props.prevName} />
        </Portal>
      </Show>
    </div>
  )
}

const PortaledFileViewer: Component<{
  conv: GroupConversation
  setShow: (v: boolean) => any
  folderId?: number
  prevName: string
}> = (props) => {
  const id = createMemo(() => props.folderId || props.conv.id)
  return (
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
        <div class="text-1.2rem">{props.prevName}</div>
        <div
          class={clsx(
            'i-teenyicons-x-solid',
            'cursor-pointer',
            'hover:text-blue',
            'top-2', 'right-2',
          )}
          onClick={() => props.setShow(false)}
        />
      </div>
      <Show when={groupFsStore[id()]} fallback="加载中……">
        <For each={groupFsStore[id()]?.folders}>
          {folder => <OneFolderItem conv={props.conv} folder={folder} prevName={`${props.prevName} > ${folder.folder_name}`} />}
        </For>
        <For each={groupFsStore[id()]?.files}>
          {file => <OneFileItem group_id={id()} file={file} />}
        </For>
      </Show>
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
            'i-teenyicons-anti-clockwise-solid',
            'hover:text-blue',
            'cursor-pointer',
          )}
          onClick={() => {
            const first = props.conv.list[0]?.message_seq
            ws()?.get(WsGetApi.GroupMsgHistory, {
              message_seq: first,
              group_id: props.conv.id,
            })
          }}
        />
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
          <PortaledFileViewer conv={props.conv} setShow={setShowFsList} prevName='群文件' />
        </Portal>
      </Show>
    </>
  )
}

export {
  GroupConv,
}
