import { ref } from 'vue'
import { searchStopsByName } from '@/services/gttApi'

export function useStopSearch() {
  const results = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function search(query) {
    const trimmed = query?.trim()
    if (!trimmed) {
      clear()
      return []
    }

    loading.value = true
    error.value = null

    try {
      const items = await searchStopsByName(trimmed)
      results.value = items
      return items
    } catch (err) {
      results.value = []
      error.value = err?.message || 'Errore durante la ricerca della fermata'
      return []
    } finally {
      loading.value = false
    }
  }

  function clear() {
    results.value = []
    error.value = null
    loading.value = false
  }

  return { results, loading, error, search, clear }
}
