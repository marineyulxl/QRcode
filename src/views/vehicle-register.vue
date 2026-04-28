<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { VisitorApi } from '#/api/visitor-mock'
import CapturePhotoField from '#/components/capture-photo-field.vue'
import { VEHICLE_TYPES } from '#/constants/vehicle-types'
import { fileToDataUrl } from '#/utils/image-compress'
import { showToast } from '#/utils/toast-bus'
import { isIdCard, isMobile, isPlate } from '#/utils/validation'

const fieldClass =
  'w-full rounded-xl border border-border bg-white px-3 py-3 text-base text-ink outline-none ring-cta/20 focus:border-cta focus:ring-2'

const driverName = ref('')
const driverIdNumber = ref('')
const plateNumber = ref('')
const vehicleType = ref<(typeof VEHICLE_TYPES)[number]>('小型客车')
const mobile = ref('')
const driverPhoto = ref<File | null>(null)
const vehiclePhoto = ref<File | null>(null)

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

watch(plateNumber, (v) => {
  plateNumber.value = v.toUpperCase()
})

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!driverName.value.trim()) errors.driverName = '请填写司机姓名'
  if (!isIdCard(driverIdNumber.value)) errors.driverIdNumber = '请填写有效身份证号'
  if (!isPlate(plateNumber.value)) errors.plateNumber = '请填写有效车牌号'
  if (!vehicleType.value) errors.vehicleType = '请选择车辆类型'
  if (!isMobile(mobile.value)) errors.mobile = '请填写有效手机号'
  if (!driverPhoto.value) errors.driverPhoto = '请拍摄司机照片'
  if (!vehiclePhoto.value) errors.vehiclePhoto = '请拍摄车辆照片'

  return Object.keys(errors).length === 0
}

async function onSubmit(): Promise<void> {
  if (!validate()) {
    showToast('请检查表单标红项', 'error')
    return
  }

  submitting.value = true
  try {
    if (!driverPhoto.value || !vehiclePhoto.value) {
      showToast('请补全照片', 'error')
      return
    }

    const driverPhotoDataUrl = await fileToDataUrl(driverPhoto.value)
    const vehiclePhotoDataUrl = await fileToDataUrl(vehiclePhoto.value)

    await VisitorApi.submitVehicle({
      driverName: driverName.value.trim(),
      driverIdNumber: driverIdNumber.value.trim(),
      plateNumber: plateNumber.value.trim().toUpperCase(),
      vehicleType: vehicleType.value,
      mobile: mobile.value.trim(),
      driverPhotoDataUrl,
      driverPhotoFileName: driverPhoto.value.name,
      vehiclePhotoDataUrl,
      vehiclePhotoFileName: vehiclePhoto.value.name,
    })

    showToast('提交成功', 'success')
    driverName.value = ''
    driverIdNumber.value = ''
    plateNumber.value = ''
    vehicleType.value = '小型客车'
    mobile.value = ''
    driverPhoto.value = null
    vehiclePhoto.value = null
  } catch (e) {
    showToast(e instanceof Error ? e.message : '提交失败', 'error')
  } finally {
    submitting.value = false
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
          <h1 class="truncate text-lg font-semibold text-ink">车辆登记</h1>
          <p class="truncate text-xs text-ink-muted">司机 · 车牌 · 车辆照片</p>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 py-5">
      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="driverName">司机姓名 <span class="text-danger">*</span></label>
        <input id="driverName" v-model="driverName" type="text" autocomplete="name" :class="fieldClass" />
        <p v-if="errors.driverName" class="text-sm text-danger">{{ errors.driverName }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="driverIdNumber">身份证号 <span class="text-danger">*</span></label>
        <input id="driverIdNumber" v-model="driverIdNumber" type="text" inputmode="numeric" autocomplete="off" :class="fieldClass" />
        <p v-if="errors.driverIdNumber" class="text-sm text-danger">{{ errors.driverIdNumber }}</p>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="vmobile">手机号码 <span class="text-danger">*</span></label>
        <input id="vmobile" v-model="mobile" type="tel" inputmode="numeric" autocomplete="tel" :class="fieldClass" />
        <p v-if="errors.mobile" class="text-sm text-danger">{{ errors.mobile }}</p>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="plateNumber">车牌号 <span class="text-danger">*</span></label>
        <input id="plateNumber" v-model="plateNumber" type="text" autocomplete="off" autocapitalize="characters" :class="fieldClass" />
        <p v-if="errors.plateNumber" class="text-sm text-danger">{{ errors.plateNumber }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="vehicleType">车辆类型 <span class="text-danger">*</span></label>
        <select id="vehicleType" v-model="vehicleType" :class="fieldClass">
          <option v-for="t in VEHICLE_TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
        <p v-if="errors.vehicleType" class="text-sm text-danger">{{ errors.vehicleType }}</p>
      </div>

      <CapturePhotoField
        v-model="driverPhoto"
        label="司机自拍"
        required
        capture="user"
        :error="errors.driverPhoto"
      />

      <CapturePhotoField
        v-model="vehiclePhoto"
        label="车辆照片"
        required
        capture="environment"
        :error="errors.vehiclePhoto"
      />

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
