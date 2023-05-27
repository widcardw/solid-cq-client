import type { Component } from 'solid-js'
import { Match, Switch } from 'solid-js'
import { For } from 'solid-js/web'

const REGEXP = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.\-\[\]\/?%~&=@:\*]*)*\/?/g

interface Item {
  type: 'link' | 'text'
  content: string
}

const buildPipeline: Component<{
  pipeline: Item[]
}> = (props) => {
  return (
    <For each={props.pipeline}>
      {i => (
        <Switch>
          <Match when={i.type === 'link'}>
            <a href={i.content} target='_blank'>{i.content}</a>
          </Match>
          <Match when={i.type === 'text'}>
            {i.content}
          </Match>
        </Switch>
      )}
    </For>
  )
}

const toPipeline = (text: string) => {
  let flag = false
  const pipeline: Item[] = []
  let match: RegExpExecArray | null
  let lastIdx = 0
  // eslint-disable-next-line no-cond-assign
  while ((match = REGEXP.exec(text)) !== null) {
    flag = true
    const first = text.slice(lastIdx, match.index)
    if (first)
      pipeline.push({ type: 'text', content: first })
    const url = match[0]
    pipeline.push({ type: 'link', content: url })
    lastIdx = match.index + url.length
  }
  const last = text.slice(lastIdx)
  if (last)
    pipeline.push({ type: 'text', content: last })

  return { flag, pipeline }
}

const transformLink = (text: string) => {
  const { flag, pipeline } = toPipeline(text)

  if (flag)
    return buildPipeline({ pipeline })

  return text
}

export {
  transformLink,
  toPipeline,
}
