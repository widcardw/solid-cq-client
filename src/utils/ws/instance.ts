import { createSignal } from 'solid-js'
import type { ReceivedGroupMessage } from '../api/received-msg-types'
import { isGroup, isPrivate } from '../api/received-msg-types'
import { pushGroupConversation, pushPrivateConversation } from '../stores/conv'
import { WarningType, lastForwardId, pushRightBottomMessage, sendEl, setForwardMap, setFriendList, setGroupFsStore, setGroupList, setLastforwardId } from '../stores/lists'
import { addFriendStore, addGroupMemberCard, addGroupMessages, addGroupStore, recallFriendStore, recallGroupStore } from '../stores/store'
import { isGroupUploadFile, isOfflineFile, receivedGroupUploadHandler, receivedOfflineFileHandler } from '../api/notice'
import { _createFileMessage } from '../api/sent-message-type'
import type { GroupFsList } from '../api/group-fs'
import { setConvLoading, setShowTexPreview } from '../stores/semaphore'
import { WsGetApi, createWs } from './ws'
import type { CqWs } from './ws'

const [ws, setWs] = createSignal<CqWs>()

function transformSelfSentMsg(data: any) {
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
  return data
}

function initWs(url: string) {
  setWs(createWs(url))
  setConvLoading(false)
  ws()?.listen((data: any) => {
    if (data.post_type === 'meta_event' || data.post_type === 'request')
      return

    if (data.post_type === 'message_sent')
      // eslint-disable-next-line no-console
      console.log(data)

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
          pushRightBottomMessage({ type: WarningType.Info, msg: '点击下载', extra: url })
          return
        }
        case WsGetApi.GroupMsgHistory: {
          addGroupMessages(data.data.messages)
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
        setConvLoading(false)
        const el = sendEl()
        if (el) {
          el.value = ''
          el.focus()
          setShowTexPreview(false)
        }

        return
      }
    }

    if (isPrivate(data)) {
      if (data.user_id === data.self_id)
        data.user_id = data.target_id

      // Temporarily a solution for correcting the slice problem
      data = transformSelfSentMsg(data)
      pushPrivateConversation(data)
      addFriendStore(data)
      return
    }

    if (isGroup(data)) {
      // Temporarily a solution for correcting the slice problem
      // data = transformSelfSentMsg(data)
      pushGroupConversation(data)
      addGroupStore(data)
      addGroupMemberCard(data)
      return
    }

    // eslint-disable-next-line no-console
    console.log(data)
    if (data && data.status === 'failed')
      pushRightBottomMessage({ type: WarningType.Error, msg: '消息发送失败，详情请打开 console 查看' })
  })
}

export {
  ws,
  initWs,
  setWs,
}
