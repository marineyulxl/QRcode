<script setup lang="ts">
import { ref, watch } from 'vue'

import { compressImageFile } from '#/utils/image-compress'

const props = withDefaults(
  defineProps<{
    label: string
    required?: boolean
    /** `user` 前置自拍；`environment` 现场/车辆环境 */
    capture?: 'user' | 'environment'
    error?: string
  }>(),
  { required: false, error: '' },
)

const model = defineModel<File | null>({ default: null })

const inputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const compressing = ref(false)
const localError = ref('')

watch(model, (file) => {
  if (!file) {
    previewUrl.value = null
  }
})

function openPicker(): void {
  localError.value = ''
  inputRef.value?.click()
}

async function onFileChange(ev: Event): Promise<void> {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  compressing.value = true
  localError.value = ''
  try {
    const { file: out, dataUrl } = await compressImageFile(file)
    model.value = out
    previewUrl.value = dataUrl
  } catch (e) {
    model.value = null
    previewUrl.value = null
    localError.value = e instanceof Error ? e.message : '图片处理失败'
  } finally {
    compressing.value = false
  }
}

function clearPhoto(): void {
  model.value = null
  previewUrl.value = null
  localError.value = ''
}

const displayError = () => props.error || localError.value
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-start justify-between gap-3">
      <label class="text-sm font-medium text-ink">
        {{ label }}
        <span v-if="required" class="text-danger">*</span>
      </label>
      <button
        type="button"
        class="text-sm font-medium text-cta hover:text-cta-hover"
        @click="openPicker"
      >
        {{ model ? '重拍' : '拍摄' }}
      </button>
    </div>

    <input
      ref="inputRef"
      class="hidden"
      type="file"
      accept="image/*"
      v-bind="capture ? { capture } : {}"
      @change="onFileChange"
    />

    <div
      class="relative overflow-hidden rounded-2xl border border-border bg-surface-card shadow-card"
      :class="displayError() ? 'border-danger' : ''"
    >
      <div v-if="compressing" class="flex min-h-touch items-center justify-center px-4 py-10">
        <p class="text-sm text-ink-muted">正在处理照片…</p>
      </div>
      <div v-else-if="previewUrl" class="relative">
        <img :src="previewUrl" alt="预览" class="max-h-56 w-full object-cover" />
        <button
          type="button"
          class="absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white"
          @click="clearPhoto"
        >
          清除
        </button>
      </div>
      <button
        v-else
        type="button"
        class="flex min-h-touch w-full items-center justify-center px-4 py-6 text-sm text-ink-muted"
        @click="openPicker"
      >
        点击拍摄
      </button>
    </div>

    <p v-if="displayError()" class="text-sm text-danger">{{ displayError() }}</p>
  </div>
</template>
