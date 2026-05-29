import { computed } from 'vue'

export function useTimeAgo(dateRef) {
  return computed(() => {
    if (!dateRef.value) return ''
    const diff = Math.round((Date.now() - dateRef.value) / 1000)
    if (diff < 60) return `${diff}s fa`
    return `${Math.round(diff / 60)}m fa`
  })
}
