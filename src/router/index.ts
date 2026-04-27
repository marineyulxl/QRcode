import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'entry',
    component: () => import('../views/entry-page.vue'),
    meta: { title: '来访登记' },
  },
  {
    path: '/person',
    name: 'person',
    component: () => import('../views/person-register.vue'),
    meta: { title: '人员登记' },
  },
  {
    path: '/vehicle',
    name: 'vehicle',
    component: () => import('../views/vehicle-register.vue'),
    meta: { title: '车辆登记' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : '来访登记'
  document.title = title
})
