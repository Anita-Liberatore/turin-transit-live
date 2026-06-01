import { ref, watch } from 'vue'
import { fetchStopInfo } from '@/services/gttApi'

export function useStopInfo(stopId) {
  const info    = ref(null)
  const loading = ref(false)

  async function load(id) {
    if (!id) { info.value = null; return }
    loading.value = true
    info.value    = await fetchStopInfo(id).catch(() => null)
    loading.value = false
  }

  watch(stopId, load, { immediate: true })

  return { info, loading }
}
