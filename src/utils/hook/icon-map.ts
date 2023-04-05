import type { WarningType } from '../stores/lists'
// @unocss-include
const ICONMAP: Record<WarningType, string> = {
  Warning: 'i-teenyicons-exclamation-circle-outline text-orange',
  Info: 'i-teenyicons-info-circle-outline text-blue',
  Error: 'i-teenyicons-x-circle-outline text-red',
}

export {
  ICONMAP,
}
