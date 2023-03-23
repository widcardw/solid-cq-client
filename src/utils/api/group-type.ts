/**
 * no_cache 请求参数 默认为 false
 */
const get_group_list_api = '/get_group_list'

interface GroupType {
  /**
   * 群号
   */
  group_id: number
  /**
   * 群名
   */
  group_name: string
  /**
   * 群备注
   */
  group_memo?: string
  /**
   * 建群时间
   */
  group_create_time?: number
  /**
   * 群等级
   */
  group_level?: number
  /**
   * 成员数
   */
  member_count?: number
  /**
   * 最大成员数
   */
  max_member_count?: number
}

function isGroupType(obj: any): obj is GroupType {
  return typeof obj === 'object' && Object.hasOwn(obj, 'group_id') && Object.hasOwn(obj, 'group_name')
}

function isGroupList(obj: any): obj is GroupType[] {
  return obj && Array.isArray(obj) && (obj.length === 0 || isGroupType(obj[0]))
}

export type {
  GroupType,
}

export {
  get_group_list_api,
  isGroupType,
  isGroupList,
}
