import { createSignal } from 'solid-js'

function useConfirm() {
  const [isRevealed, setReveal] = createSignal(false)
  const reveal = () => setReveal(true)
  const unreveal = () => setReveal(false)
  return { isRevealed, reveal, unreveal }
}

export {
  useConfirm,
}
