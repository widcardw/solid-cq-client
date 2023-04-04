import type { ReceivedForwardedMessage } from './received-msg-types'

interface CqMessageType {
  type: string
}

interface CqTextMessage extends CqMessageType {
  type: 'text'
  data: {
    /**
     * 消息内容
     */
    text: string
  }
}

interface CqReplyMessage extends CqMessageType {
  type: 'reply'
  data: {
    /**
     * 消息 id
     */
    id: number
  }
}

interface CqImageMessage extends CqMessageType {
  type: 'image'
  data: {
    /**
     * 图片的路径
     */
    file: string
    url?: string
  }
}

interface CqAtMessage extends CqMessageType {
  type: 'at'
  data: {
    qq: number
  }
}

interface CqFileMessage extends CqMessageType {
  type: 'file'
  data: {
    /**
     * 文件的路径
     */
    file: string
    /**
     * 文件名
     */
    name: string
  }
}

interface CqJsonCardMessage extends CqMessageType {
  type: 'json'
  data: {
    data: string
  }
}

interface CqFaceMessage extends CqMessageType {
  type: 'face'
  data: {
    id: number
  }
}

interface CqRecordMessage extends CqMessageType {
  type: 'record'
  data: {
    file: string
  }
}

interface CqForwardMessage extends CqMessageType {
  type: 'forward'
  data: {
    id: string
  }
  details?: ReceivedForwardedMessage
}

type MultiTypeSentMessage = CqTextMessage | CqReplyMessage | CqImageMessage | CqAtMessage

type CqSentMessage = MultiTypeSentMessage | MultiTypeSentMessage[]

type MultiTypeReceivedMessage =
CqTextMessage
| CqReplyMessage
| CqImageMessage
| CqAtMessage
| CqJsonCardMessage
| CqFaceMessage
| CqRecordMessage
| CqForwardMessage

type CqReceivedMessage = MultiTypeReceivedMessage | MultiTypeReceivedMessage[]

function createTextMessage(text: string): CqTextMessage {
  return {
    type: 'text',
    data: { text },
  }
}

function createReplyMessage(id: number): CqReplyMessage {
  return {
    type: 'reply',
    data: { id },
  }
}

function createImageMessage(file: string): CqImageMessage {
  return {
    type: 'image',
    data: { file },
  }
}

function createFileMessage(url: string, name?: string): CqFileMessage {
  return {
    type: 'file',
    data: {
      file: url,
      name: name || url.split('/').pop()?.slice(0, 32) || 'no_name',
    },
  }
}

function createAtMessage(qq: number): CqAtMessage {
  return {
    type: 'at',
    data: { qq },
  }
}

export type {
  CqTextMessage,
  CqReplyMessage,
  CqImageMessage,
  CqSentMessage,
  CqFileMessage,
  CqAtMessage,
  CqFaceMessage,
  CqRecordMessage,
  CqForwardMessage,
  CqReceivedMessage,
  CqJsonCardMessage,
  MultiTypeReceivedMessage,
}

export {
  createTextMessage,
  createReplyMessage,
  createImageMessage,
  createFileMessage,
  createAtMessage,
}
