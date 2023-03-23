const get_friend_list_api = '/get_friend_list'

interface FriendType {
  /**
   * QQ 号
   */
  user_id: number
  /**
   * 昵称
   */
  nickname: string
  /**
   * 备注
   */
  remark?: string
}

function isFriendType(obj: any): obj is FriendType {
  return obj && typeof obj === 'object' && Object.hasOwn(obj, 'user_id') && Object.hasOwn(obj, 'nickname')
}

function isFriendList(obj: any): obj is FriendType[] {
  return obj && Array.isArray(obj) && (obj.length === 0 || isFriendType(obj[0]))
}

export type {
  FriendType,
}

export {
  get_friend_list_api,
  isFriendType,
  isFriendList,
}
