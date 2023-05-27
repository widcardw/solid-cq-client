import { describe, expect, it } from 'vitest'
import { toPipeline } from '~/utils/hook/transformLink'

describe('transform links', () => {
  it('should build pipeline', () => {
    const code = '链接 https://bilibili.com/av170001 链接 https://github.com/widcardw 链接'
    expect(toPipeline(code)).toMatchObject({
      flag: true,
      pipeline: [
        { type: 'text', content: '链接 ' },
        { type: 'link', content: 'https://bilibili.com/av170001 ' },
        { type: 'text', content: '链接 ' },
        { type: 'link', content: 'https://github.com/widcardw ' },
        { type: 'text', content: '链接' },
      ],
    })
  })

  it('should build link only', () => {
    expect(toPipeline('https://b23.tv/av666')).toMatchObject({
      flag: true,
      pipeline: [
        { type: 'link', content: 'https://b23.tv/av666' },
      ],
    })
  })

  it('does not match any link', () => {
    expect(toPipeline('不是链接哦')).toMatchObject({
      flag: false,
      pipeline: [
        { type: 'text', content: '不是链接哦' },
      ],
    })
  })

  it('should build multi-line link', () => {
    const code = `这是一段文字
https://this.is.link/1
这是二段文字
http://this.is.link/2`

    expect(toPipeline(code)).toMatchObject({
      flag: true,
      pipeline: [
        { type: 'text', content: '这是一段文字\n' },
        { type: 'link', content: 'https://this.is.link/1' },
        { type: 'text', content: '\n这是二段文字\n' },
        { type: 'link', content: 'http://this.is.link/2' },
      ],
    })
  })
})
