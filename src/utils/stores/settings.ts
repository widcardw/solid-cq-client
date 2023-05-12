import { createSignal } from 'solid-js'

const [sendByEnter, setSendByEnter] = createSignal(false)

export {
  sendByEnter, setSendByEnter,
}
