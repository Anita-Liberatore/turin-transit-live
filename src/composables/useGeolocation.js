import { ref, onUnmounted } from 'vue'

const ERROR_MESSAGES = {
  1: 'Permesso negato — abilita la posizione nelle impostazioni del browser',
  2: 'Posizione non disponibile',
  3: 'Timeout geolocalizzazione',
}

export function useGeolocation() {
  const coords    = ref(null)   // { lat, lng, accuracy }
  const error     = ref(null)
  const loading   = ref(false)
  const active    = ref(false)
  const supported = 'geolocation' in navigator

  let watchId = null

  function start() {
    if (!supported) {
      error.value = 'Geolocalizzazione non supportata dal browser'
      return
    }
    loading.value = true
    active.value  = true
    error.value   = null

    watchId = navigator.geolocation.watchPosition(
      pos => {
        coords.value  = {
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        loading.value = false
      },
      err => {
        error.value   = ERROR_MESSAGES[err.code] ?? 'Errore geolocalizzazione'
        loading.value = false
        active.value  = false
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    )
  }

  function stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    coords.value  = null
    error.value   = null
    active.value  = false
    loading.value = false
  }

  function toggle() {
    active.value ? stop() : start()
  }

  onUnmounted(stop)

  return { coords, error, loading, active, supported, start, stop, toggle }
}
