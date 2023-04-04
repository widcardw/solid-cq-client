import clsx from 'clsx'
import type { Component } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useMagicKeys, whenever } from 'solidjs-use'

const ZoomedImg: Component<{
  url: string
  setZoomImg: (v: boolean) => any
}> = (props) => {
  const { escape } = useMagicKeys()
  whenever(escape, () => {
    props.setZoomImg(false)
  })
  return (
    <div
      class={clsx(
        'fixed',
        'flex',
        'left-0', 'right-0', 'top-0', 'bottom-0',
        'z-99',
        'items-center',
        'justify-center',
        'bg-zinc-800/70',
      )}
    >
      <img
        src={props.url}
        class={clsx('max-w-90%', 'max-h-90%', 'shadow')}
        referrerPolicy="no-referrer"
        alt='图片'
      />
      <div
        class={clsx(
          'absolute',
          'p-4',
          'top-4', 'right-4',
          'bg-zinc-800/70',
          'rounded-full',
        )}
      >
        <div
          class={clsx(
            'i-teenyicons-x-solid',
            'text-3rem',
            'cursor-pointer',
            'text-white',
            'hover:text-blue',
          )}
          onClick={() => props.setZoomImg(false)}
        />
      </div>
    </div>
  )
}

const ImageMessageShown: Component<{
  url: string
}> = (props) => {
  const [zoomImg, setZoomImg] = createSignal(false)
  return (
    <>
      <img
        src={props.url}
        onClick={() => setZoomImg(true)}
        class={clsx('cursor-zoom-in')}
        referrerPolicy="no-referrer"
        alt='图片'
        style={{ 'max-width': '200px' }}
      />
      <Show when={zoomImg()}>
        <Portal mount={document.querySelector('body')!}>
          <ZoomedImg url={props.url} setZoomImg={setZoomImg} />
        </Portal>
      </Show>
    </>
  )
}

export {
  ImageMessageShown,
}
