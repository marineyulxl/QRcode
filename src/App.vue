<script setup lang="ts">
import { RouterView } from 'vue-router'

import { toastState } from '#/utils/toast-bus'
</script>

<template>
  <RouterView />

  <Transition name="fade">
    <div
      v-if="toastState.show"
      class="fixed left-1/2 top-[calc(12px+env(safe-area-inset-top))] z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-medium shadow-card"
      :class="
        toastState.tone === 'success'
          ? 'bg-primary text-primary-foreground'
          : 'bg-danger text-white'
      "
      role="status"
    >
      {{ toastState.text }}
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
