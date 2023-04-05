import { createSignal } from 'solid-js'
import { isFriendList } from '../api/friend-type'
import { isGroupList } from '../api/group-type'
import { isForwardedMessage, isGroup, isPrivate } from '../api/received-msg-types'
import { pushGroupConversation, pushPrivateConversation } from '../stores/conv'
import { WarningType, lastForwardId, sendEl, setForwardMap, setFriendList, setGroupFsStore, setGroupList, setLastforwardId, setLoading, setWarnings, warnings } from '../stores/lists'
import { addFriendStore, addGroupStore, recallFriendStore, recallGroupStore } from '../stores/store'
import { isGroupUploadFile, isOfflineFile, receivedGroupUploadHandler, receivedOfflineFileHandler } from '../api/notice'
import { _createFileMessage } from '../api/sent-message-type'
import { isGroupRootFsListMessage, isSingleFileUrl } from '../api/group-fs'
import { createWs } from './ws'
import type { CqWs } from './ws'

const [ws, setWs] = createSignal<CqWs>()

function initWs(url: string) {
  setWs(createWs(url))
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

    if (isFriendList(data.data)) {
      setFriendList(data.data)
      return
    }
    if (isGroupList(data.data)) {
      setGroupList(data.data)
      return
    }

    if (isForwardedMessage(data.data)) {
      const i = lastForwardId()
      if (i.trim() !== '') {
        setForwardMap(lastForwardId(), data.data)
        setLastforwardId('')
        return
      }
    }

    if (data.message === '' && data.retcode === 0 && data.status === 'ok') {
      if (data.data && Object.keys(data.data).length === 1 && typeof data.data.message_id === 'number') {
        const el = sendEl()
        if (el)
          el.value = ''
        setLoading(false)
        return
      }
    }
    if (isPrivate(data)) {
      if (data.user_id === data.self_id)
        data.user_id = data.target_id

      pushPrivateConversation(data)
      addFriendStore(data)
      return
    }

    if (isGroup(data)) {
      pushGroupConversation(data)
      addGroupStore(data)
      return
    }

    const fs = data.data
    if (isGroupRootFsListMessage(fs)) {
      setGroupFsStore(
        fs.files[0].group_id || fs.folders[0].group_id,
        fs,
      )
      return
    }

    if (isSingleFileUrl(fs)) {
      setWarnings(p => [...p, { type: WarningType.Info, msg: '点击下载', extra: fs.url }])
      return
    }

    // eslint-disable-next-line no-console
    console.log(data)
  })
}

export {
  ws,
  initWs,
  setWs,
}
