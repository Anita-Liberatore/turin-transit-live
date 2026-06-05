import { ref, watch } from 'vue'
import { fetchStopInfo } from '@/services/gttApi'

export function useStopInfo(stopId) {
  const info    = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  async function load(id) {
    if (!id) {
      info.value = null
      error.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      info.value = await fetchStopInfo(id)
    } catch (e) {
      info.value = null
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  watch(stopId, load, { immediate: true })

  return { info, loading, error }
}
