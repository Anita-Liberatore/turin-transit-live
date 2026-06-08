import { createRouter, createWebHistory } from 'vue-router'

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

if (window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.slice(1)
  window.history.replaceState(null, '', cleanPath)
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title || 'GTT Torino Live'
})

export default router
