import { createSignal } from 'solid-js'

const [isGettingGroupHistoryMsg, setGettingGroupHistoryMsg] = createSignal(false)
const [wasmInited, setWasmInited] = createSignal(false)
const [convLoading, setConvLoading] = createSignal(false)
const [showTexPreview, setShowTexPreview] = createSignal(false)

export {
  isGettingGroupHistoryMsg, setGettingGroupHistoryMsg,
  wasmInited, setWasmInited,
  convLoading, setConvLoading,
  showTexPreview, setShowTexPreview,
}
