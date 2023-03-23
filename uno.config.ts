import { defineConfig } from 'unocss/vite'
import { presetIcons, presetUno, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      extraProperties: {
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
