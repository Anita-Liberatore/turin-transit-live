import { ref, onUnmounted } from 'vue'
import { fetchVehiclePositions } from '@/services/matoApi'

export function useVehicleMap(autoRefreshMs = 15000) {
  const vehicles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)
  let timer = null

  async function load(line) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchVehiclePositions(line)
      vehicles.value = Array.isArray(data) ? data : (data.vehicles || data.data || [])
      lastUpdate.value = new Date()
    } catch (e) {
      error.value = e.message
      vehicles.value = []
    } finally {
      loading.value = false
    }
  }

  function startPolling(line) {
    stopPolling()
    load(line)
    timer = setInterval(() => load(line), autoRefreshMs)
  }

  function stopPolling() {
    if (timer) clearInterval(timer)
  }

  onUnmounted(stopPolling)

  return { vehicles, loading, error, lastUpdate, load, startPolling, stopPolling }
}
