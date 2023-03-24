import { useStorage } from 'solidjs-use'

const [wsUrl, setWsUrl] = useStorage('ws-url', 'ws://0.0.0.0:5700')

export {
  wsUrl, setWsUrl,
}
