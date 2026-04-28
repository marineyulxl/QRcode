<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { VisitorApi } from '#/api/visitor-mock'
import CapturePhotoField from '#/components/capture-photo-field.vue'
import { fileToDataUrl } from '#/utils/image-compress'
import { showToast } from '#/utils/toast-bus'
import { isIdCard, isMobile, parseOptionalNonNegativeInt } from '#/utils/validation'

const fieldClass =
  'w-full rounded-xl border border-border bg-white px-3 py-3 text-base text-ink outline-none ring-cta/20 focus:border-cta focus:ring-2'

const visitorName = ref('')
const mobile = ref('')
const photo = ref<File | null>(null)
const companionCount = ref('')
const reason = ref('')
const idNumber = ref('')

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!visitorName.value.trim()) errors.visitorName = '请填写访客姓名'
  if (!isMobile(mobile.value)) errors.mobile = '请填写有效手机号'
  if (!photo.value) errors.photo = '请拍摄人脸照片'
  if (!reason.value.trim()) errors.reason = '请填写事由'
  if (!isIdCard(idNumber.value)) errors.idNumber = '请填写有效身份证号'

  const companion = parseOptionalNonNegativeInt(companionCount.value)
  if (companionCount.value.trim() !== '' && companion === null) {
    errors.companionCount = '随访人数需为非负整数'
  }

  return Object.keys(errors).length === 0
}

async function onSubmit(): Promise<void> {
  if (!validate()) {
    showToast('请检查表单标红项', 'error')
    return
  }

  submitting.value = true
  const hide = () => {
    submitting.value = false
  }

  try {
    const photoFile = photo.value
    if (!photoFile) {
      showToast('请拍摄人脸照片', 'error')
      return
    }

    const photoDataUrl = await fileToDataUrl(photoFile)
    const companion = parseOptionalNonNegativeInt(companionCount.value)

    await VisitorApi.submitPerson({
      visitorName: visitorName.value.trim(),
      mobile: mobile.value.trim(),
      photoDataUrl,
      photoFileName: photoFile.name,
      companionCount: companionCount.value.trim() === '' ? null : companion,
      reason: reason.value.trim(),
      idNumber: idNumber.value.trim(),
    })

    showToast('提交成功', 'success')
    visitorName.value = ''
    mobile.value = ''
    photo.value = null
    companionCount.value = ''
    reason.value = ''
    idNumber.value = ''
  } catch (e) {
    showToast(e instanceof Error ? e.message : '提交失败', 'error')
  } finally {
    hide()
  }
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-surface">
    <header
      class="sticky top-0 z-20 border-b border-border bg-surface-card/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface-card/75"
      style="padding-top: calc(0.75rem + env(safe-area-inset-top))"
    >
      <div class="mx-auto flex max-w-lg items-center gap-3">
        <RouterLink
          to="/"
          class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-white px-3 text-sm font-semibold text-ink"
        >
          返回
        </RouterLink>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg font-semibold text-ink">人员登记</h1>
          <p class="truncate text-xs text-ink-muted">访客信息 · 现场拍照</p>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 py-5">
      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="visitorName">访客姓名 <span class="text-danger">*</span></label>
        <input id="visitorName" v-model="visitorName" type="text" autocomplete="name" :class="fieldClass" />
        <p v-if="errors.visitorName" class="text-sm text-danger">{{ errors.visitorName }}</p>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="idNumber">身份证号 <span class="text-danger">*</span></label>
        <input id="idNumber" v-model="idNumber" type="text" inputmode="numeric" autocomplete="off" :class="fieldClass" />
        <p v-if="errors.idNumber" class="text-sm text-danger">{{ errors.idNumber }}</p>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="mobile">手机号 <span class="text-danger">*</span></label>
        <input id="mobile" v-model="mobile" type="tel" inputmode="numeric" autocomplete="tel" :class="fieldClass" />
        <p v-if="errors.mobile" class="text-sm text-danger">{{ errors.mobile }}</p>
      </div>

      <CapturePhotoField v-model="photo" label="现场照片" required capture="environment" :error="errors.photo" />

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="companionCount">随访人数（选填）</label>
        <input
          id="companionCount"
          v-model="companionCount"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="无则留空"
          :class="fieldClass"
        />
        <p v-if="errors.companionCount" class="text-sm text-danger">{{ errors.companionCount }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="reason">事由 <span class="text-danger">*</span></label>
        <textarea id="reason" v-model="reason" rows="3" placeholder="例如：拜访、送货、施工…" :class="fieldClass" />
        <p v-if="errors.reason" class="text-sm text-danger">{{ errors.reason }}</p>
      </div>



      <div class="h-24" aria-hidden="true" />
    </main>

    <div
      class="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-surface-card/85"
      style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
    >
      <div class="mx-auto max-w-lg">
        <button
          type="button"
          class="flex min-h-touch w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition disabled:opacity-60"
          :disabled="submitting"
          @click="onSubmit"
        >
          {{ submitting ? '提交中…' : '提交登记' }}
        </button>
      </div>
    </div>
  </div>
</template>
