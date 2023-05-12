import { createSignal } from 'solid-js'
import { isFriendList, isFriendList2 } from '../api/friend-type'
import { isGroupList, isGroupList2 } from '../api/group-type'
import { isForwardedMessage, isForwardedMessage2, isGroup, isPrivate } from '../api/received-msg-types'
import { pushGroupConversation, pushPrivateConversation } from '../stores/conv'
import { WarningType, lastForwardId, sendEl, setForwardMap, setFriendList, setGroupFsStore, setGroupList, setLastforwardId, setLoading, setWarnings, warnings } from '../stores/lists'
import { addFriendStore, addGroupStore, recallFriendStore, recallGroupStore } from '../stores/store'
import { isGroupUploadFile, isOfflineFile, receivedGroupUploadHandler, receivedOfflineFileHandler } from '../api/notice'
import { _createFileMessage } from '../api/sent-message-type'
import type { GroupFsList } from '../api/group-fs'
import { isGroupRootFsListMessage, isSingleFileUrl } from '../api/group-fs'
import { WsGetApi, createWs } from './ws'
import type { CqWs } from './ws'

const [ws, setWs] = createSignal<CqWs>()

function initWs(url: string) {
  setWs(createWs(url))
  setLoading(false)
  ws()?.listen((data: any) => {
    if (data.post_type === 'meta_event' || data.post_type === 'request')
      return

    if (data.post_type === 'notice') {
      if (data.notice_type === 'friend_recall')
        recallFriendStore(data)

      else if (data.notice_type === 'group_recall')
        recallGroupStore(data)

      else if (isOfflineFile(data))
        receivedOfflineFileHandler(data)

      else if (isGroupUploadFile(data))
        receivedGroupUploadHandler(data)

      return
    }

    if (Object.hasOwn(data, 'echo')) {
      const echo: WsGetApi = data.echo
      switch (echo) {
        case WsGetApi.FriendList: {
          setFriendList(data.data)
          return
        }
        case WsGetApi.GroupList: {
          setGroupList(data.data)
          return
        }
        case WsGetApi.ForwardMsg: {
          const i = lastForwardId()
          if (i.trim() !== '') {
            setForwardMap(lastForwardId(), data.data)
            setLastforwardId('')
          }
          return
        }
        case WsGetApi.GroupRootFiles: {
          const fs: GroupFsList = data.data
          const id = fs.files[0].group_id || fs.folders[0].group_id
          if (id)
            setGroupFsStore(id.toString(), fs)
          return
        }
        case WsGetApi.GroupFileUrl: {
          const url: string = data.data.url
          setWarnings(p => [...p, { type: WarningType.Info, msg: '点击下载', extra: url }])
          return
        }
        // case WsGetApi.GroupFilesByFolder: {
        //   const fs: GroupFsList = data.data
        //   console.log(data)
        //   return
        // }
      }
      if (echo.startsWith(WsGetApi.GroupFilesByFolder)) {
        const [, folder_id] = echo.split('#')
        setGroupFsStore(folder_id, data.data)
        return
      }
    }

    if (data.message === '' && data.retcode === 0 && data.status === 'ok') {
      if (data.data && Object.keys(data.data).length === 1 && typeof data.data.message_id === 'number') {
        setLoading(false)
        const el = sendEl()
        if (el) {
          el.value = ''
          el.focus()
        }

        return
      }
    }
    if (isPrivate(data)) {
      if (data.user_id === data.self_id)
        data.user_id = data.target_id

      // Temporarily a solution for correcting the slice problem
      if (data.post_type === 'message_sent') {
        const msg = data.message
        if (Array.isArray(msg)) {
          if (msg[0].type === 'text')
            msg[0].data.text = data.raw_message
        }
        else {
          if (msg.type === 'text')
            msg.data.text = data.raw_message
        }
      }
      pushPrivateConversation(data)
      addFriendStore(data)
      return
    }

    if (isGroup(data)) {
      pushGroupConversation(data)
      addGroupStore(data)
      return
    }

    // const fs = data.data
    // if (isGroupRootFsListMessage(fs)) {
    //   setGroupFsStore(
    //     fs.files[0].group_id || fs.folders[0].group_id,
    //     fs,
    //   )
    //   return
    // }

    // if (isSingleFileUrl(fs)) {
    //   setWarnings(p => [...p, { type: WarningType.Info, msg: '点击下载', extra: fs.url }])
    //   return
    // }

    // eslint-disable-next-line no-console
    console.log(data)
  })
}

export {
  ws,
  initWs,
  setWs,
}
