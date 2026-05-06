<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'

import type { OutboundCategoryValue } from '#/constants/outbound-category-types'
import { OUTBOUND_CATEGORIES, categoryOptionLabel } from '#/constants/outbound-category-types'
import {
  getWarehousePlateOptions,
  submitOutboundWarehouse,
  type WarehousePlateOption,
} from '#/api/outbound-mock'
import { showToast } from '#/utils/toast-bus'
import { parsePositiveInt } from '#/utils/validation'

const fieldClass =
  'w-full rounded-xl border border-border bg-white px-3 py-3 text-base text-ink outline-none ring-cta/20 focus:border-cta focus:ring-2'

const plateOptions = ref<WarehousePlateOption[]>([])
const selectedPlate = ref('')

const selectedRow = ref<WarehousePlateOption | null>(null)

const materialName = ref('')
const quantity = ref('')
const categoryType = ref<OutboundCategoryValue>('maintenance')

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

function syncPlateList(): void {
  const prev = selectedPlate.value
  plateOptions.value = getWarehousePlateOptions()
  const stillValid = prev !== '' && plateOptions.value.some((o) => o.plateNumber === prev)
  selectedPlate.value = stillValid ? prev : ''
  applySelectedRow()
}

function applySelectedRow(): void {
  const p = selectedPlate.value.trim().toUpperCase()
  if (!p) {
    selectedRow.value = null
    return
  }
  selectedRow.value = plateOptions.value.find((o) => o.plateNumber.toUpperCase() === p) ?? null
}

watch(selectedPlate, applySelectedRow)

onMounted(() => {
  syncPlateList()
})

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!selectedPlate.value.trim()) {
    errors.plate = '请选择车牌号码'
  } else if (!selectedRow.value) {
    errors.plate = '所选车辆无效，请同步列表后重试'
  }

  if (!materialName.value.trim()) {
    errors.materialName = '请填写物资名称'
  }

  if (parsePositiveInt(quantity.value) === null) {
    errors.quantity = '请填写大于 0 的整数数量'
  }

  return Object.keys(errors).length === 0
}

async function onSubmit(): Promise<void> {
  if (!validate()) {
    showToast('请检查表单标红项', 'error')
    return
  }

  const row = selectedRow.value
  const q = parsePositiveInt(quantity.value)
  if (!row || q === null) {
    showToast('请补全必填项', 'error')
    return
  }

  submitting.value = true
  try {
    await submitOutboundWarehouse({
      plateNumber: row.plateNumber,
      vehiclePhotoUrl: row.vehiclePhotoUrl,
      materialName: materialName.value.trim(),
      quantity: q,
      categoryType: categoryType.value,
    })
    showToast('提交成功', 'success')
    materialName.value = ''
    quantity.value = ''
    categoryType.value = 'maintenance'
    selectedPlate.value = ''
    syncPlateList()
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
        <h1 class="text-lg font-semibold text-ink">出货单 · 库管填报</h1>
      </div>
    </header>

    <main class="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 py-5">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label class="text-sm font-medium text-ink" for="ow-plate">车牌号码 <span class="text-danger">*</span></label>
          <button type="button" class="shrink-0 text-xs font-semibold text-cta hover:text-cta-hover" @click="syncPlateList">
            同步列表
          </button>
        </div>
        <select id="ow-plate" v-model="selectedPlate" :class="fieldClass" :disabled="plateOptions.length === 0">
          <option disabled value="">{{ plateOptions.length === 0 ? '暂无待出库车辆' : '请选择' }}</option>
          <option v-for="o in plateOptions" :key="o.plateNumber" :value="o.plateNumber">
            {{ o.plateNumber }}
          </option>
        </select>
        <p v-if="plateOptions.length === 0" class="text-xs text-ink-muted">列表由系统下发：当前无已完成进场登记的车辆，司机提交后可同步列表。</p>
        <p v-if="errors.plate" class="text-sm text-danger">{{ errors.plate }}</p>
      </div>

      <template v-if="selectedRow">
        <section class="space-y-2 rounded-2xl border border-border bg-surface-card p-4 shadow-card">
          <h2 class="text-sm font-semibold text-ink">车辆照片</h2>
          <div class="overflow-hidden rounded-xl border border-border">
            <img :src="selectedRow.vehiclePhotoUrl" alt="车辆照片" class="max-h-48 w-full object-cover" />
          </div>
        </section>

        <section class="space-y-3 rounded-2xl border border-border bg-surface-card p-4 shadow-card">
          <h2 class="text-sm font-semibold text-ink">司机登记信息</h2>
          <dl class="grid gap-2 text-sm">
            <div class="flex justify-between gap-2">
              <dt class="text-ink-muted">姓名</dt>
              <dd class="font-medium text-ink">{{ selectedRow.driverName }}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-ink-muted">手机号码</dt>
              <dd class="font-medium text-ink">{{ selectedRow.driverMobile }}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-ink-muted">居民身份证号</dt>
              <dd class="break-all font-medium text-ink">{{ selectedRow.driverIdNumber }}</dd>
            </div>
          </dl>
        </section>
      </template>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="ow-material">物资名称 <span class="text-danger">*</span></label>
        <input id="ow-material" v-model="materialName" type="text" autocomplete="off" :class="fieldClass" />
        <p v-if="errors.materialName" class="text-sm text-danger">{{ errors.materialName }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="ow-qty">数量 <span class="text-danger">*</span></label>
        <input id="ow-qty" v-model="quantity" type="text" inputmode="numeric" autocomplete="off" placeholder="请输入正整数" :class="fieldClass" />
        <p v-if="errors.quantity" class="text-sm text-danger">{{ errors.quantity }}</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-ink" for="ow-cat">出库类别 <span class="text-danger">*</span></label>
        <select id="ow-cat" v-model="categoryType" :class="fieldClass">
          <option v-for="a in OUTBOUND_CATEGORIES" :key="a.value" :value="a.value">
            {{ categoryOptionLabel(a.value) }}
          </option>
        </select>
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
          :disabled="submitting || plateOptions.length === 0"
          @click="onSubmit"
        >
          {{ submitting ? '提交中…' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>
