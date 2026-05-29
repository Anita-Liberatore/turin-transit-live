import { ref, watch, onUnmounted } from 'vue'
import { fetchStopDepartures } from '@/services/gttApi'

export function useStopDepartures(stopId, autoRefreshMs = 30000) {
  const departures = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)
  let timer = null

  async function load() {
    if (!stopId.value) return
    loading.value = true
    error.value = null
    try {
      departures.value = await fetchStopDepartures(stopId.value)
      lastUpdate.value = new Date()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function startPolling() {
    stopPolling()
    load()
    timer = setInterval(load, autoRefreshMs)
  }

  function stopPolling() {
    if (timer) clearInterval(timer)
  }

  watch(stopId, (val) => {
    if (val) startPolling()
    else { stopPolling(); departures.value = [] }
  }, { immediate: true })

  onUnmounted(stopPolling)

  return { departures, loading, error, lastUpdate, refresh: load }
}
