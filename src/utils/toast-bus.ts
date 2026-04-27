import { reactive } from 'vue'

type ToastState = {
  show: boolean
  text: string
  tone: 'success' | 'error'
}

export const toastState = reactive<ToastState>({
  show: false,
  text: '',
  tone: 'success',
})

export function showToast(text: string, tone: ToastState['tone'] = 'success', ms = 2200): void {
  toastState.text = text
  toastState.tone = tone
  toastState.show = true
  window.setTimeout(() => {
    toastState.show = false
  }, ms)
}
