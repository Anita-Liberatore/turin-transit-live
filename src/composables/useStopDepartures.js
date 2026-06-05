import { ref, watch, onUnmounted } from 'vue'
import { fetchStopLines } from '@/services/gttApi'

const REFRESH_INTERVAL_MS = 30_000

export function useStopDepartures(stopId) {
  const lines   = ref([])
  const loading = ref(false)
  const error   = ref(null)
  let timer = null

  async function load() {
    if (!stopId.value) return
    loading.value = true
    error.value = null
    try {
      lines.value = await fetchStopLines(stopId.value)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function startPolling() {
    clearInterval(timer)
    lines.value = []
    load()
    timer = setInterval(load, REFRESH_INTERVAL_MS)
  }

  watch(stopId, val => {
    if (val) startPolling()
    else { clearInterval(timer); lines.value = [] }
  }, { immediate: true })

  onUnmounted(() => clearInterval(timer))

  return { lines, loading, error, refresh: load }
}
