interface SentMessageType {
  type: string
}

interface SentTextMessage extends SentMessageType {
  type: 'text'
  data: {
    /**
     * 消息内容
     */
    text: string
  }
}

interface SentReplyMessage extends SentMessageType {
  type: 'reply'
  data: {
    /**
     * 消息 id
     */
    id: number
  }
}

interface SentImageMessage extends SentMessageType {
  type: 'image'
  data: {
    /**
     * 图片的路径
     */
    file: string
  }
}

interface SentFileMessage extends SentMessageType {
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

type MultiTypeMessage = SentTextMessage | SentReplyMessage | SentImageMessage

type SentMessage = MultiTypeMessage | MultiTypeMessage[]

function createTextMessage(text: string): SentTextMessage {
  return {
    type: 'text',
    data: { text },
  }
}

function createReplyMessage(id: number): SentReplyMessage {
  return {
    type: 'reply',
    data: { id },
  }
}

function createImageMessage(file: string): SentImageMessage {
  return {
    type: 'image',
    data: { file },
  }
}

function createFileMessage(url: string, name?: string): SentFileMessage {
  return {
    type: 'file',
    data: {
      file: url,
      name: name || url.split('/').pop() || 'no_name',
    },
  }
}

export type {
  SentTextMessage,
  SentReplyMessage,
  SentImageMessage,
  SentMessage,
  SentFileMessage,
}

export {
  createTextMessage,
  createReplyMessage,
  createImageMessage,
  createFileMessage,
}
