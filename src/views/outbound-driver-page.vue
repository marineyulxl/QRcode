<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import {
  mockFetchLatestHikvisionForDriver,
  mockRefreshLatestHikvisionEvent,
  submitOutboundDriver,
} from '#/api/outbound-mock'
import CapturePhotoField from '#/components/capture-photo-field.vue'
import { fileToDataUrl } from '#/utils/image-compress'
import { showToast } from '#/utils/toast-bus'
import { isIdCard, isMobile } from '#/utils/validation'

const fieldClass =
  'w-full rounded-xl border border-border bg-white px-3 py-3 text-base text-ink outline-none ring-cta/20 focus:border-cta focus:ring-2'

const hikLoading = ref(true)
const hikRefreshing = ref(false)
const hikError = ref('')
const hikPlate = ref('')
const hikVehicleUrl = ref('')

const driverName = ref('')
const mobile = ref('')
const idNumber = ref('')
const driverPhoto = ref<File | null>(null)

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

async function loadHik(): Promise<void> {
  hikLoading.value = true
  hikError.value = ''
  try {
    const data = await mockFetchLatestHikvisionForDriver()
    hikPlate.value = data.plateNumber
    hikVehicleUrl.value = data.vehiclePhotoUrl
  } catch (e) {
    hikError.value = e instanceof Error ? e.message : '车辆信息加载失败'
    hikPlate.value = ''
    hikVehicleUrl.value = ''
  } finally {
    hikLoading.value = false
  }
}

async function onRefreshHik(): Promise<void> {
  hikRefreshing.value = true
  hikError.value = ''
  try {
    const data = await mockRefreshLatestHikvisionEvent()
    hikPlate.value = data.plateNumber
    hikVehicleUrl.value = data.vehiclePhotoUrl
  } catch (e) {
    showToast(e instanceof Error ? e.message : '刷新失败', 'error')
  } finally {
    hikRefreshing.value = false
  }
}

onMounted(() => {
  void loadHik()
})

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (hikLoading.value || !hikPlate.value || !hikVehicleUrl.value) {
    errors.hik = hikError.value || '请等待车辆信息加载'
  }
  if (!driverName.value.trim()) errors.driverName = '请填写司机姓名'
  if (!isMobile(mobile.value)) errors.mobile = '请填写有效手机号'
  if (!isIdCard(idNumber.value)) errors.idNumber = '请填写有效身份证号'
  if (!driverPhoto.value) errors.driverPhoto = '请拍摄司机照片'

  return Object.keys(errors).length === 0
}

async function onSubmit(): Promise<void> {
  if (!validate()) {
    showToast('请检查表单标红项', 'error')
    return
  }

  const photoFile = driverPhoto.value
  if (!photoFile) {
    showToast('请拍摄司机照片', 'error')
    return
  }

  submitting.value = true
  try {
    const driverPhotoDataUrl = await fileToDataUrl(photoFile)
    await submitOutboundDriver({
      driverName: driverName.value.trim(),
      mobile: mobile.value.trim(),
      idNumber: idNumber.value.trim(),
      driverPhotoDataUrl,
      driverPhotoFileName: photoFile.name,
      plateNumber: hikPlate.value.trim().toUpperCase(),
      vehiclePhotoUrl: hikVehicleUrl.value,
    })
    showToast('提交成功', 'success')
    driverName.value = ''
    mobile.value = ''
    idNumber.value = ''
    driverPhoto.value = null
    await loadHik()
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
      <div class="mx-auto max-w-lg">
        <h1 class="text-lg font-semibold text-ink">出货单 · 司机填报</h1>
      </div>
    </header>

    <main class="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 py-5">
      <section class="rounded-2xl border border-border bg-surface-card p-4 shadow-card">
        <div class="flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold text-ink">车辆识别信息</h2>
          <button
            type="button"
            class="shrink-0 text-xs font-semibold text-cta hover:text-cta-hover disabled:opacity-50"
            :disabled="hikLoading || hikRefreshing"
            @click="onRefreshHik"
          >
            {{ hikRefreshing ? '刷新中…' : '刷新识别结果' }}
          </button>
        </div>

        <div v-if="hikLoading" class="mt-3 text-sm text-ink-muted">正在获取识别结果…</div>
        <div v-else-if="hikError" class="mt-3 text-sm text-danger">{{ hikError }}</div>
        <div v-else class="mt-3 space-y-2">
          <p class="text-sm">
            <span class="text-ink-muted">识别车牌</span>
            <span class="ml-2 font-semibold text-ink">{{ hikPlate }}</span>
          </p>
          <div class="overflow-hidden rounded-xl border border-border">
            <img :src="hikVehicleUrl" alt="车辆照片" class="max-h-48 w-full object-cover" />
          </div>
        </div>
        <p v-if="errors.hik" class="mt-2 text-sm text-danger">{{ errors.hik }}</p>
      </section>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="od-name">司机姓名 <span class="text-danger">*</span></label>
        <input id="od-name" v-model="driverName" type="text" autocomplete="name" :class="fieldClass" />
        <p v-if="errors.driverName" class="text-sm text-danger">{{ errors.driverName }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="od-mobile">手机号 <span class="text-danger">*</span></label>
        <input id="od-mobile" v-model="mobile" type="tel" inputmode="numeric" autocomplete="tel" :class="fieldClass" />
        <p v-if="errors.mobile" class="text-sm text-danger">{{ errors.mobile }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="od-id">身份证号码 <span class="text-danger">*</span></label>
        <input id="od-id" v-model="idNumber" type="text" inputmode="numeric" autocomplete="off" :class="fieldClass" />
        <p v-if="errors.idNumber" class="text-sm text-danger">{{ errors.idNumber }}</p>
      </div>

      <CapturePhotoField
        v-model="driverPhoto"
        label="司机照片"
        required
        capture="user"
        :error="errors.driverPhoto"
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
          :disabled="submitting || hikLoading"
          @click="onSubmit"
        >
          {{ submitting ? '提交中…' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>
