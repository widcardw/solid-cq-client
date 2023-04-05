import type { CqFileMessage, CqSentMessage } from '../api/sent-message-type'
import type { DeleteMsgParams, GetMsgParams, GroupFileSentParams, GroupMsgSentParams, PrivateFileSentParams, PrivateMsgSentParams, WsSentParams } from '../api/ws-sent-params'
import { WarningType, setWarnings } from '../stores/lists'
import { setWs } from './instance'

enum MessageTarget {
  Private = 'p',
  Group = 'g',
}

type SendActions = 'send_private_msg' | 'send_group_msg' | 'upload_private_file' | 'upload_group_file' | 'get_msg' | 'delete_msg'

class CqWs {
  ws: WebSocket

  constructor(url: string) {
    this.ws = new WebSocket(url)
    this.ws.onerror = (ev) => {
      setWarnings(p => [...p, { type: WarningType.Error, msg: 'WebSocket error! Please view the console.' }])
      console.error(ev)
      setWs(undefined)
    }
    this.ws.onopen = () => {
      setWarnings(p => [...p, { type: WarningType.Info, msg: '已连接' }])
      this.get('get_friend_list')
      this.get('get_group_list')
    }
    this.ws.onclose = (ev) => {
      console.warn('WS closed', ev)
      setWarnings(p => [...p, { type: WarningType.Warning, msg: '连接已断开' }])
      setWs(undefined)
    }
  }

  listen(cb: (o: any) => void) {
    this.ws.onmessage = (ev) => {
      try {
        cb(JSON.parse(ev.data))
      }
      catch (e) {
        console.error(e)
      }
    }
  }

  get(action: string, params?: any) {
    this.ws.send(JSON.stringify({ action, params }))
  }

  send(action: 'send_private_msg', params: PrivateMsgSentParams): void
  send(action: 'send_group_msg', params: GroupMsgSentParams): void
  send(action: 'upload_private_file', params: PrivateFileSentParams): void
  send(action: 'upload_group_file', params: GroupFileSentParams): void
  send(action: 'get_msg', params: GetMsgParams): void
  send(action: 'delete_msg', params: DeleteMsgParams): void
  send(action: SendActions, params: WsSentParams) {
    this.ws.send(JSON.stringify({ action, params }))
  }

  m(target: MessageTarget, id: number, msg: CqSentMessage) {
    if (target === MessageTarget.Private) {
      const params: PrivateMsgSentParams = {
        user_id: id,
        message: msg,
      }
      this.send('send_private_msg', params)
    }
    else if (target === MessageTarget.Group) {
      const params: GroupMsgSentParams = {
        group_id: id,
        message: msg,
      }
      this.send('send_group_msg', params)
    }
  }

  f(target: MessageTarget, id: number, file: CqFileMessage) {
    if (target === MessageTarget.Private) {
      const params: PrivateFileSentParams = {
        file: file.data.file,
        name: file.data.name,
        user_id: id,
      }
      this.send('upload_private_file', params)
    }
    else if (target === MessageTarget.Group) {
      const params: GroupFileSentParams = {
        file: file.data.file,
        name: file.data.name,
        group_id: id,
      }
      this.send('upload_group_file', params)
    }
  }

  close() {
    this.ws.close()
  }
}

function createWs(url: string) {
  return new CqWs(url)
}

export {
  CqWs,
  createWs,
  MessageTarget,
}
