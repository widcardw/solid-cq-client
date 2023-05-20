import { pushGroupConversation, pushPrivateConversation } from '../stores/conv'
import { friendList, groupMemberCard } from '../stores/lists'
import { addFriendStore, addGroupStore } from '../stores/store'
import type { ReceivedGroupMessage, ReceivedPrivateMessage } from './received-msg-types'
import { _createFileMessage } from './sent-message-type'

interface OfflineNoticeType {
  post_type: 'notice'
  notice_type: 'offline_file'
  time: number
  self_id: number
  user_id: number
  file: {
    name: string
    size: number
    url: string
  }
}

interface GroupUploadNoticeType {
  post_type: 'notice'
  notice_type: 'group_upload'
  time: number
  self_id: number
  group_id: number
  user_id: number
  file: {
    id: string
    name: string
    size: number
    url: string
  }
}

function isOfflineFile(obj: any): obj is OfflineNoticeType {
  return obj && obj.post_type === 'notice' && obj.notice_type === 'offline_file'
}

function receivedOfflineFileHandler(data: OfflineNoticeType) {
  const { user_id, file, time, self_id } = data
  const person = friendList().find(i => i.user_id === user_id) || { user_id: 0, nickname: '未知' }
  const receivedFileMessage: ReceivedPrivateMessage = {
    time,
    self_id,
    post_type: 'message',
    message_type: 'private',
    sub_type: 'friend',
    message_id: 0,
    user_id,
    target_id: self_id,
    raw_message: '',
    font: 0,
    sender: {
      user_id,
      nickname: person.nickname,
      sex: 'unknown',
      age: 0,
    },
    temp_source: 0,
    message: [_createFileMessage({ name: file.name, size: file.size, file: file.url })],
  }
  pushPrivateConversation(receivedFileMessage)
  addFriendStore(receivedFileMessage)
}

function isGroupUploadFile(obj: any): obj is GroupUploadNoticeType {
  return obj && obj.post_type === 'notice' && obj.notice_type === 'group_upload'
}

function receivedGroupUploadHandler(data: GroupUploadNoticeType) {
  const { group_id, user_id, file, time, self_id } = data
  const receivedFileMessage: ReceivedGroupMessage = {
    time,
    self_id,
    post_type: 'message',
    message_type: 'group',
    message_id: 0,
    raw_message: '文件',
    font: 0,
    sub_type: 'normal',
    user_id,
    message: [_createFileMessage({ name: file.name, size: file.size, file: file.url })],
    group_id,
    sender: {
      user_id,
      nickname: user_id.toString(),
      sex: 'unknown',
      age: 0,
      card: groupMemberCard[group_id]?.[user_id] || '',
      area: '',
      level: '',
      role: 'member',
      title: '',
    },
  }
  pushGroupConversation(receivedFileMessage)
  addGroupStore(receivedFileMessage)
}

export type {
  OfflineNoticeType,
  GroupUploadNoticeType,
}

export {
  isOfflineFile,
  isGroupUploadFile,
  receivedOfflineFileHandler,
  receivedGroupUploadHandler,
}
