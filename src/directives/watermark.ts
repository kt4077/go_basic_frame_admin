// v-watermark 水印指令：在指定区域覆盖 canvas 水印。
// 用法：<div v-watermark="{ enabled: true, text: 'xxx', opacity: 0.06 }">
// enabled 为 false 时不渲染（或移除已有水印），不会影响内部组件。
import type { Directive, DirectiveBinding } from 'vue'

interface WatermarkOptions {
  enabled: boolean
  text: string
  opacity: number
}

const renderWatermark = (el: HTMLElement, options: WatermarkOptions) => {
  clearWatermark(el)
  if (!options.enabled) return

  const canvas = document.createElement('canvas')
  canvas.width = 260
  canvas.height = 180
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((-20 * Math.PI) / 180)
  ctx.font = '15px sans-serif'
  ctx.fillStyle = `rgba(128, 128, 128, ${options.opacity})`
  ctx.textAlign = 'center'
  ctx.fillText(options.text, 0, 0)

  const mask = document.createElement('div')
  mask.dataset.watermark = 'true'
  Object.assign(mask.style, {
    position: 'absolute',
    inset: '0',
    zIndex: '9999',
    pointerEvents: 'none',
    backgroundImage: `url(${canvas.toDataURL('image/png')})`,
    backgroundRepeat: 'repeat',
  } as CSSStyleDeclaration)
  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative'
  }
  el.appendChild(mask)
}

const clearWatermark = (el: HTMLElement) => {
  el.querySelector('[data-watermark="true"]')?.remove()
}

const watermark: Directive<HTMLElement, WatermarkOptions> = {
  mounted: (el: HTMLElement, binding: DirectiveBinding<WatermarkOptions>) => {
    renderWatermark(el, binding.value)
  },
  updated: (el: HTMLElement, binding: DirectiveBinding<WatermarkOptions>) => {
    renderWatermark(el, binding.value)
  },
  unmounted: (el: HTMLElement) => {
    clearWatermark(el)
  },
}

export default watermark
