<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-surface px-5 pb-10 pt-[calc(2rem+env(safe-area-inset-top))]">
    <header class="mb-10 space-y-2">
      <p class="text-xs font-medium uppercase tracking-wide text-ink-muted">访客到访</p>
      <h1 class="text-2xl font-semibold text-ink">来访信息登记</h1>
      <p class="text-sm leading-relaxed text-ink-muted">
        请选择登记类型。信息仅用于到访备案，请如实填写。
      </p>
    </header>

    <main class="flex flex-1 flex-col justify-center gap-4">
      <RouterLink
        to="/person"
        class="flex min-h-[56px] items-center justify-between rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-card transition active:bg-primary-hover"
      >
        <span>人员登记</span>
        <span aria-hidden="true" class="text-primary-foreground/80">›</span>
      </RouterLink>

      <RouterLink
        to="/vehicle"
        class="flex min-h-[56px] items-center justify-between rounded-2xl border border-border bg-surface-card px-5 py-4 text-base font-semibold text-ink shadow-card transition active:bg-surface"
      >
        <span>车辆登记</span>
        <span aria-hidden="true" class="text-ink-muted">›</span>
      </RouterLink>
    </main>
<!-- 
    <footer class="mt-auto pt-8 text-center text-xs text-ink-muted">
      请使用 HTTPS 链接扫码进入
    </footer> -->
  </div>
</template>
