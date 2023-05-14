import { createSignal } from 'solid-js'

function useResizer({ initialSize = 150, minSize = 150, maxSize = 500, direction = 'top' } = {}) {
  const [size, setSize] = createSignal(initialSize)
  const onResize = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const currentSize = size()
    const between = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
    document.body.style.cursor = ['top', 'botttom'].includes(direction) ? 'row-resize' : 'col-resize'
    const onMouseMove = (e: MouseEvent) => {
      const diff = direction === 'top'
        ? clientY - e.clientY
        : direction === 'bottom'
          ? e.clientY - clientY
          : direction === 'left'
            ? clientX - e.clientX
            : e.clientX - clientX // direction === 'right'
      setSize(between(currentSize + diff, minSize, maxSize))
    }
    const onMouseUp = (e: MouseEvent) => {
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  return { size, onResize }
}

export {
  useResizer,
}
