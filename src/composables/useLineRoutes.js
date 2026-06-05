import { ref } from 'vue'
import { fetchLineRouteVariants, fetchRouteShapes } from '@/services/gttApi'

export function useLineRoutes() {
  const routes = ref([])
  const loading = ref(false)
  const error = ref(null)
  let requestId = 0

  async function load(line) {
    const currentRequest = ++requestId
    routes.value = []
    error.value = null

    if (!line) return

    loading.value = true

    try {
      const variants = await fetchLineRouteVariants(line)
      const routesWithShapes = await Promise.all(
        variants.map(async variant => ({
          ...variant,
          shapes: await fetchRouteShapes(variant.line, variant.percorso, variant.verso),
        }))
      )

      if (currentRequest !== requestId) return
      routes.value = routesWithShapes.filter(route => route.shapes?.length)
    } catch (e) {
      if (currentRequest !== requestId) return
      error.value = e.message || 'Impossibile caricare il percorso della linea'
      routes.value = []
    } finally {
      if (currentRequest === requestId) {
        loading.value = false
      }
    }
  }

  function clear() {
    requestId++
    routes.value = []
    error.value = null
    loading.value = false
  }

  return { routes, loading, error, load, clear }
}
