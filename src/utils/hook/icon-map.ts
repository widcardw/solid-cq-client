import type { WarningType } from '../stores/lists'
// @unocss-include
const ICONMAP: Record<WarningType, string> = {
  Warning: 'i-teenyicons-exclamation-circle-outline text-orange',
  Info: 'i-teenyicons-info-circle-outline text-blue',
  Error: 'i-teenyicons-x-circle-outline text-red',
}

function suffixToIcon(suffix?: string): string {
  switch (suffix) {
    case 'pdf': {
      return 'i-teenyicons-pdf-outline'
    }
    case 'jpg':
    case 'JPG':
    case 'jpeg':
    case 'gif':
    case 'png':
    case 'webp':
    case 'bmp': {
      return 'i-teenyicons-image-document-outline'
    }
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac': {
      return 'i-teenyicons-audio-document-outline'
    }
    case 'mp4':
    case 'avi':
    case 'flv':
    case 'mkv':
    case 'webm': {
      return 'i-teenyicons-play-circle-outline'
    }
    case 'doc':
    case 'docx': {
      return 'i-teenyicons-ms-word-outline'
    }
    case 'ppt':
    case 'pptx': {
      return 'i-teenyicons-ms-powerpoint-outline'
    }
    case 'xls':
    case 'xlsx':
    case 'csv': {
      return 'i-teenyicons-ms-excel-outline'
    }
    case 'txt': {
      return 'i-teenyicons-text-solid'
    }
    case 'md': {
      return 'i-teenyicons-markdown-outline'
    }
    case 'zip':
    case 'rar':
    case '7z': {
      return 'i-teenyicons-zip-outline'
    }
    case 'apk': {
      return 'i-teenyicons-android-outline'
    }
    case 'py': {
      return 'i-teenyicons:python-outline'
    }
    case 'js': {
      return 'i-teenyicons:javascript-outline'
    }
    case 'ts': {
      return 'i-teenyicons:typescript-outline'
    }
    default: {
      return 'i-teenyicons-file-outline'
    }
  }
}

export {
  ICONMAP,
  suffixToIcon,
}
