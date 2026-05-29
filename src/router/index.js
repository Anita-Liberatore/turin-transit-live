import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'GTT Torino Live' }
  },
  {
    path: '/fermate',
    name: 'stops',
    component: () => import('@/views/StopsView.vue'),
    meta: { title: 'Orari Fermate' }
  },
  {
    path: '/mappa',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { title: 'Mappa Live' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title || 'GTT Torino Live'
})

export default router
